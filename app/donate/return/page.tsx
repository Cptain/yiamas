"use client"

import { useEffect, useState } from "react"
import { CircleNotchIcon, CheckCircleIcon, XCircleIcon } from "@phosphor-icons/react"

const PENDING_DONATION_KEY = "yiamas:pendingDonation"

type Status = "processing" | "succeeded" | "failed"

export default function DonationReturnPage() {
  const [status, setStatus] = useState<Status>("processing")

  useEffect(() => {
    let cancelled = false
    const minDelay = new Promise((resolve) => setTimeout(resolve, 1600))

    async function run() {
      const params = new URLSearchParams(window.location.search)
      const sessionId = params.get("session_id")

      let succeeded = false
      if (sessionId) {
        try {
          const res = await fetch(`/api/session-status?session_id=${encodeURIComponent(sessionId)}`)
          const data = await res.json()
          succeeded = data.status === "paid"
        } catch {
          // network error — fall through as failed
        }
      }

      if (succeeded) {
        try {
          const raw = sessionStorage.getItem(PENDING_DONATION_KEY)
          if (raw) {
            const pending = JSON.parse(raw)
            sessionStorage.setItem(PENDING_DONATION_KEY, JSON.stringify({ ...pending, confirmed: true }))
          }
        } catch {
          // ignore malformed storage
        }
      }

      await minDelay
      if (!cancelled) setStatus(succeeded ? "succeeded" : "failed")
    }

    run()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="donate-return">
      <div className="donate-return__panel">
        {status === "processing" && (
          <>
            <h1 className="donate-return__title">Επεξεργασία</h1>
            <CircleNotchIcon className="donate-return__spinner" />
          </>
        )}

        {status === "succeeded" && (
          <>
            <CheckCircleIcon className="donate-return__icon donate-return__icon--success" />
            <p className="donate-return__text">
              Η πληρωμή σου έχει επεξεργαστεί και σύντομα θα ενημερωθείς για το αποτέλεσμα. Μπορείς να κλείσεις αυτό
              το παράθυρο.
            </p>
          </>
        )}

        {status === "failed" && (
          <>
            <XCircleIcon className="donate-return__icon donate-return__icon--failed" />
            <p className="donate-return__text">
              Κάτι πήγε στραβά με την πληρωμή σου. Μπορείς να επιστρέψεις στη μετάδοση και να δοκιμάσεις ξανά.
            </p>
          </>
        )}

        <a href="/live" className="donate-return__link">
          Επιστροφή στη μετάδοση
        </a>
      </div>
    </div>
  )
}
