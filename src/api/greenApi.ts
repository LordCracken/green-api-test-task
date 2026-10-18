import type { Credentials } from '../types'

export class GreenApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

// Хост API у каждого инстанса свой (в кабинете — поле apiUrl)
// и совпадает с первыми четырьмя цифрами idInstance: 4100123456 → 4100.api.green-api.com
export function getApiUrl(idInstance: string): string {
  return `https://${idInstance.slice(0, 4)}.api.green-api.com`
}

interface RequestOptions {
  httpMethod?: 'GET' | 'POST' | 'DELETE'
  body?: unknown
  pathSuffix?: string
  query?: Record<string, string | number>
  signal?: AbortSignal
}

function describeError(status: number, text: string): string {
  switch (status) {
    case 401:
    case 403:
      return 'Неверный idInstance или apiTokenInstance'
    case 429:
      return 'Слишком много запросов, попробуйте позже'
    case 466:
      return 'Исчерпан лимит запросов тарифа'
    case 469:
      return 'Telegram временно ограничил поиск контактов. Попробуйте позже'
    default:
      return text ? `Ошибка ${status}: ${text}` : `Ошибка ${status}`
  }
}

async function request<T>(
  credentials: Credentials,
  method: string,
  { httpMethod = 'GET', body, pathSuffix = '', query, signal }: RequestOptions = {},
): Promise<T> {
  const base = getApiUrl(credentials.idInstance)
  const search = query
    ? '?' + new URLSearchParams(Object.entries(query).map(([k, v]) => [k, String(v)]))
    : ''
  const url = `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${pathSuffix}${search}`

  let response: Response
  try {
    response = await fetch(url, {
      method: httpMethod,
      headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    })
  } catch (error) {
    if (signal?.aborted) throw error
    throw new GreenApiError('Не удалось связаться с сервером GREEN-API. Проверьте idInstance и подключение к сети')
  }

  const text = await response.text()
  if (!response.ok) {
    throw new GreenApiError(describeError(response.status, text), response.status)
  }
  return (text ? JSON.parse(text) : null) as T
}

export interface StateInstanceResponse {
  stateInstance: string
}

export function getStateInstance(credentials: Credentials) {
  return request<StateInstanceResponse>(credentials, 'getStateInstance')
}

type CheckAccountResponse =
  | { exist: boolean; chatId: string; username?: string; phoneNumber?: number }
  | { status: false; reason?: string; data?: { reason?: string } }

const CHECK_ACCOUNT_REASONS: Record<string, string> = {
  'instance is starting or not authorized': 'Инстанс запускается или не авторизован',
  rate_limit_exceeded: 'Слишком много проверок номеров. Сделайте паузу на пару часов',
  'Rate limited by messenger': 'Telegram временно ограничил поиск контактов. Попробуйте позже',
  'Messenger is temporarily unavailable': 'Серверы Telegram недоступны. Попробуйте через несколько минут',
}

export type CheckAccountQuery = { phoneNumber: string } | { username: string }

export async function checkAccount(credentials: Credentials, query: CheckAccountQuery) {
  const result = await request<CheckAccountResponse>(credentials, 'checkAccount', {
    httpMethod: 'POST',
    body: 'phoneNumber' in query ? { phoneNumber: Number(query.phoneNumber) } : query,
  })
  if ('status' in result && result.status === false) {
    const reason = result.reason ?? result.data?.reason ?? ''
    throw new GreenApiError(CHECK_ACCOUNT_REASONS[reason] ?? (reason || 'Не удалось проверить аккаунт'))
  }
  return result as Extract<CheckAccountResponse, { exist: boolean }>
}

export function sendMessage(credentials: Credentials, chatId: string, message: string) {
  return request<{ idMessage: string }>(credentials, 'sendMessage', {
    httpMethod: 'POST',
    body: { chatId, message },
  })
}

export interface NotificationBody {
  typeWebhook: string
  timestamp: number
  idMessage?: string
  chatId?: string
  status?: string
  description?: string
  senderData?: {
    chatId: string
  }
  messageData?: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}

export interface Notification {
  receiptId: number
  body: NotificationBody
}

export function receiveNotification(
  credentials: Credentials,
  receiveTimeout: number,
  signal: AbortSignal,
) {
  return request<Notification | null>(credentials, 'receiveNotification', {
    query: { receiveTimeout },
    signal,
  })
}

export function deleteNotification(
  credentials: Credentials,
  receiptId: number,
  signal: AbortSignal,
) {
  return request<{ result: boolean }>(credentials, 'deleteNotification', {
    httpMethod: 'DELETE',
    pathSuffix: `/${receiptId}`,
    signal,
  })
}
