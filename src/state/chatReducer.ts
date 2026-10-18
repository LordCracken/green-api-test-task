import type { Chat, Message, MessageStatus } from '../types'

export interface ChatState {
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null
}

export type ChatAction =
  | { type: 'openChat'; chat: Chat }
  | { type: 'selectChat'; chatId: string | null }
  | { type: 'addMessage'; message: Message; chatName?: string }
  | { type: 'confirmMessage'; chatId: string; localId: string; id: string }
  | { type: 'failMessage'; chatId: string; localId: string; error: string }
  | { type: 'setStatus'; chatId: string; id: string; status: MessageStatus; error?: string }

export const initialChatState: ChatState = { chats: [], messages: {}, activeChatId: null }

const STATUS_ORDER: MessageStatus[] = ['pending', 'sent', 'delivered', 'read']

// Статусы приходят асинхронно — не даём «прочитано» откатиться в «доставлено»
function isStatusUpgrade(current: MessageStatus | undefined, next: MessageStatus): boolean {
  if (next === 'failed') return current !== 'read'
  return STATUS_ORDER.indexOf(next) > STATUS_ORDER.indexOf(current ?? 'pending')
}

function ensureChat(chats: Chat[], chat: Chat): Chat[] {
  return chats.some((c) => c.id === chat.id) ? chats : [...chats, chat]
}

function updateMessage(
  state: ChatState,
  chatId: string,
  id: string,
  patch: Partial<Message>,
): ChatState {
  const list = state.messages[chatId]
  if (!list) return state
  return {
    ...state,
    messages: {
      ...state.messages,
      [chatId]: list.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    },
  }
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'openChat':
      return {
        ...state,
        chats: ensureChat(state.chats, action.chat),
        activeChatId: action.chat.id,
      }

    case 'selectChat':
      return { ...state, activeChatId: action.chatId }

    case 'addMessage': {
      const { message } = action
      const list = state.messages[message.chatId] ?? []
      if (list.some((m) => m.id === message.id)) return state
      return {
        ...state,
        chats: ensureChat(state.chats, {
          id: message.chatId,
          name: action.chatName || message.chatId,
          createdAt: message.timestamp,
        }),
        messages: { ...state.messages, [message.chatId]: [...list, message] },
      }
    }

    case 'confirmMessage':
      return updateMessage(state, action.chatId, action.localId, { id: action.id, status: 'sent' })

    case 'failMessage':
      return updateMessage(state, action.chatId, action.localId, {
        status: 'failed',
        error: action.error,
      })

    case 'setStatus': {
      const message = state.messages[action.chatId]?.find((m) => m.id === action.id)
      if (!message || !isStatusUpgrade(message.status, action.status)) return state
      return updateMessage(state, action.chatId, action.id, {
        status: action.status,
        error: action.error,
      })
    }
  }
}
