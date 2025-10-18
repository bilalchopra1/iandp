import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext({
  user: null,
  session: null,
  supabaseClient: null,
  isLoading: true,
});

export const AuthProvider = ({ children, supabaseClient }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (supabaseClient) {
      const {
        data: { subscription },
      } = supabaseClient.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      });

      // Set initial state
      (async () => {
        const {
          data: { session },
        } = await supabaseClient.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })();

      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [supabaseClient]);

  const value = {
    user,
    session,
    supabaseClient,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};