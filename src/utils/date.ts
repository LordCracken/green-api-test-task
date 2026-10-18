const timeFormat = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
const shortDayFormat = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })

export function isSameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString()
}

export function formatTime(timestamp: number): string {
  return timeFormat.format(timestamp)
}

export function formatDay(timestamp: number): string {
  const now = Date.now()
  if (isSameDay(timestamp, now)) return 'Сегодня'
  if (isSameDay(timestamp, now - 24 * 60 * 60 * 1000)) return 'Вчера'
  return dayFormat.format(timestamp)
}

// Время для списка чатов: сегодня — часы, раньше — дата
export function formatListTime(timestamp: number): string {
  return isSameDay(timestamp, Date.now()) ? formatTime(timestamp) : shortDayFormat.format(timestamp)
}
