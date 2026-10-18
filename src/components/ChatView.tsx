import { Fragment, useEffect, useRef } from 'react'
import type { Chat, Message } from '../types'
import { formatDay, isSameDay } from '../utils/date'
import { Avatar } from './Avatar'
import { BackIcon, ChatBubbleIcon } from './icons'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

interface ChatViewProps {
  chat: Chat | null
  messages: Message[]
  onSend: (text: string) => void
  onBack: () => void
}

export function ChatView({ chat, messages, onSend, onBack }: ChatViewProps) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [chat?.id, messages.length])

  if (!chat) {
    return (
      <section className="chat chat--empty">
        <div className="chat__placeholder">
          <ChatBubbleIcon width={48} height={48} />
          <p>Выберите чат или создайте новый по номеру телефона</p>
        </div>
      </section>
    )
  }

  return (
    <section className="chat">
      <header className="chat__header">
        <button
          className="icon-button chat__back"
          type="button"
          onClick={onBack}
          aria-label="Назад к списку чатов"
        >
          <BackIcon width={22} height={22} />
        </button>
        <Avatar id={chat.id} name={chat.name} size={40} />
        <div className="chat__title">
          <span className="chat__name">{chat.name}</span>
          <span className="chat__subtitle">Telegram</span>
        </div>
      </header>

      <div className="chat__messages" ref={listRef}>
        {messages.length === 0 && <p className="chat__hint">Напишите первое сообщение</p>}
        {messages.map((message, index) => {
          const previous = messages[index - 1]
          const showDay = !previous || !isSameDay(previous.timestamp, message.timestamp)
          return (
            <Fragment key={message.id}>
              {showDay && <div className="chat__day">{formatDay(message.timestamp)}</div>}
              <MessageBubble message={message} />
            </Fragment>
          )
        })}
      </div>

      <MessageInput key={chat.id} onSend={onSend} />
    </section>
  )
}
