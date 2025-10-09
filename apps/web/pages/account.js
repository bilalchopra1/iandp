import { createServerClient, serialize } from "@supabase/ssr";
import { useAuth } from "context/AuthContext";
import { Card, GradientHeading, DarkButton } from "ui";

export default function AccountPage() {
  const { user, supabaseClient } = useAuth();

  if (!user) {
    return null; // Or a loading spinner
  }

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <GradientHeading className="mb-8">My Account</GradientHeading>
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-neutral-300">User Details</h3>
            <div className="mt-2 space-y-2 text-neutral-400">
              <p><span className="font-semibold text-neutral-300">User ID:</span> {user.id}</p>
              <p><span className="font-semibold text-neutral-300">Email:</span> {user.email}</p>
              <p><span className="font-semibold text-neutral-300">Account Created:</span> {formatDate(user.created_at)}</p>
              <p><span className="font-semibold text-neutral-300">Last Signed In:</span> {formatDate(user.last_sign_in_at)}</p>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-4">
            <DarkButton
              onClick={async () => {
                try {
                  const { error } = await supabaseClient.auth.signOut();
                  if (error) {
                    console.error('Logout error:', error);
                    return;
                  }
                  // Redirect will be handled by AuthContext
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
              className="w-full sm:w-auto"
            >
              Sign Out
            </DarkButton>
          </div>
        </div>
      </Card>
    </div>
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => {
          return ctx.req.cookies[name];
        },
        set: (name, value, options) => {
          const cookie = serialize(name, value, options);
          let header = ctx.res.getHeader('Set-Cookie') || [];
          if (!Array.isArray(header)) header = [String(header)];
          ctx.res.setHeader('Set-Cookie', [...header, cookie]);
        },
        remove: (name, options) => {
          const cookie = serialize(name, '', { ...options, maxAge: -1 });
          let header = ctx.res.getHeader('Set-Cookie') || [];
          if (!Array.isArray(header)) header = [String(header)];
          ctx.res.setHeader('Set-Cookie', [...header, cookie]);
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

  return { props: {} };
};