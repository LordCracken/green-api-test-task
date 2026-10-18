import { useState, type FormEvent } from 'react'
import { checkAccount } from '../api/greenApi'
import type { Chat, Credentials } from '../types'
import { formatPhone, normalizePhone } from '../utils/phone'
import { PlusIcon } from './icons'

interface NewChatFormProps {
  credentials: Credentials
  onCreate: (chat: Chat) => void
}

export function NewChatForm({ credentials, onCreate }: NewChatFormProps) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const digits = normalizePhone(phone)
    if (!digits) {
      setError('Введите номер в международном формате, например +7 999 123-45-67')
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Telegram адресует чаты по chatId, поэтому сначала узнаём его по номеру
      const { exist, chatId } = await checkAccount(credentials, digits)
      if (!exist) {
        setError('Аккаунт Telegram не найден или скрыт настройками приватности')
        return
      }
      onCreate({ id: chatId, name: formatPhone(digits), createdAt: Date.now() })
      setPhone('')
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
          type="tel"
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value)
            setError(null)
          }}
          placeholder="Номер телефона получателя"
          aria-label="Номер телефона получателя"
        />
        <button
          className="icon-button icon-button--accent"
          type="submit"
          disabled={loading || !phone.trim()}
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
