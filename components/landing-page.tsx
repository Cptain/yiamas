"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

// 6 Αυγούστου 2026, 22:00 EEST (UTC+3) → 19:00 UTC
const EVENT_TARGET = Date.UTC(2026, 7, 6, 19, 0, 0)

type FireworkSpec = {
  left: string
  bottom: string
  delay: string
  color: string
  color2: string
  scale: number
}

const FIREWORKS: FireworkSpec[] = [
  { left: "18%", bottom: "55%", delay: "0s", color: "#ff5e3a", color2: "#ffd23f", scale: 1.15 },
  { left: "78%", bottom: "62%", delay: "0.9s", color: "#34d1c5", color2: "#fdf6ec", scale: 0.9 },
  { left: "46%", bottom: "74%", delay: "1.8s", color: "#f7c873", color2: "#ff5e3a", scale: 1.3 },
  { left: "30%", bottom: "40%", delay: "2.6s", color: "#ff3fa4", color2: "#ffd23f", scale: 1 },
  { left: "64%", bottom: "36%", delay: "3.4s", color: "#4da6ff", color2: "#fdf6ec", scale: 1.1 },
  { left: "88%", bottom: "48%", delay: "4.2s", color: "#ffd23f", color2: "#ff5e3a", scale: 0.85 },
]

const SPARKLES = [
  { left: "12%", top: "20%", delay: "0.4s" },
  { left: "58%", top: "14%", delay: "1.5s" },
  { left: "82%", top: "30%", delay: "2.3s" },
  { left: "36%", top: "12%", delay: "3.1s" },
  { left: "70%", top: "8%", delay: "3.9s" },
]

function pad(n: number) {
  return String(n).padStart(2, "0")
}

/** Time remaining until the event, computed client-side only (avoids SSR/client clock mismatch). */
function useCountdown(target: number) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  if (now === null) return null
  return target - now
}

export function LandingPage() {
  const diff = useCountdown(EVENT_TARGET)
  const isLive = diff !== null && diff <= 0

  const days = diff !== null ? Math.max(0, Math.floor(diff / 86400000)) : null
  const hours = diff !== null ? Math.max(0, Math.floor((diff % 86400000) / 3600000)) : null
  const mins = diff !== null ? Math.max(0, Math.floor((diff % 3600000) / 60000)) : null
  const secs = diff !== null ? Math.max(0, Math.floor((diff % 60000) / 1000)) : null

  return (
    <div className="landing-hero">
      <div className="landing-hero__background" />
      <div className="landing-hero__overlay" />

      <div className="landing-fireworks" aria-hidden="true">
        {FIREWORKS.map((fw, i) => (
          <span
            key={i}
            className="landing-firework"
            style={
              {
                "--fw-left": fw.left,
                "--fw-bottom": fw.bottom,
                "--fw-delay": fw.delay,
                "--fw-color": fw.color,
                "--fw-color2": fw.color2,
                "--fw-scale": fw.scale,
              } as React.CSSProperties
            }
          />
        ))}
        {SPARKLES.map((sp, i) => (
          <span
            key={i}
            className="landing-sparkle"
            style={
              {
                "--sp-left": sp.left,
                "--sp-top": sp.top,
                "--sp-delay": sp.delay,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <main className="landing-hero__content">
        <div className="landing-logo">
          <span className="landing-logo__text">
            Yiamas<span className="landing-logo__bang">.</span>live
          </span>
        </div>

        <div className={`landing-countdown${isLive ? " landing-countdown--live" : ""}`}>
          {isLive ? (
            <p className="landing-countdown__label">Η ζωντανή μετάδοση ξεκίνησε!</p>
          ) : (
            <>
              <p className="landing-countdown__label">
                Η <em>ζωντανή</em> μετάδοση θα ξεκινήσει σε
              </p>
              <div className="landing-countdown__timer" aria-live="polite">
                <span className="landing-countdown__unit">
                  <span>{days !== null ? pad(days) : "--"}</span>
                  <small>μέρες</small>
                </span>
                <span className="landing-countdown__sep">:</span>
                <span className="landing-countdown__unit">
                  <span>{hours !== null ? pad(hours) : "--"}</span>
                  <small>ώρες</small>
                </span>
                <span className="landing-countdown__sep">:</span>
                <span className="landing-countdown__unit">
                  <span>{mins !== null ? pad(mins) : "--"}</span>
                  <small>λεπτά</small>
                </span>
                <span className="landing-countdown__sep">:</span>
                <span className="landing-countdown__unit">
                  <span>{secs !== null ? pad(secs) : "--"}</span>
                  <small>δευτ.</small>
                </span>
              </div>
            </>
          )}
          <p className="landing-hero__subtitle">
            <em>Ζωντανή</em> μετάδοση από το Ξηροστέρνι Ρεθύμνου! Παρακολούθησε το πανηγύρι από όπου κι αν βρίσκεσαι
            — ζωντανή μουσική, παραγγελίες και αφιερώσεις σε πραγματικό χρόνο.
          </p>
        </div>

        <p className="landing-hero__event">Ξηροστέρνι Πανηγύρι 2026</p>

        <div className="landing-hero__artist">
          <span className="landing-hero__artist-label">Με τον</span>
          <span className="landing-hero__artist-name">Νίκο Καρκάνη</span>
        </div>

        <figure className="landing-hero__poster">
          <Image
            className="landing-hero__poster-image"
            src="/landing-poster.jpg"
            alt="Αφίσα του Ξηροστερνιού Πανηγυριού 2026 με τον Νίκο Καρκάνη"
            width={760}
            height={950}
            priority
          />
        </figure>

        <Link href="/live" className="landing-cta">
          {isLive ? "Μπες στη ζωντανή μετάδοση" : "Δες την προεπισκόπηση"}
        </Link>
      </main>
    </div>
  )
}
