"use client"

import type { Icon } from "@phosphor-icons/react"

export type FloatingGift = {
  id: string
  icon: Icon
  color: string
  left: number
}

export function FloatingGifts({ gifts }: { gifts: FloatingGift[] }) {
  return (
    <div className="floating-gifts">
      {gifts.map((g) => {
        const Icon = g.icon
        return (
          <div key={g.id} className="floating-gifts__item animate-float-up" style={{ left: `${g.left}%` }}>
            <div className={`floating-gifts__icon floating-gifts__icon--${g.color}`}>
              <Icon weight="bold" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
