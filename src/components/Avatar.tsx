// Палитра аватаров Telegram
const GRADIENTS = [
  ['#ff885e', '#ff516a'],
  ['#ffcd6a', '#ffa85c'],
  ['#82b1ff', '#665fff'],
  ['#a0de7e', '#54cb68'],
  ['#53edd6', '#28c9b7'],
  ['#72d5fd', '#2a9ef1'],
  ['#e0a2f3', '#d669ed'],
]

function hash(value: string): number {
  let result = 0
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) | 0
  return Math.abs(result)
}

function initials(name: string): string {
  const letters = name
    .split(/\s+/)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter(Boolean)
  if (letters.length > 0) return letters.slice(0, 2).join('').toUpperCase()
  // Имя-номер: показываем последние две цифры
  return name.replace(/\D/g, '').slice(-2) || '?'
}

interface AvatarProps {
  id: string
  name: string
  size?: number
}

export function Avatar({ id, name, size = 48 }: AvatarProps) {
  const [from, to] = GRADIENTS[hash(id) % GRADIENTS.length]
  return (
    <div
      className="avatar"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  )
}
