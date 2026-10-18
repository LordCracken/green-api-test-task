import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

export const SendIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M5 12h13M12 5l7 7-7 7" />
  </svg>
)

export const BackIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
)

export const LogoutIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </svg>
)

export const PlusIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const CheckIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 16 16" strokeWidth={1.6} {...props}>
    <path d="M3 8.5l3 3 7-7" />
  </svg>
)

export const DoubleCheckIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 20 16" strokeWidth={1.6} {...props}>
    <path d="M1.5 8.5l3 3 7-7M8.5 11.5l7-7" />
  </svg>
)

export const ClockIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 16 16" strokeWidth={1.4} {...props}>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3l2 1.5" />
  </svg>
)

export const AlertIcon = (props: IconProps) => (
  <svg {...base} viewBox="0 0 16 16" strokeWidth={1.6} {...props}>
    <circle cx="8" cy="8" r="6.5" />
    <path d="M8 4.5v4M8 11.2v.1" />
  </svg>
)

export const PaperPlaneIcon = (props: IconProps) => (
  <svg width={24} height={24} viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
    <path d="M4.4 11.3l12.9-5c.6-.2 1.1.1.9.9l-2.2 10.4c-.2.7-.6.9-1.2.6l-3.3-2.5-1.6 1.6c-.2.2-.3.3-.7.3l.2-3.4 6.2-5.6c.3-.2-.1-.4-.4-.2l-7.7 4.8-3.3-1c-.7-.2-.7-.7.2-1z" />
  </svg>
)

export const ChatBubbleIcon =(props: IconProps) => (
  <svg {...base} strokeWidth={1.5} {...props}>
    <path d="M4 6.5A3.5 3.5 0 0 1 7.5 3h9A3.5 3.5 0 0 1 20 6.5v6a3.5 3.5 0 0 1-3.5 3.5H11l-4.4 3.6c-.6.5-1.6 0-1.6-.8V16A3.5 3.5 0 0 1 4 12.5z" />
  </svg>
)
