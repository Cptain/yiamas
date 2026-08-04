import type { Icon } from "@phosphor-icons/react"
import {
  CoinIcon,
  CoinsIcon,
  MusicNotesIcon,
  HandCoinsIcon,
  PiggyBankIcon,
  HandHeartIcon,
  BeerSteinIcon,
} from "@phosphor-icons/react"

export type GiftCategory = "money" | "drink"

export type Gift = {
  id: string
  name: string
  category: GiftCategory
  price: number
  icon: Icon
}

export type ChatMessage = {
  id: string
  user: string
  isYou?: boolean
  text?: string
  label?: string
  giftId?: string
  presetId?: string
  quantity?: number
  amount?: number
}

export type DonationEvent = {
  id: string
  user: string
  isYou?: boolean
  giftId: string
  quantity: number
  amount: number
  label?: string
  presetId?: string
}

// Quick-select donation amounts shown on the donation panel, in euros.
export const DONATION_PRESETS = [
  { id: "amount-1", label: "1€", subtext: "Μπουρμπουάρ", amount: 1, icon: CoinIcon },
  { id: "amount-2", label: "2€", subtext: "Κέρασμα", amount: 2, icon: CoinsIcon },
  { id: "amount-5", label: "5€", subtext: "Αφιέρωση", amount: 5, icon: HandHeartIcon },
  { id: "beer-sixpack", label: "8€", subtext: "Εξάδα Μπύρες", amount: 24, icon: BeerSteinIcon },
  { id: "amount-10", label: "10€", subtext: "Παραγγελιά", amount: 10, icon: MusicNotesIcon },
] as const

export const PRESET_BY_ID: Record<string, (typeof DONATION_PRESETS)[number]> = Object.fromEntries(
  DONATION_PRESETS.map((p) => [p.id, p])
)

export const GIFTS: Gift[] = [
  { id: "cash", name: "Δωρεά", category: "money", price: 1, icon: CoinsIcon },
  { id: "bigtip", name: "Μεγάλο Φιλοδώρημα", category: "money", price: 50, icon: HandCoinsIcon },
  { id: "beer-sixpack", name: "6άδα Μπύρες", category: "drink", price: 24, icon: BeerSteinIcon },
]

export const GIFT_BY_ID: Record<string, Gift> = Object.fromEntries(GIFTS.map((g) => [g.id, g]))

export function categoryColor(category: GiftCategory): string {
  switch (category) {
    case "money":
      return "gold"
    case "drink":
      return "primary"
  }
}

export const HOST = {
  name: "Λαογραφικός Όμιλος Χανίων",
  handle: "@handle_here",
  location: "Ξηροστέρνι, Χανιά, Κρήτη",
  avatar: "/host-avatar.jpg",
}
