import { useEffect, useRef, useState } from 'react'
import {
  deleteNotification,
  receiveNotification,
  type NotificationBody,
} from '../api/greenApi'
import type { Credentials } from '../types'

const RECEIVE_TIMEOUT_SECONDS = 20
const RETRY_DELAY_MS = 5000

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

/**
 * Получение входящих уведомлений через HTTP API (long polling):
 * receiveNotification → обработка → deleteNotification, и так по кругу.
 * Возвращает текст последней ошибки соединения, если она есть.
 */
export function useNotifications(
  credentials: Credentials,
  onNotification: (body: NotificationBody) => void,
): string | null {
  const [error, setError] = useState<string | null>(null)
  const handlerRef = useRef(onNotification)

  useEffect(() => {
    handlerRef.current = onNotification
  })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function poll() {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(
            credentials,
            RECEIVE_TIMEOUT_SECONDS,
            signal,
          )
          setError(null)
          if (!notification) continue

          try {
            handlerRef.current(notification.body)
          } finally {
            // Удаляем даже то, что не смогли разобрать, иначе очередь встанет
            await deleteNotification(credentials, notification.receiptId, signal)
          }
        } catch (e) {
          if (signal.aborted) return
          setError(e instanceof Error ? e.message : 'Ошибка получения сообщений')
          await wait(RETRY_DELAY_MS, signal)
        }
      }
    }

    poll()
    return () => controller.abort()
  }, [credentials])

  return error
}
