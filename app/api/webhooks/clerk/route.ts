import { Webhook } from "svix"
import { headers } from "next/headers"
import { db } from "@/lib/db"

type WebhookEvent = {
  type: string
  data: {
    id: string
    email_addresses?: { email_address: string }[]
    primary_email_address_id?: string
    first_name?: string
    last_name?: string
    full_name?: string
    image_url?: string
    username?: string
  }
}

export async function POST(req: Request) {
  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    return new Response("Missing CLERK_WEBHOOK_SECRET", { status: 500 })
  }

  const payload = await req.text()
  const wh = new Webhook(secret)

  let evt: WebhookEvent
  try {
    evt = wh.verify(payload, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  const { id } = evt.data
  if (!id) return new Response("Missing user id", { status: 400 })

  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const email =
      evt.data.email_addresses?.find(
        (e) => e.email_address === evt.data.primary_email_address_id
      )?.email_address ??
      evt.data.email_addresses?.[0]?.email_address ??
      `${id}@clerk.dev`

    await db.user.upsert({
      where: { id },
      create: {
        id,
        email,
        name: evt.data.full_name || [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" ") || "User",
        imageUrl: evt.data.image_url ?? null,
      },
      update: {
        email,
        name:
          evt.data.full_name ??
          [evt.data.first_name, evt.data.last_name].filter(Boolean).join(" "),
        imageUrl: evt.data.image_url ?? undefined,
      },
    })
  }

  if (eventType === "user.deleted") {
    await db.user.delete({ where: { id } }).catch(() => {})
  }

  return new Response("OK", { status: 200 })
}
