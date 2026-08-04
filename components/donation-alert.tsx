"use client"

import { GIFT_BY_ID, PRESET_BY_ID, categoryColor, type DonationEvent } from "@/lib/festival-data"

export function DonationAlert({ alert, pinned }: { alert: DonationEvent | null; pinned?: boolean }) {
  if (!alert) return null
  const gift = GIFT_BY_ID[alert.giftId]
  if (!gift) return null
  const color = categoryColor(gift.category)
  const preset = alert.presetId ? PRESET_BY_ID[alert.presetId] : undefined
  const Icon = preset?.icon ?? gift.icon

  return (
    <div key={alert.id} className={`donation-alert donation-alert--${color}${pinned ? " donation-alert--pinned" : " animate-alert-in"}`}>
      <div className={`donation-alert__icon donation-alert__icon--${color}`}>
        <Icon />
      </div>
      <div className="donation-alert__body">
        <p className="donation-alert__title">
          <span className="donation-alert__user">{alert.user}</span>
          <span className="donation-alert__verb"> έστειλε </span>
          <span className="donation-alert__gift">{alert.quantity > 1 ? `${alert.quantity}× ` : ""}{alert.label ? alert.label.toLowerCase() : gift.name}!</span>
        </p>
        <p className="donation-alert__amount">{alert.amount.toFixed(2)}€</p>
      </div>
    </div>
  )
}
