import { createPagesServerClient } from "@supabase/ssr";
import { stripe } from "../../utils/stripe";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const supabase = createPagesServerClient({ req, res });
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { priceId } = req.body;

  if (!priceId) {
    return res.status(400).json({ error: "priceId is required." });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/account?canceled=true`,
      customer_email: user.email,
      metadata: { user_id: user.id },
    });

    res.status(200).json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: "Failed to create checkout session." });
  }
}