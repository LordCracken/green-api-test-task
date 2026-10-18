export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface Chat {
  id: string
  name: string
  createdAt: number
}

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  chatId: string
  text: string
  direction: 'incoming' | 'outgoing'
  timestamp: number
  status?: MessageStatus
  error?: string
}
