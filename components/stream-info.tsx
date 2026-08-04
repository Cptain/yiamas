"use client"

import Image from "next/image"
import { useState } from "react"
import { MapPinIcon, ShareIcon, CopyIcon, CheckIcon, XIcon } from "@phosphor-icons/react"
import { HOST } from "@/lib/festival-data"

export function StreamInfo({ raised, viewers }: { raised: number; viewers: number }) {
  const [shareOpen, setShareOpen] = useState(false)
  const [shareUrl, setShareUrl] = useState("")
  const [copied, setCopied] = useState(false)

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard API unavailable/denied — the popup still shows the URL to copy manually.
    }
  }

  function handleShareClick() {
    const next = !shareOpen
    setShareOpen(next)
    if (next) {
      const href = window.location.href
      setShareUrl(href)
      copyUrl(href)
    }
  }

  return (
    <div className="stream-info">
      <h1 className="stream-info__title">
        Ξηροστέρνι Πανηγύρι 2026 με τον Νίκο Καρκάνη!
      </h1>

      <div className="stream-info__host">
        <Image
          src={HOST.avatar || "/placeholder.svg"}
          alt={`Φωτογραφία οικοδεσπότη ${HOST.name}`}
          width={44}
          height={44}
          className="stream-info__avatar"
        />
        <div className="stream-info__host-details">
          <p className="stream-info__host-name">{HOST.name}</p>
          <p className="stream-info__host-location">
            <MapPinIcon />
            {HOST.location}
          </p>
        </div>

        <div className="stream-info__actions">
          <div className="stream-info__share">
            <button type="button" className="stream-info__share-button" onClick={handleShareClick}>
              <ShareIcon />
              <span className="stream-info__share-label">Κοινοποίηση</span>
            </button>

            {shareOpen && (
              <div className="stream-info__share-popup" role="dialog" aria-label="Κοινοποίηση συνδέσμου">
                <button
                  type="button"
                  className="stream-info__share-close"
                  aria-label="Κλείσιμο"
                  onClick={() => setShareOpen(false)}
                >
                  <XIcon />
                </button>
                <p className="stream-info__share-title">Κοινοποίησε τη μετάδοση</p>
                <p className="stream-info__share-url">{shareUrl}</p>
                <button type="button" className="stream-info__share-copy" onClick={() => copyUrl(shareUrl)}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  {copied ? "Αντιγράφηκε" : "Αντιγραφή"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="stream-info__stats">
        <div className="stream-info__stat">
          <p className="stream-info__stat-value stream-info__stat-value--accent">{raised.toFixed(0)}€</p>
          <p className="stream-info__stat-label">Μαζεύτηκαν απόψε</p>
        </div>
        <div className="stream-info__stat">
          <p className="stream-info__stat-value">{viewers.toLocaleString()}</p>
          <p className="stream-info__stat-label">Θεατές</p>
        </div>
        <div className="stream-info__stat">
          <p className="stream-info__stat-value">3ω 24λ</p>
          <p className="stream-info__stat-label">Διάρκεια μετάδοσης</p>
        </div>
      </div>
    </div>
  )
}
