// Facebook Messenger logo. The bubble uses currentColor; the lightning bolt is
// drawn in `boltColor` so it matches the background the icon sits on.
export default function MessengerIcon({
  className = 'w-4 h-4',
  boltColor = '#0866FF',
  title = 'Facebook Messenger',
  ...rest
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <title>{title}</title>
      <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.913 1.454 5.512 3.726 7.21V22l3.41-1.871c.91.252 1.875.388 2.864.388 5.523 0 10-4.145 10-9.258S17.523 2 12 2z" />
      <path d="M13.191 14.466l-2.545-2.716-4.97 2.716 5.467-5.806 2.608 2.716 4.907-2.716-5.467 5.806z" fill={boltColor} />
    </svg>
  )
}
