"use client"

import { useState } from "react"
import { GiftIcon, CoinsIcon } from "@phosphor-icons/react"
import { Button } from "@/components/ui/button"
import { DONATION_PRESETS } from "@/lib/festival-data"

type DonationPanelProps = {
  totalRaised: number
  goal: number
  onDonateRequest: (giftId: string, label: string, amount: number, message: string, presetId?: string) => void
}

export function DonationPanel({ totalRaised, goal, onDonateRequest }: DonationPanelProps) {
  const [amount, setAmount] = useState("")
  const [message, setMessage] = useState("")
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const progress = Math.min(100, (totalRaised / goal) * 100)
  const numericAmount = Number.parseFloat(amount)
  const canDonate = Number.isFinite(numericAmount) && numericAmount > 0
  const charCount = message.length
  const messageOverLimit = charCount > 100

  function selectPreset(preset: (typeof DONATION_PRESETS)[number]) {
    setSelectedPreset(preset.id)
    setAmount(String(preset.amount))
  }

  function handleAmountChange(value: string) {
    setAmount(value)
    setSelectedPreset(null)
  }

  function customLabel(amount: number): string | undefined {
    if (amount >= 41) return "απίστευτη δωρεά"
    if (amount >= 21) return "τεράστια δωρεά"
    if (amount >= 11) return "μεγάλη δωρεά"
    if (amount >= 3) return "δωρεά"
    return undefined
  }

  function handleDonateClick() {
    if (!canDonate || messageOverLimit) return
    const preset = DONATION_PRESETS.find((p) => p.id === selectedPreset)
    const giftId = preset?.id === "beer-sixpack" ? "beer-sixpack" : "cash"
    const label = preset ? preset.subtext : customLabel(numericAmount)
    onDonateRequest(giftId, label ?? "", numericAmount, message.trim(), preset?.id)
  }

  return (
    <section className="donation-panel" aria-label="Στείλε δωρεά">
      {/* Goal */}
      <div className="donation-panel__goal">
        <div className="donation-panel__goal-row">
          <div className="donation-panel__goal-title">
            <GiftIcon />
            <h2>Στήριξε το Πανηγύρι</h2>
          </div>
          <p className="donation-panel__goal-text">
            <span className="donation-panel__goal-amount">{totalRaised.toFixed(0)}€</span> / {goal}€ — πλήρωσε το
            συγκρότημα
          </p>
        </div>
        <div className="donation-panel__progress">
          <div className="donation-panel__progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Preset amounts + Custom amount + Message */}
      <div className="donation-panel__amount-group">
        <div className="donation-panel__presets">
          {DONATION_PRESETS.map((preset) => {
            const Icon = preset.icon
            const active = selectedPreset === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => selectPreset(preset)}
                className={`donation-panel__preset${active ? " donation-panel__preset--active" : ""}`}
              >
                <Icon className="donation-panel__preset-icon" />
                {preset.label}
                <span className="donation-panel__preset-subtext">{preset.subtext}</span>
              </button>
            )
          })}
        </div>

        <div className="donation-panel__inputs-row">
          <label className="donation-panel__custom">
            <span className="donation-panel__custom-label">Ή δικό σας ποσό</span>
            <div className="donation-panel__custom-inner">
              <CoinsIcon className="donation-panel__custom-icon" />
              <input
                type="number"
                min={1}
                inputMode="decimal"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleDonateClick()
                  }
                }}
                placeholder="Ποσό σε ευρώ"
                aria-label="Ποσό δωρεάς σε ευρώ"
                className="donation-panel__input"
              />
              <span className="donation-panel__currency">€</span>
            </div>
          </label>

          <div className="donation-panel__message-wrap">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Προαιρετικό μήνυμα…"
              aria-label="Προαιρετικό μήνυμα δωρεάς"
              rows={2}
              className={`donation-panel__message${messageOverLimit ? " donation-panel__message--over" : ""}`}
            />
            <p className={`donation-panel__message-count${messageOverLimit ? " donation-panel__message-count--over" : ""}`}>
              {charCount}/100
            </p>
          </div>
        </div>

        <div className="donation-panel__submit">
          <Button type="button" className="btn--2xl" onClick={handleDonateClick} disabled={!canDonate}>
            Δωρεά
          </Button>
        </div>
      </div>
    </section>
  )
}
