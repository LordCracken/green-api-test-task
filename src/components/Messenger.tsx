import { useEffect, useReducer } from 'react'
import { sendMessage, type NotificationBody } from '../api/greenApi'
import { useNotifications } from '../hooks/useNotifications'
import { chatReducer } from '../state/chatReducer'
import { loadChatState, saveChatState } from '../state/storage'
import type { Chat, Credentials, MessageStatus } from '../types'
import { ChatView } from './ChatView'
import { Sidebar } from './Sidebar'

const NOTIFICATION_STATUSES: Partial<Record<string, MessageStatus>> = {
  sent: 'sent',
  delivered: 'delivered',
  read: 'read',
  failed: 'failed',
  noAccount: 'failed',
}

function describeFailure(body: NotificationBody): string | undefined {
  if (body.status === 'noAccount') return 'У получателя нет аккаунта Telegram'
  if (body.description === 'chatId unresolvable on this session') {
    return 'Нет переписки с этим чатом — создайте чат заново'
  }
  return body.description || undefined
}

function extractText(messageData: NotificationBody['messageData']): string | null {
  switch (messageData?.typeMessage) {
    case 'textMessage':
      return messageData.textMessageData?.textMessage ?? null
    case 'extendedTextMessage':
      return messageData.extendedTextMessageData?.text ?? null
    default:
      return null
  }
}

interface MessengerProps {
  credentials: Credentials
  onLogout: () => void
}

export function Messenger({ credentials, onLogout }: MessengerProps) {
  const [state, dispatch] = useReducer(chatReducer, credentials.idInstance, loadChatState)
  const { chats, messages, activeChatId } = state
  const activeChat = chats.find((chat) => chat.id === activeChatId) ?? null

  useEffect(() => {
    saveChatState(credentials.idInstance, state)
  }, [credentials.idInstance, state])

  const connectionError = useNotifications(credentials, (body) => {
    switch (body.typeWebhook) {
      // Входящие, а также исходящие, отправленные с телефона.
      // Сообщения, отправленные через API (outgoingAPIMessageReceived), уже есть в чате.
      case 'incomingMessageReceived':
      case 'outgoingMessageReceived': {
        const text = extractText(body.messageData)
        if (!text || !body.senderData || !body.idMessage) return
        const incoming = body.typeWebhook === 'incomingMessageReceived'
        dispatch({
          type: 'addMessage',
          message: {
            id: body.idMessage,
            chatId: body.senderData.chatId,
            text,
            direction: incoming ? 'incoming' : 'outgoing',
            timestamp: body.timestamp * 1000,
            status: incoming ? undefined : 'sent',
          },
        })
        return
      }
      case 'outgoingMessageStatus': {
        const status = body.status ? NOTIFICATION_STATUSES[body.status] : undefined
        if (body.chatId && body.idMessage && status) {
          dispatch({
            type: 'setStatus',
            chatId: body.chatId,
            id: body.idMessage,
            status,
            error: status === 'failed' ? describeFailure(body) : undefined,
          })
        }
        return
      }
    }
  })

  async function handleSend(text: string) {
    if (!activeChatId) return
    const chatId = activeChatId
    const localId = `local-${crypto.randomUUID()}`
    dispatch({
      type: 'addMessage',
      message: {
        id: localId,
        chatId,
        text,
        direction: 'outgoing',
        timestamp: Date.now(),
        status: 'pending',
      },
    })
    try {
      const { idMessage } = await sendMessage(credentials, chatId, text)
      dispatch({ type: 'confirmMessage', chatId, localId, id: idMessage })
    } catch (e) {
      dispatch({
        type: 'failMessage',
        chatId,
        localId,
        error: e instanceof Error ? e.message : 'Не удалось отправить сообщение',
      })
    }
  }

  return (
    <div className={`messenger${activeChat ? ' messenger--chat-open' : ''}`}>
      <Sidebar
        credentials={credentials}
        chats={chats}
        messages={messages}
        activeChatId={activeChatId}
        connectionError={connectionError}
        onSelect={(chatId) => dispatch({ type: 'selectChat', chatId })}
        onCreate={(chat: Chat) => dispatch({ type: 'openChat', chat })}
        onLogout={onLogout}
      />
      <ChatView
        chat={activeChat}
        messages={activeChatId ? (messages[activeChatId] ?? []) : []}
        onSend={handleSend}
        onBack={() => dispatch({ type: 'selectChat', chatId: null })}
      />
    </div>
  )
}
