/**
 * 聊天面板组件
 * 基于 Retro-Futurism 设计系统 - CRT 终端风格
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Clock, MessageSquare, AlertCircle } from 'lucide-react'
import { supabase } from '@/lib/infrastructure/supabase/client'
import { getCurrentUserId, getCurrentUserNickname } from '@/lib/store/authStore'

interface ChatMessage {
  id: string
  roomId: string
  userId: string
  userNickname: string
  content: string
  createdAt: Date
  type?: 'system' | 'player'
}

interface ChatPanelProps {
  roomId: string
}

export default function ChatPanel({ roomId }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = getCurrentUserId()
  const currentUserNickname = getCurrentUserNickname()

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 初始加载聊天消息
  useEffect(() => {
    loadMessages()
  }, [roomId])

  // 订阅实时消息
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any
          const message: ChatMessage = {
            id: newMsg.id,
            roomId: newMsg.room_id,
            userId: newMsg.user_id,
            userNickname: newMsg.user_nickname,
            content: newMsg.content,
            createdAt: new Date(newMsg.created_at),
            type: newMsg.type || 'player',
          }
          setMessages(prev => [...prev, message])
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId])

  // 加载历史消息
  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(50)

      if (error) throw error

      const loadedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        roomId: msg.room_id,
        userId: msg.user_id,
        userNickname: msg.user_nickname,
        content: msg.content,
        createdAt: new Date(msg.created_at),
        type: msg.type || 'player',
      }))

      setMessages(loadedMessages)
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('加载消息失败:', err)
      setError('无法加载聊天历史')
    }
  }

  // 发送消息
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    setError(null)

    try {
      const messageData = {
        room_id: roomId,
        user_id: currentUserId,
        user_nickname: currentUserNickname,
        content: newMessage.trim(),
        type: 'player',
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('chat_messages')
        .insert(messageData)

      if (error) throw error

      setNewMessage('')
      setTimeout(scrollToBottom, 100)
    } catch (err) {
      console.error('发送消息失败:', err)
      setError('发送消息失败，请重试')
    } finally {
      setIsSending(false)
    }
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 消息自动滚动
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <div className="relative">
      {/* CRT 扫描线效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent opacity-30 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent opacity-20 pointer-events-none"></div>

      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
        {/* 聊天头部 */}
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">房间聊天</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-400">
                    {isConnected ? '实时连接已建立' : '连接中...'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-gray-800/50 rounded-lg">
                <span className="text-xs text-gray-400">{messages.length} 条消息</span>
              </div>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* 聊天消息区域 */}
        <div className="h-96 overflow-y-auto p-4 space-y-3 bg-gray-950/50">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-600">
              <MessageSquare className="w-12 h-12 mb-4 opacity-30" />
              <p className="text-gray-500">还没有消息，开始聊天吧！</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`group relative p-3 rounded-lg border transition-all duration-300 ${
                  message.userId === currentUserId
                    ? 'border-cyan-500/30 bg-cyan-900/10'
                    : message.type === 'system'
                    ? 'border-gray-700 bg-gray-900/30'
                    : 'border-gray-800 bg-gray-900/50'
                }`}
              >
                {/* 消息头 */}
                <div className="flex items-center gap-2 mb-2">
                  {message.type === 'system' ? (
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className="text-sm text-gray-400">系统消息</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-gray-400" />
                      </div>
                      <span className={`text-sm font-medium ${
                        message.userId === currentUserId ? 'text-cyan-300' : 'text-gray-300'
                      }`}>
                        {message.userNickname}
                        {message.userId === currentUserId && (
                          <span className="ml-2 text-xs text-cyan-500">(我)</span>
                        )}
                      </span>
                    </>
                  )}
                  <span className="text-xs text-gray-500 ml-auto">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {formatTime(message.createdAt)}
                  </span>
                </div>

                {/* 消息内容 */}
                <div className={`text-sm ${
                  message.type === 'system' ? 'text-gray-400 italic' : 'text-gray-200'
                }`}>
                  {message.content}
                </div>

                {/* 悬停效果 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-cyan-500/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity pointer-events-none"></div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 消息输入区域 */}
        <div className="p-4 border-t border-gray-800 bg-gray-900/80">
          <form onSubmit={sendMessage} className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="输入消息... (按 Enter 发送)"
                maxLength={200}
                disabled={isSending}
                className="w-full pl-4 pr-12 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(e)
                  }
                }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {newMessage.length}/200
                  </span>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-medium rounded-lg hover:from-cyan-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
            >
              {isSending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span className="hidden sm:inline">发送中...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span className="hidden sm:inline">发送</span>
                </>
              )}
            </button>
          </form>

          {/* 快捷提示 */}
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <div>
              使用 <kbd className="px-1 py-0.5 bg-gray-800 rounded text-gray-300">Enter</kbd> 发送消息
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>实时聊天</span>
            </div>
          </div>
        </div>
      </div>

      {/* CRT 角标装饰 */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500 opacity-50"></div>
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-purple-500 opacity-50"></div>
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-purple-500 opacity-50"></div>
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500 opacity-50"></div>
    </div>
  )
}