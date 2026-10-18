// Международный формат без «+»; российские номера, начинающиеся с 8, приводим к 7
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) {
    digits = '7' + digits.slice(1)
  }
  return digits.length >= 10 && digits.length <= 15 ? digits : null
}

// Имя пользователя Telegram: 5–32 символа, латиница, цифры и «_»
export function normalizeUsername(input: string): string | null {
  const username = input.trim().replace(/^@/, '')
  return /^[a-zA-Z][a-zA-Z0-9_]{4,31}$/.test(username) ? `@${username}` : null
}

export function formatPhone(digits: string): string {
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  return `+${digits}`
}
