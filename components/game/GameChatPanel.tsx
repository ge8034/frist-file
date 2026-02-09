/**
 * 游戏聊天面板组件
 * 基于 Retro-Futurism 设计系统 - 游戏版本
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, User, Clock, MessageSquare, Gamepad2 } from 'lucide-react'
import { supabase } from '@/lib/infrastructure/supabase/client'
import { getCurrentUserId, getCurrentUserNickname } from '@/lib/store/authStore'

interface GameChatMessage {
  id: string
  roomId: string
  userId: string
  userNickname: string
  content: string
  createdAt: Date
  type: 'player' | 'system' | 'game'
}

interface GameChatPanelProps {
  roomId: string
}

export default function GameChatPanel({ roomId }: GameChatPanelProps) {
  const [messages, setMessages] = useState<GameChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const currentUserId = getCurrentUserId()
  const currentUserNickname = getCurrentUserNickname()

  // 初始化系统消息
  useEffect(() => {
    const systemMessages: GameChatMessage[] = [
      {
        id: 'system-1',
        roomId,
        userId: 'system',
        userNickname: '系统',
        content: '游戏聊天已连接',
        createdAt: new Date(),
        type: 'system'
      },
      {
        id: 'system-2',
        roomId,
        userId: 'system',
        userNickname: '系统',
        content: '使用聊天功能与其他玩家交流',
        createdAt: new Date(Date.now() - 1000),
        type: 'system'
      }
    ]
    setMessages(systemMessages)
  }, [roomId])

  // 订阅实时消息
  useEffect(() => {
    const channel = supabase
      .channel(`game-chat:${roomId}`)
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
          const message: GameChatMessage = {
            id: newMsg.id,
            roomId: newMsg.room_id,
            userId: newMsg.user_id,
            userNickname: newMsg.user_nickname,
            content: newMsg.content,
            createdAt: new Date(newMsg.created_at),
            type: 'player'
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
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    } catch (err) {
      console.error('发送消息失败:', err)
      setError('发送消息失败')
    } finally {
      setIsSending(false)
    }
  }

  // 发送游戏快捷消息
  const sendQuickMessage = (message: string) => {
    setNewMessage(message)
    // 自动发送
    setTimeout(() => {
      const mockEvent = { preventDefault: () => {} } as React.FormEvent
      sendMessage(mockEvent)
    }, 100)
  }

  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
  }

  // 自动滚动
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="relative">
      {/* CRT 效果 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent opacity-20 pointer-events-none"></div>

      <div className="relative bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-xl overflow-hidden">
        {/* 聊天头部 */}
        <div className="p-4 border-b border-gray-800 bg-gradient-to-r from-gray-900 to-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">游戏聊天</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-sm text-gray-400">
                    {isConnected ? '实时连接' : '连接中...'}
                  </span>
                </div>
              </div>
            </div>
            <div className="px-3 py-1 bg-gray-800/50 rounded-lg">
              <span className="text-xs text-gray-400">{messages.length} 条</span>
            </div>
          </div>
        </div>

        {/* 聊天消息区域 */}
        <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-950/50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`group relative p-3 rounded-lg border transition-all duration-300 ${
                message.type === 'system'
                  ? 'border-gray-700 bg-gray-900/30'
                  : message.type === 'game'
                  ? 'border-cyan-700 bg-cyan-900/20'
                  : message.userId === currentUserId
                  ? 'border-green-500/30 bg-green-900/10'
                  : 'border-gray-800 bg-gray-900/50'
              }`}
            >
              {/* 消息头 */}
              <div className="flex items-center gap-2 mb-2">
                {message.type === 'system' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center">
                      <Gamepad2 className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-sm text-gray-400">系统消息</span>
                  </div>
                ) : message.type === 'game' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-cyan-700 to-cyan-900 rounded-full flex items-center justify-center">
                      <Gamepad2 className="w-3 h-3 text-cyan-400" />
                    </div>
                    <span className="text-sm text-cyan-400">游戏事件</span>
                  </div>
                ) : (
                  <>
                    <div className="w-6 h-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className={`text-sm font-medium ${
                      message.userId === currentUserId ? 'text-green-300' : 'text-gray-300'
                    }`}>
                      {message.userNickname}
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
                message.type === 'system' ? 'text-gray-400 italic' :
                message.type === 'game' ? 'text-cyan-300' :
                'text-gray-200'
              }`}>
                {message.content}
              </div>

              {/* 悬停效果 */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-green-500/5 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity pointer-events-none"></div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 快捷消息按钮 */}
        <div className="p-3 border-t border-gray-800 bg-gray-900/80">
          <div className="flex flex-wrap gap-2 mb-3">
            <button
              onClick={() => sendQuickMessage('打得好！')}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              打得好！
            </button>
            <button
              onClick={() => sendQuickMessage('该你了')}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              该你了
            </button>
            <button
              onClick={() => sendQuickMessage('炸弹！')}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              炸弹！
            </button>
            <button
              onClick={() => sendQuickMessage('快点出牌')}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              快点出牌
            </button>
            <button
              onClick={() => sendQuickMessage('赢了！')}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-lg hover:bg-gray-700 hover:text-white transition-all duration-300"
            >
              赢了！
            </button>
          </div>

          {/* 消息输入 */}
          <form onSubmit={sendMessage} className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="发送消息... (Enter 发送)"
                maxLength={100}
                disabled={isSending}
                className="w-full pl-3 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendMessage(e)
                  }
                }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">
                {newMessage.length}/100
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-4 py-2 bg-gradient-to-r from-green-600 to-cyan-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}