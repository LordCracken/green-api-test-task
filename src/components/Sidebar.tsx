import type { Chat, Credentials, Message } from '../types'
import { formatListTime } from '../utils/date'
import { Avatar } from './Avatar'
import { LogoutIcon } from './icons'
import { NewChatForm } from './NewChatForm'

interface SidebarProps {
  credentials: Credentials
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null
  connectionError: string | null
  onSelect: (chatId: string) => void
  onCreate: (chat: Chat) => void
  onLogout: () => void
}

export function Sidebar({
  credentials,
  chats,
  messages,
  activeChatId,
  connectionError,
  onSelect,
  onCreate,
  onLogout,
}: SidebarProps) {
  const items = chats
    .map((chat) => {
      const list = messages[chat.id] ?? []
      const last = list.at(-1)
      return { chat, last, sortKey: last?.timestamp ?? chat.createdAt }
    })
    .sort((a, b) => b.sortKey - a.sortKey)

  return (
    <aside className="sidebar">
      <header className="sidebar__header">
        <h1 className="sidebar__title">Чаты</h1>
        <button
          className="icon-button"
          type="button"
          onClick={onLogout}
          title="Выйти"
          aria-label="Выйти"
        >
          <LogoutIcon width={20} height={20} />
        </button>
      </header>

      <NewChatForm credentials={credentials} onCreate={onCreate} />

      {connectionError && (
        <p className="connection-error" role="status">
          Нет связи с GREEN-API: {connectionError}
        </p>
      )}

      <ul className="chat-list">
        {items.length === 0 && (
          <li className="chat-list__empty">
            Введите номер телефона или @username получателя, чтобы начать переписку
          </li>
        )}
        {items.map(({ chat, last }) => (
          <li key={chat.id}>
            <button
              type="button"
              className={`chat-item${chat.id === activeChatId ? ' chat-item--active' : ''}`}
              onClick={() => onSelect(chat.id)}
            >
              <Avatar id={chat.id} name={chat.name} />
              <span className="chat-item__body">
                <span className="chat-item__top">
                  <span className="chat-item__name">{chat.name}</span>
                  {last && <span className="chat-item__time">{formatListTime(last.timestamp)}</span>}
                </span>
                <span className="chat-item__preview">
                  {last ? (
                    <>
                      {last.direction === 'outgoing' && <span className="chat-item__you">Вы: </span>}
                      {last.text}
                    </>
                  ) : (
                    'Нет сообщений'
                  )}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <footer className="sidebar__footer">Инстанс {credentials.idInstance}</footer>
    </aside>
  )
}
