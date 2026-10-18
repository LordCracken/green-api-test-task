import { useState, type FormEvent } from 'react'
import { checkAccount, type CheckAccountQuery } from '../api/greenApi'
import type { Chat, Credentials } from '../types'
import { formatPhone, normalizePhone, normalizeUsername } from '../utils/phone'
import { PlusIcon } from './icons'

interface NewChatFormProps {
  credentials: Credentials
  onCreate: (chat: Chat) => void
}

function parseContact(input: string): { query: CheckAccountQuery; name: string } | null {
  if (input.trim().startsWith('@')) {
    const username = normalizeUsername(input)
    return username ? { query: { username }, name: username } : null
  }
  const phoneNumber = normalizePhone(input)
  return phoneNumber ? { query: { phoneNumber }, name: formatPhone(phoneNumber) } : null
}

export function NewChatForm({ credentials, onCreate }: NewChatFormProps) {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const contact = parseContact(value)
    if (!contact) {
      setError('Введите номер в международном формате или @username')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Telegram адресует чаты по chatId, поэтому сначала узнаём его по номеру
      const { exist, chatId } = await checkAccount(credentials, contact.query)
      if (!exist) {
        setError('Аккаунт Telegram не найден или скрыт настройками приватности')
        return
      }
      onCreate({ id: chatId, name: contact.name, createdAt: Date.now() })
      setValue('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось проверить номер')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="new-chat" onSubmit={handleSubmit}>
      <div className="new-chat__row">
        <input
          className="new-chat__input"
          type="text"
          inputMode="tel"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            setError(null)
          }}
          placeholder="Номер телефона или @username"
          aria-label="Номер телефона или имя пользователя получателя"
        />
        <button
          className="icon-button icon-button--accent"
          type="submit"
          disabled={loading || !value.trim()}
          title="Создать чат"
          aria-label="Создать чат"
        >
          <PlusIcon width={20} height={20} />
        </button>
      </div>
      {error && (
        <p className="form-error form-error--small" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
