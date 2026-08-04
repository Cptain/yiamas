"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { GIFT_BY_ID, categoryColor, type ChatMessage, type DonationEvent } from "@/lib/festival-data"
import { FestivalHeader } from "@/components/festival-header"
import { VideoPlayer } from "@/components/video-player"
import { StreamInfo } from "@/components/stream-info"
import { DonationPanel } from "@/components/donation-panel"
import { LiveChat } from "@/components/live-chat"
import { DonationModal, type DonationRequest } from "@/components/donation-modal"
import { AuthModal } from "@/components/auth-modal"
import type { FloatingGift } from "@/components/floating-gifts"

const GOAL = 500
const PENDING_DONATION_KEY = "yiamas:pendingDonation"
const NICKNAME_KEY = "yiamas:nickname"

export function YiamasApp() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [totalRaised, setTotalRaised] = useState(0)
  const [viewers, setViewers] = useState(1247)
  const [alert, setAlert] = useState<DonationEvent | null>(null)
  const [floatingGifts, setFloatingGifts] = useState<FloatingGift[]>([])
  const [donationRequest, setDonationRequest] = useState<DonationRequest | null>(null)
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [chatVisible, setChatVisible] = useState(true)
  const [testPanelVisible, setTestPanelVisible] = useState(false)
  const [alertPinned, setAlertPinned] = useState(false)
  const [nickname, setNickname] = useState<string>(() => {
    if (typeof window === "undefined") return ""
    return localStorage.getItem(NICKNAME_KEY) ?? ""
  })

  const idRef = useRef(0)
  const nextId = useCallback(() => String(++idRef.current), [])

  const pushMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      const next = [...prev, msg]
      return next.length > 80 ? next.slice(next.length - 80) : next
    })
  }, [])

  const registerDonation = useCallback(
    (giftId: string, quantity: number, amount: number, user: string, isYou: boolean, label?: string, text?: string, presetId?: string) => {
      const id = nextId()
      pushMessage({ id, user, isYou, giftId, quantity, amount, label, text, presetId })
      setTotalRaised((prev) => prev + amount)
      setAlert({ id, user, isYou, giftId, quantity, amount, label, presetId })

      const gift = GIFT_BY_ID[giftId]
      if (gift) {
        const fg: FloatingGift = {
          id,
          icon: gift.icon,
          color: categoryColor(gift.category),
          left: 15 + Math.random() * 65,
        }
        setFloatingGifts((prev) => [...prev, fg])
        window.setTimeout(() => {
          setFloatingGifts((prev) => prev.filter((g) => g.id !== id))
        }, 2600)
      }
    },
    [nextId, pushMessage],
  )

  const triggerTestAlert = useCallback(() => {
    const names = ["Γιώργης", "Μαρία", "Νίκος", "Ελένη", "Κώστας", "Στέφανος", "Δήμητρα"]
    const pool: { giftId: string; amount: number; label: string; presetId?: string }[] = [
      // Preset options
      { giftId: "cash",         amount: 1,  label: "Μπουρμπουάρ",    presetId: "amount-1" },
      { giftId: "cash",         amount: 2,  label: "Κέρασμα",         presetId: "amount-2" },
      { giftId: "cash",         amount: 5,  label: "Αφιέρωση",        presetId: "amount-5" },
      { giftId: "beer-sixpack", amount: 24, label: "Εξάδα Μπύρες", presetId: "beer-sixpack" },
      { giftId: "cash",         amount: 10, label: "Παραγγελιά",      presetId: "amount-10" },
      // Custom amounts — tiered labels
      { giftId: "cash", amount: 3,  label: "δωρεά" },
      { giftId: "cash", amount: 7,  label: "δωρεά" },
      { giftId: "cash", amount: 15, label: "μεγάλη δωρεά" },
      { giftId: "cash", amount: 20, label: "μεγάλη δωρεά" },
      { giftId: "cash", amount: 30, label: "τεράστια δωρεά" },
      { giftId: "cash", amount: 50, label: "απίστευτη δωρεά" },
    ]
    const pick = pool[Math.floor(Math.random() * pool.length)]
    const user = names[Math.floor(Math.random() * names.length)]
    registerDonation(pick.giftId, 1, pick.amount, user, false, pick.label, undefined, pick.presetId)
  }, [registerDonation])

  // Opens the registration + Stripe payment modal for the amount the viewer picked.
  const handleDonateRequest = useCallback((giftId: string, label: string, amount: number, message: string, presetId?: string) => {
    setDonationRequest({ giftId, label, amount, message, presetId })
  }, [])

  const handleSend = useCallback(
    (text: string, nickname: string) => {
      pushMessage({ id: nextId(), user: nickname, isYou: true, text })
    },
    [nextId, pushMessage],
  )

  // Credit a donation once the viewer returns from the Stripe 3D Secure
  // redirect with a confirmed payment (see app/donate/return). This is a
  // fallback path — the primary flow confirms and credits inline within the
  // donation modal without ever leaving this page.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PENDING_DONATION_KEY)
      if (!raw) return
      sessionStorage.removeItem(PENDING_DONATION_KEY)
      const pending = JSON.parse(raw) as {
        giftId: string
        label: string
        amount: number
        message?: string
        presetId?: string
        confirmed?: boolean
      }
      if (pending.confirmed) {
        const name = localStorage.getItem(NICKNAME_KEY) || "Ανώνυμος"
        registerDonation(pending.giftId, 1, pending.amount, name, true, pending.label, pending.message, pending.presetId)
      }
    } catch {
      // ignore malformed/absent storage
    }
    // Runs once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Fluctuating viewer count
  useEffect(() => {
    const interval = window.setInterval(() => {
      setViewers((prev) => Math.max(900, prev + Math.floor(Math.random() * 41) - 18))
    }, 4000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="app">
      {/* Warm ambient glow — evokes the festival string lights overhead */}
      <div aria-hidden="true" className="app__glow" />

      <FestivalHeader user={user} onLoginClick={() => setAuthModalOpen(true)} onLogout={() => setUser(null)} />

      <main className="app__main">
        <div className={`app__grid${chatVisible ? "" : " app__grid--no-chat"}`}>
          {/* Main column */}
          <div className="app__column">
            <VideoPlayer viewers={viewers} alert={alert} alertPinned={alertPinned} floatingGifts={floatingGifts} chatVisible={chatVisible} onToggleChat={() => setChatVisible((v) => !v)} testPanelVisible={testPanelVisible} onToggleTestPanel={() => setTestPanelVisible((v) => !v)} />
            <StreamInfo raised={totalRaised} viewers={viewers} />
          </div>

          {/* Chat column */}
          <div className={`app__column app__column--chat${chatVisible ? "" : " app__column--chat-hidden"}`}>
            <LiveChat messages={messages} viewers={viewers} onSend={handleSend} nickname={nickname} onNicknameChange={setNickname} />
          </div>

          {/* Donation column — last in DOM so it flows below chat on mobile */}
          <div className="app__column app__column--donation">
            <DonationPanel totalRaised={totalRaised} goal={GOAL} onDonateRequest={handleDonateRequest} />
          </div>
        </div>
      </main>

      <AuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthenticated={(email) => setUser({ email })}
      />

      <DonationModal
        request={donationRequest}
        user={user}
        onAuthenticated={(email) => setUser({ email })}
        onConfirmed={() => {
          if (donationRequest) {
            registerDonation(donationRequest.giftId, 1, donationRequest.amount, nickname || "Ανώνυμος", true, donationRequest.label, donationRequest.message, donationRequest.presetId)
          }
        }}
        onClose={() => setDonationRequest(null)}
      />

      {/* Dev test panel */}
      <div className={`dev-test-panel${testPanelVisible ? " dev-test-panel--open" : ""}`}>
        <button className="dev-test-panel__trigger" onClick={triggerTestAlert} title="Trigger a test donation alert">
          Trigger Alert
        </button>
        <button
          className={`dev-test-panel__pin${alertPinned ? " dev-test-panel__pin--active" : ""}`}
          onClick={() => setAlertPinned((v) => !v)}
          title={alertPinned ? "Let alert auto-hide" : "Pin alert visible"}
        >
          {alertPinned ? "📌 Pinned" : "📌 Pin"}
        </button>
      </div>
    </div>
  )
}
