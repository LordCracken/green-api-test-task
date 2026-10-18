import { useState, type SubmitEvent } from 'react'
import { getStateInstance } from '../api/greenApi'
import type { Credentials } from '../types'
import { PaperPlaneIcon } from './icons'

const STATE_DESCRIPTIONS: Record<string, string> = {
  notAuthorized:
    'инстанс не авторизован — отсканируйте QR-код в личном кабинете GREEN-API (Telegram → Настройки → Устройства)',
  pendingPassword: 'для завершения авторизации нужен пароль двухфакторной аутентификации',
  blocked: 'аккаунт заблокирован',
  suspended: 'на аккаунте временные ограничения',
  starting: 'инстанс запускается, попробуйте через пару минут',
}

interface LoginPageProps {
  onLogin: (credentials: Credentials) => void
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const credentials: Credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
    }
    if (!/^\d{4,}$/.test(credentials.idInstance)) {
      setError('idInstance должен состоять из цифр — скопируйте его из личного кабинета')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { stateInstance } = await getStateInstance(credentials)
      if (stateInstance === 'authorized') {
        onLogin(credentials)
        return
      }
      setError(`Не удаётся войти: ${STATE_DESCRIPTIONS[stateInstance] ?? `статус «${stateInstance}»`}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось проверить учётные данные')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login">
      <form className="login__card" onSubmit={handleSubmit}>
        <div className="login__logo">
          <PaperPlaneIcon width={56} height={56} />
        </div>
        <h1 className="login__title">Вход в чат Telegram</h1>
        <p className="login__subtitle">
          Введите параметры инстанса из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>

        <label className="field">
          <span className="field__label">idInstance</span>
          <input
            className="field__input"
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value)}
            inputMode="numeric"
            autoComplete="username"
            placeholder="1103123456"
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span className="field__label">apiTokenInstance</span>
          <input
            className="field__input"
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            autoComplete="current-password"
            placeholder="Токен инстанса"
            required
          />
        </label>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button className="button button--primary" type="submit" disabled={loading}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
