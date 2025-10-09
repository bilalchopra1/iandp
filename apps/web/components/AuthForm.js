import { useState } from "react";
import { GradientButton, DarkButton } from "ui";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "context/AuthContext";

export const AuthForm = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const { supabaseClient: supabase } = useAuth();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) { 
        const { error } = await supabase.auth.signUp({ email, password }); 
        if (error) throw error;
        setMessage("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email,
          password,
        });
        if (error) throw error;
        // The onAuthStateChange listener in AuthContext will handle the redirect/UI update
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // Supabase handles the redirect from here
  };

  return (
    <div className="w-full max-w-sm">
      <form onSubmit={handleAuth} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-neutral-300 dark:border-neutral-700 rounded-lg bg-neutral-200 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        <GradientButton type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <LoaderCircle className="animate-spin mx-auto" />
          ) : (
            isSignUp ? "Sign Up" : "Log In"
          )}
        </GradientButton>
      </form>

      {error && <p className="mt-4 text-center text-red-500">{error}</p>}
      {message && <p className="mt-4 text-center text-green-500">{message}</p>}

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
        >
          {isSignUp
            ? "Already have an account? Log In"
            : "Don't have an account? Sign Up"}
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-neutral-300 dark:border-neutral-700" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-neutral-100 dark:bg-neutral-950 text-neutral-500">OR</span>
        </div>
      </div>

      <div className="space-y-3">
        <DarkButton onClick={() => handleOAuth("google")} className="w-full">
          Continue with Google
        </DarkButton>
      </div>
    </div>
  );
};