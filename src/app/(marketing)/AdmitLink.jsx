'use client'

import { SELECT_TRACK_EVENT } from './admission'

/**
 * "ভর্তি হোন" link. Works as a plain #register anchor without JavaScript; with JavaScript and a
 * `track`, it also pre-selects that batch in the registration form and scrolls to the form.
 */
export default function AdmitLink({ track, className = '', children, ...rest }) {
  const handleClick = (e) => {
    if (track !== 'men' && track !== 'women') return
    e.preventDefault()
    window.dispatchEvent(new CustomEvent(SELECT_TRACK_EVENT, { detail: { track } }))
  }

  return (
    <a href="#register" onClick={handleClick} className={className} {...rest}>
      {children}
    </a>
  )
}
