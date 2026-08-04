"use client"

import { useState, type FormEvent } from "react"
import { EnvelopeIcon } from "@phosphor-icons/react"
import { siApple, siFacebook, siGoogle, type SimpleIcon } from "simple-icons"
import { Button } from "@/components/ui/button"

type SocialProvider = "Google" | "Facebook" | "Apple"

const SOCIAL_ICONS: Record<SocialProvider, SimpleIcon> = {
  Google: siGoogle,
  Facebook: siFacebook,
  Apple: siApple,
}

function SocialIcon({ provider }: { provider: SocialProvider }) {
  const icon = SOCIAL_ICONS[provider]

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
      className="register-form__social-mark"
    >
      <path fill={`#${icon.hex}`} d={icon.path} />
    </svg>
  )
}

type Props = {
  onRegistered: (email: string) => void
}

// Shared registration/login form used both by the standalone header auth
// modal and inline within the donation flow.
export function RegisterForm({ onRegistered }: Props) {
  const [email, setEmail] = useState("")
  const [emailError, setEmailError] = useState<string | null>(null)

  function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError("Δώσε ένα έγκυρο email.")
      return
    }
    setEmailError(null)
    onRegistered(trimmed)
  }

  function handleSocialLogin(provider: SocialProvider) {
    // NOTE: real social login requires that provider's OAuth app credentials
    // (client id/secret + redirect URIs), which aren't configured here. We
    // simulate a successful registration so the rest of the app — including
    // real Stripe payments — can be exercised end to end.
    onRegistered(`${provider.toLowerCase()}-user@example.com`)
  }

  const socialProviders: Array<{ provider: SocialProvider; label: string; text: string }> = [
    { provider: "Google", label: "Google", text: "Εγγραφή με Google" },
    { provider: "Facebook", label: "Facebook", text: "Εγγραφή με Facebook" },
    { provider: "Apple", label: "Apple", text: "Εγγραφή με Apple" },
  ]

  return (
    <div className="register-form">
      <form onSubmit={handleEmailSubmit} className="register-form__group">
        <label htmlFor="register-email" className="register-form__label">
          Εγγραφή με email
        </label>
        <div className="register-form__field">
          <EnvelopeIcon className="register-form__field-icon" />
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email εγγραφής"
            className="register-form__input"
            required
          />
        </div>
        {emailError && <p className="register-form__error">{emailError}</p>}
        <Button type="submit" className="register-form__submit">
          Συνέχεια με Email
        </Button>
      </form>

      <div className="register-form__divider">
        <span className="register-form__divider-line" />ή<span className="register-form__divider-line" />
      </div>

      <div className="register-form__socials">
        {socialProviders.map(({ provider, text }) => (
          <Button
            key={provider}
            type="button"
            variant="outline"
            className="register-form__social"
            onClick={() => handleSocialLogin(provider)}
          >
            <span className={`register-form__social-badge register-form__social-badge--${provider.toLowerCase()}`}>
              <SocialIcon provider={provider} />
            </span>
            <span className="register-form__social-text">{text}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
