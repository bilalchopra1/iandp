import "../styles/globals.css";
import { AuthProvider } from "context/AuthContext";
import { supabase } from "supabase-client";
import { Layout } from "../components/Layout";

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider supabaseClient={supabase}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;