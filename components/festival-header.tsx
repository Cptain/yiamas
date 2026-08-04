"use client"

import { useEffect, useRef, useState } from "react"
import { RadioIcon, SignInIcon, UserCircleIcon, SignOutIcon, CaretDownIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"

type FestivalHeaderProps = {
  user: { email: string } | null
  onLoginClick: () => void
  onLogout: () => void
}

export function FestivalHeader({ user, onLoginClick, onLogout }: FestivalHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const brandRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = brandRef.current
    if (!el) return

    const onEnd = (e: AnimationEvent) => {
      // Intro done: freeze all intro animations so they don't restart later
      if (e.animationName === 'logo-live-in') {
        el.classList.add('logo-intro-done')
      }
      // Hover done: unlock for next hover
      if (e.animationName === 'logo-hover-cup-left') {
        el.classList.remove('is-toasting')
      }
    }

    el.addEventListener('animationend', onEnd)
    return () => el.removeEventListener('animationend', onEnd)
  }, [])

  // Only allow hover toast after intro has fully settled
  const handleMouseEnter = () => {
    const el = brandRef.current
    if (!el || !el.classList.contains('logo-intro-done')) return
    el.classList.add('is-toasting')
  }

  return (
    <header className="header">
      <div className="header__inner">
        <a ref={brandRef} href="#" onClick={(e) => { e.preventDefault(); window.location.reload() }} className="header__brand" onMouseEnter={handleMouseEnter}>
          <svg className="header__brand-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 132 32">
            <g className="graphic-group">
              <line className="spark spark--center" x1="23.52" y1="7.72" x2="23.52" y2="3.91" />
              <line className="spark spark--right" x1="26.49" y1="8.78" x2="29.13" y2="6.06" />
              <line className="spark spark--left" x1="20.47" y1="8.78" x2="17.75" y2="6.06" />
              <g className="cup cup--left">
                <path className="white"
                  d="M17.32,26.09c-.06,0-.11,0-.17-.02h0l-7.08-1.75c-.36-.09-.59-.43-.54-.8l1.73-12.31c.03-.2.14-.38.31-.49.17-.12.38-.15.57-.11l9.61,2.37c.2.05.37.18.46.36.1.18.11.39.04.58l-4.26,11.69c-.11.29-.38.47-.68.47ZM10.42,23.5l6.81,1.68,4.15-11.4-9.27-2.29-1.69,12ZM10.4,23.64h0s0,0,0,0Z" />
                <rect className="orange liquid liquid--left" x="11.99" y="16.45" width="6.78" height="6.79" />
              </g>
              <g className="cup cup--right">
                <path className="white"
                  d="M29.73,26.09c-.3,0-.57-.18-.68-.47l-4.26-11.69c-.07-.19-.05-.4.04-.58.1-.18.26-.31.46-.36l9.61-2.37c.2-.05.41-.01.58.1.17.11.28.29.31.49l1.73,12.31c.05.37-.18.71-.54.8l-7.08,1.75c-.06.01-.12.02-.17.02ZM29.87,25.32h0ZM25.67,13.79l4.15,11.4,6.81-1.68-1.69-12-9.27,2.29Z" />
                <rect className="orange liquid liquid--right" x="28.28" y="16.45" width="6.78" height="6.79" />
              </g>
            </g>
            <g className="text-group">
              <g className="text-live">
                <path className="orange" d="M98.25,23.34v-13.79h1.99v11.83h3.17v1.96h-5.16Z" />
                <path className="orange" d="M104.93,9.55h1.99v13.79h-1.99v-13.79Z" />
                <path className="orange" d="M113.5,23.34h-2.73l-2.05-13.79h2.01l1.4,11.33,1.41-11.33h2.01l-2.05,13.79Z" />
                <path className="orange" d="M117.32,9.55h5.16v1.96h-3.17v5.41h2.73v1.97h-2.73v2.49h3.17v1.96h-5.16v-13.79Z" />
              </g>
              <g className="text-yiamas">
                <path className="white"
                  d="M46.22,9.55l1.36,7.13,1.36-7.13h2.11l-2.47,10.16v3.63h-1.99v-3.63l-2.47-10.16h2.11Z" />
                <path className="white" d="M53.27,9.55h1.99v13.79h-1.99v-13.79Z" />
                <path className="white"
                  d="M61.71,17.2v-4.97c0-.62-.29-.93-.86-.93h-.01c-.58,0-.86.32-.86.93v3.37h-1.99v-3.37c0-1.93.95-2.9,2.86-2.9s2.85.97,2.85,2.9v11.11h-1.78l-.14-.85c-.4.71-1,1.07-1.79,1.08-.65,0-1.14-.24-1.47-.73s-.5-1.08-.5-1.79c0-2.32,1.23-3.61,3.68-3.84ZM61.71,19.09c-1.12.28-1.69.86-1.69,1.74,0,.6.13.9.4.9.86-.07,1.29-.7,1.29-1.91v-.73Z" />
                <path className="white"
                  d="M70.07,16.63l-1.76-2.99v9.71h-1.92v-13.79h1.57l2.11,3.56,2.11-3.56h1.57v13.79h-1.92v-9.71l-1.76,2.99Z" />
                <path className="white"
                  d="M80.17,17.2v-4.97c0-.62-.29-.93-.86-.93h-.01c-.58,0-.86.32-.86.93v3.37h-1.99v-3.37c0-1.93.95-2.9,2.86-2.9s2.85.97,2.85,2.9v11.11h-1.78l-.14-.85c-.4.71-1,1.07-1.79,1.08-.65,0-1.14-.24-1.47-.73s-.5-1.08-.5-1.79c0-2.32,1.23-3.61,3.68-3.84ZM80.17,19.09c-1.12.28-1.69.86-1.69,1.74,0,.6.13.9.4.9.86-.07,1.29-.7,1.29-1.91v-.73Z" />
                <path className="white"
                  d="M84.71,12.23c0-1.93.95-2.9,2.85-2.9s2.86.97,2.86,2.9v3.37h-1.99v-3.37c0-.62-.29-.93-.86-.93h-.01c-.57,0-.86.31-.86.93v2.33c0,1.08.62,2,1.86,2.75,1.24.89,1.86,2,1.86,3.35,0,1.94-.95,2.9-2.85,2.9-1.91,0-2.86-.97-2.86-2.9v-.97h1.99v.97c0,.62.29.93.87.93s.86-.31.86-.93c0-.67-.62-1.44-1.86-2.33-1.24-.89-1.86-2.13-1.86-3.73v-2.38Z" />
              </g>
              <path className="text-dot orange" d="M93.05,21.06h2.28v2.28h-2.28v-2.28Z" />
            </g>
          </svg>
        </a>

        {user ? (
          <div className="header__profile">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              className="header__profile-trigger"
            >
              <UserCircleIcon className="header__profile-icon" />
              <span className="header__profile-email">{user.email}</span>
              <CaretDownIcon className="header__profile-chevron" />
            </button>
            {menuOpen && (
              <div className="header__menu">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onLogout()
                  }}
                  className="header__menu-item"
                >
                  <SignOutIcon />
                  Αποσύνδεση
                </button>
              </div>
            )}
          </div>
        ) : (
          <Button variant="outline" size="sm" className="header__login" onClick={onLoginClick}>
            <SignInIcon />
            Σύνδεση / Εγγραφή
          </Button>
        )}
      </div>
    </header>
  )
}
