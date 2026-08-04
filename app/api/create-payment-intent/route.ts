import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"

export async function POST(request: Request) {
  let body: { amount?: unknown; giftName?: unknown; email?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Μη έγκυρο αίτημα." }, { status: 400 })
  }

  const amount = Number(body.amount)
  if (!Number.isFinite(amount) || amount < 1 || amount > 5000) {
    return NextResponse.json({ error: "Μη έγκυρο ποσό δωρεάς." }, { status: 400 })
  }

  const email = typeof body.email === "string" ? body.email.slice(0, 200) : undefined
  const giftName = typeof body.giftName === "string" ? body.giftName.slice(0, 100) : "Δωρεά"

  // Derive the origin from the request so the return_url works in all environments.
  const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      ui_mode: "elements",
      line_items: [
        {
          price_data: {
            currency: "eur",
            // Amount is always decided server-side, in cents, to prevent tampering.
            product_data: { name: giftName },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      // {CHECKOUT_SESSION_ID} is a Stripe template literal replaced at redirect time.
      return_url: `${origin}/donate/return?session_id={CHECKOUT_SESSION_ID}`,
      customer_email: email,
      metadata: { giftName },
    })

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error("Stripe Checkout Session creation failed", error)
    return NextResponse.json(
      { error: "Δεν ήταν δυνατή η προετοιμασία της πληρωμής. Δοκίμασε ξανά." },
      { status: 502 },
    )
  }
}
