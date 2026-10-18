import type { Message, MessageStatus } from '../types'
import { formatTime } from '../utils/date'
import { AlertIcon, CheckIcon, ClockIcon, DoubleCheckIcon } from './icons'

const STATUS_LABELS: Record<MessageStatus, string> = {
  pending: 'Отправляется',
  sent: 'Отправлено',
  delivered: 'Доставлено',
  read: 'Прочитано',
  failed: 'Не отправлено',
}

function StatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case 'pending':
      return <ClockIcon width={14} height={14} />
    case 'sent':
      return <CheckIcon width={14} height={14} />
    case 'delivered':
    case 'read':
      return <DoubleCheckIcon width={17} height={14} />
    case 'failed':
      return <AlertIcon width={14} height={14} />
  }
}

export function MessageBubble({ message }: { message: Message }) {
  const outgoing = message.direction === 'outgoing'
  return (
    <div className={`message message--${message.direction}`}>
      <div className="message__bubble">
        <span className="message__text">{message.text}</span>
        <span className="message__meta">
          {formatTime(message.timestamp)}
          {outgoing && message.status && (
            <span
              className={`message__status message__status--${message.status}`}
              title={message.error ?? STATUS_LABELS[message.status]}
            >
              <StatusIcon status={message.status} />
            </span>
          )}
        </span>
      </div>
      {message.status === 'failed' && (
        <span className="message__error">{message.error ?? STATUS_LABELS.failed}</span>
      )}
    </div>
  )
}
