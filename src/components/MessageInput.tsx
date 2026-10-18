import { useState, type SubmitEvent, type KeyboardEvent } from 'react'
import { SendIcon } from './icons'

// Ограничение метода SendMessage
const MAX_LENGTH = 4096

interface MessageInputProps {
  onSend: (text: string) => void
}

export function MessageInput({ onSend }: MessageInputProps) {
  const [text, setText] = useState('')
  const canSend = text.trim().length > 0

  function submit() {
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        className="composer__input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Сообщение"
        rows={1}
        maxLength={MAX_LENGTH}
        aria-label="Текст сообщения"
        autoFocus
      />
      <button
        className="composer__send"
        type="submit"
        disabled={!canSend}
        title="Отправить"
        aria-label="Отправить"
      >
        <SendIcon width={20} height={20} />
      </button>
    </form>
  )
}
