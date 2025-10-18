import { createServerClient } from "@supabase/ssr";
import { useAuth } from "context/AuthContext";
import { Card, GradientHeading, DarkButton, GradientButton } from "ui";
import { useState } from "react";
import { getStripe } from "../utils/stripe-client";
import { LoaderCircle } from "lucide-react";

export default function AccountPage({ profile }) {
  const { user, supabaseClient } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async (priceId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { sessionId } = await response.json();
      const stripe = await getStripe();
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Checkout error:", error);
    }
    setLoading(false);
  };
  if (!user) {
    return null; // Or a loading spinner
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="flex flex-col items-center justify-center pt-8">
      <GradientHeading className="mb-8 text-center">My Account</GradientHeading>
      <div className="space-y-8">
        <Card>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">Subscription</h3>
          <div className="flex items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-900 rounded-lg">
            <p className="text-neutral-600 dark:text-neutral-400">
              Your current plan: <span className="font-semibold text-neutral-800 dark:text-white capitalize">{profile?.subscription_status || 'Free'}</span>
            </p>
            {profile?.subscription_status === 'free' ? (
              <GradientButton
                onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_PRICE_ID)}
                disabled={loading}
              >
                {loading ? <LoaderCircle className="animate-spin" /> : 'Upgrade to Pro'}
              </GradientButton>
            ) : (
              <DarkButton disabled={true}>
                Manage Billing
              </DarkButton>
            )}
          </div>
          <div className="mt-4 text-sm text-neutral-600 dark:text-neutral-500">
            <p>Upgrade to Pro for unlimited prompt generations, access to exclusive features, and more.</p>
          </div>
        </Card>
        <Card>
          <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4">User Details</h3>
          <div className="space-y-3 text-neutral-600 dark:text-neutral-400">
            <p><span className="font-semibold text-neutral-700 dark:text-neutral-300 w-32 inline-block">Email:</span> {user.email}</p>
            <p><span className="font-semibold text-neutral-700 dark:text-neutral-300 w-32 inline-block">Account Created:</span> {formatDate(user.created_at)}</p>
            <p><span className="font-semibold text-neutral-700 dark:text-neutral-300 w-32 inline-block">User ID:</span> <span className="text-xs font-mono">{user.id}</span></p>
          </div>
          <div className="mt-6 border-t border-neutral-200 dark:border-neutral-800 pt-4">
            <DarkButton
              onClick={async () => {
                try {
                  const { error } = await supabaseClient.auth.signOut();
                  if (error) {
                    console.error('Logout error:', error);
                    return;
                  }
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className="w-full sm:w-auto"
            >
              Sign Out
            </DarkButton>
          </div>
        </Card>
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => ctx.req.cookies[name],
        set: (name, value, options) => {
          ctx.res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
        },
        remove: (name, options) => {
          ctx.res.setHeader('Set-Cookie', `${name}=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax`);
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  // Fetch user profile to get subscription status
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error("Error fetching user profile for account page:", error);
  }

  return { props: { profile: profile || { subscription_status: 'free' } } };
};