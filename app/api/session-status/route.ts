import { NextResponse } from "next/server"
import { getStripe } from "@/lib/stripe"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get("session_id")

  if (!sessionId || !/^cs_/.test(sessionId)) {
    return NextResponse.json({ error: "Μη έγκυρο session ID." }, { status: 400 })
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId)
    return NextResponse.json({ status: session.payment_status })
  } catch (error) {
    console.error("Stripe session retrieval failed", error)
    return NextResponse.json({ error: "Αδυναμία ανάκτησης κατάστασης πληρωμής." }, { status: 502 })
  }
}
