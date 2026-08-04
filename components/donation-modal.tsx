"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { CheckoutElementsProvider, useCheckoutElements, PaymentElement } from "@stripe/react-stripe-js/checkout"
import { CircleNotchIcon, CheckCircleIcon, XIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { RegisterForm } from "@/components/register-form"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "")

export type DonationRequest = {
  giftId: string
  label: string
  amount: number
  message?: string
  presetId?: string
}

type Props = {
  request: DonationRequest | null
  user: { email: string } | null
  onAuthenticated: (email: string) => void
  onConfirmed: () => void
  onClose: () => void
}

type Step = "register" | "payment" | "processing" | "done"

export function DonationModal({ request, user, onAuthenticated, onConfirmed, onClose }: Props) {
  const [step, setStep] = useState<Step>("register")
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [prepareError, setPrepareError] = useState<string | null>(null)

  // Reset the flow whenever a fresh donation request comes in — skip
  // registration entirely if the viewer is already signed in.
  useEffect(() => {
    if (!request) return
    setClientSecret(null)
    setPrepareError(null)
    if (user) {
      prepare(user.email)
    } else {
      setStep("register")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request])

  if (!request) return null

  async function prepare(email: string) {
    if (!request) return
    setStep("payment")
    setPreparing(true)
    setPrepareError(null)
    try {
      const res = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: request.amount, giftName: request.label, email }),
      })
      const data = await res.json()
      if (!res.ok || !data.clientSecret) {
        throw new Error(data.error || "Αποτυχία προετοιμασίας πληρωμής.")
      }
      setClientSecret(data.clientSecret)
    } catch (err) {
      setPrepareError(err instanceof Error ? err.message : "Κάτι πήγε στραβά.")
    } finally {
      setPreparing(false)
    }
  }

  function handleRegistered(email: string) {
    onAuthenticated(email)
    prepare(email)
  }

  return (
    <div className="modal__overlay" role="dialog" aria-modal="true" aria-label="Δωρεά" onClick={onClose}>
      <div className="modal__panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal__scroll">
        {(step === "register" || step === "payment") && (
          <div className="modal__top">
            <div className="modal__header">
              <p className="modal__eyebrow">Δωρεά</p>
              <p className="modal__title">
                {request.label} · {request.amount.toFixed(2)}€
              </p>
              {request.message && (
                <p className="modal__subtitle">{request.message}</p>
              )}
            </div>
            <button type="button" onClick={onClose} aria-label="Κλείσιμο" className="modal__close">
              <XIcon />
            </button>
          </div>
        )}
        {step === "done" && (
          <div className="modal__top">
            <div className="modal__header">
              <p className="modal__eyebrow">Δωρεά</p>
            </div>
            <button type="button" onClick={onClose} aria-label="Κλείσιμο" className="modal__close">
              <XIcon />
            </button>
          </div>
        )}

        {step === "register" && <RegisterForm onRegistered={handleRegistered} />}

        {step === "payment" && (
          <div className="modal__body">
            {preparing && (
              <div className="modal__loading">
                <CircleNotchIcon className="modal__spinner" />
                <p>Προετοιμασία πληρωμής…</p>
              </div>
            )}
            {!preparing && prepareError && (
              <div className="modal__error-block">
                <p className="modal__error-text">{prepareError}</p>
                <Button type="button" size="sm" onClick={() => prepare(user?.email ?? "")}>
                  Δοκίμασε ξανά
                </Button>
              </div>
            )}
            {!preparing && !prepareError && clientSecret && (
              <CheckoutElementsProvider stripe={stripePromise} options={{ clientSecret, elementsOptions: { appearance: { theme: "night" } } }}>
                <PaymentForm
                  amount={request.amount}
                  giftId={request.giftId}
                  label={request.label}
                  message={request.message}
                  presetId={request.presetId}
                  onPaid={() => {
                    onConfirmed()
                    setStep("processing")
                  }}
                />
              </CheckoutElementsProvider>
            )}
          </div>
        )}

        {step === "processing" && (
          <ProcessingStep onDone={() => setStep("done")} />
        )}

        {step === "done" && (
          <div className="modal__success">
            <CheckCircleIcon className="modal__success-icon" />
            <p className="modal__success-text">
              Η πληρωμή σου έχει επεξεργαστεί και σύντομα θα ενημερωθείς για το αποτέλεσμα. Μπορείς να κλείσεις αυτό
              το παράθυρο.
            </p>
            <Button type="button" size="sm" onClick={onClose}>
              Κλείσιμο
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

function ProcessingStep({ onDone }: { onDone: () => void }) {
  const calledRef = useRef(false)

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (!calledRef.current) {
        calledRef.current = true
        onDone()
      }
    }, 1600)
    return () => window.clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="modal__processing">
      <h2 className="modal__processing-title">Επεξεργασία</h2>
      <CircleNotchIcon className="modal__spinner modal__spinner--lg" />
    </div>
  )
}

const PENDING_DONATION_KEY = "yiamas:pendingDonation"

function PaymentForm({ amount, giftId, label, message, presetId, onPaid }: { amount: number; giftId: string; label: string; message?: string; presetId?: string; onPaid: () => void }) {
  const checkoutResult = useCheckoutElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkout = checkoutResult.type === "success" ? checkoutResult.checkout : null

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!checkout) return
    setSubmitting(true)
    setError(null)

    // Persist the donation details in case Stripe redirects away for a bank
    // payment method. The /donate/return page reads this to credit the donation.
    try {
      sessionStorage.setItem(PENDING_DONATION_KEY, JSON.stringify({ giftId, label, amount, message, presetId }))
    } catch { /* ignore */ }

    const result = await checkout.confirm()

    if (result.type === "error") {
      try { sessionStorage.removeItem(PENDING_DONATION_KEY) } catch { /* ignore */ }
      setError(result.error.message ?? "Η πληρωμή απέτυχε. Δοκίμασε ξανά.")
      setSubmitting(false)
      return
    }

    // Inline success — clear storage so the return page can't double-credit.
    try { sessionStorage.removeItem(PENDING_DONATION_KEY) } catch { /* ignore */ }
    onPaid()
  }

  return (
    <form onSubmit={handleSubmit} className="modal__payment-form">
      <PaymentElement />
      {error && <p className="modal__error-text">{error}</p>}
      <Button type="submit" disabled={!checkout || submitting} className="modal__submit">
        {submitting ? "Επεξεργασία…" : `Κέρασε ${amount.toFixed(2)}€`}
      </Button>
    </form>
  )
}

