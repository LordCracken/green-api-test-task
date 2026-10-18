import type { Credentials } from '../types'
import { initialChatState, type ChatState } from './chatReducer'

// Учётные данные живут только до закрытия вкладки, история чатов — дольше
const CREDENTIALS_KEY = 'green-api:credentials'
const chatsKey = (idInstance: string) => `green-api:chats:${idInstance}`

function read<T>(storage: Storage, key: string): T | null {
  try {
    const raw = storage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(storage: Storage, key: string, value: unknown) {
  try {
    if (value === null) storage.removeItem(key)
    else storage.setItem(key, JSON.stringify(value))
  } catch {
    // Хранилище недоступно (приватный режим и т. п.) — работаем без сохранения
  }
}

export function loadCredentials(): Credentials | null {
  return read<Credentials>(sessionStorage, CREDENTIALS_KEY)
}

export function saveCredentials(credentials: Credentials | null) {
  write(sessionStorage, CREDENTIALS_KEY, credentials)
}

export function loadChatState(idInstance: string): ChatState {
  const saved = read<ChatState>(localStorage, chatsKey(idInstance))
  return saved ? { ...initialChatState, ...saved, activeChatId: null } : initialChatState
}

export function saveChatState(idInstance: string, state: ChatState) {
  write(localStorage, chatsKey(idInstance), { chats: state.chats, messages: state.messages })
}
