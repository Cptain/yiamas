"use client"

import { XIcon } from "@phosphor-icons/react"
import { RegisterForm } from "@/components/register-form"

type Props = {
  open: boolean
  onClose: () => void
  onAuthenticated: (email: string) => void
}

export function AuthModal({ open, onClose, onAuthenticated }: Props) {
  if (!open) return null

  return (
    <div className="modal__overlay" role="dialog" aria-modal="true" aria-label="Σύνδεση ή εγγραφή" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__scroll">
          <div className="modal__top">
            <div className="modal__header">
              <p className="modal__eyebrow">Καλωσόρισες</p>
              <p className="modal__title">Σύνδεση ή Εγγραφή</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Κλείσιμο" className="modal__close">
              <XIcon />
            </button>
          </div>

        <RegisterForm
          onRegistered={(email) => {
            onAuthenticated(email)
            onClose()
          }}
        />
        </div>
      </div>
    </div>
  )
}
