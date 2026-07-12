import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'

export default function Chat({ clientId, shooterId, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [conversationId, setConversationId] = useState(null)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    findOrCreateConversation()
    return () => {
      const channel = supabase.channel('messages_realtime')
      channel.unsubscribe()
    }
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function findOrCreateConversation() {
    let { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(client_id.eq.${clientId},shooter_id.eq.${shooterId}),and(client_id.eq.${shooterId},shooter_id.eq.${clientId})`)
      .maybeSingle()

    let convId
    if (existing) {
      convId = existing.id
    } else {
      const { data } = await supabase.from('conversations').insert({
        client_id: clientId,
        shooter_id: shooterId
      }).select('id').single()
      convId = data.id
    }

    setConversationId(convId)
    loadMessages(convId)
    subscribeMessages(convId)
  }

  async function loadMessages(convId) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true })
    setMessages(data || [])
    setLoading(false)
  }

  function subscribeMessages(convId) {
    supabase
      .channel('messages_realtime_' + convId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${convId}` },
        payload => {
          setMessages(prev => [...prev, payload.new])
        }
      )
      .subscribe()
  }

  async function sendMessage(e) {
    e.preventDefault()
    if (!text.trim()) return
    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      message_text: text.trim()
    })
    if (!error) setText('')
  }

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl shadow-sm border">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No messages yet. Start a conversation!</p>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                msg.sender_id === currentUserId
                  ? 'bg-blue-600 text-white rounded-br-md'
                  : 'bg-gray-100 text-gray-900 rounded-bl-md'
              }`}>
                <p className="text-sm">{msg.message_text}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === currentUserId ? 'text-blue-200' : 'text-gray-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t p-4 flex gap-2">
        <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:border-blue-500" />
        <button type="submit" disabled={!text.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  )
}
