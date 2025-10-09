import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "supabase-client/supabase";

const AuthContext = createContext({
  user: null,
  session: null,
  supabaseClient: createClient(),
});

export const AuthProvider = ({ supabaseClient, children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const fetchUserAndSession = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      setUser(user ?? null);
      const { data: { session } } = await supabaseClient.auth.getSession();
      setSession(session ?? null);
    };

    fetchUserAndSession();

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        const { data: { user } } = await supabaseClient.auth.getUser();
        setUser(user ?? null);
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabaseClient]);

  const value = { user, session, supabaseClient };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);