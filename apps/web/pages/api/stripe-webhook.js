import { stripe } from "../../utils/stripe";
import { createClient } from "@supabase/supabase-js";
import { buffer } from "micro";

export const config = { api: { bodyParser: false } };

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SIGNING_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.user_id;

    if (userId) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ subscription_status: "premium" })
        .eq("id", userId);

      if (error) {
        console.error("Failed to update user subscription status:", error);
      }
    }
  }

  res.status(200).json({ received: true });
}