import "../styles/globals.css";
import { AuthProvider } from "context/AuthContext";
import { createClient } from "supabase-client/supabase";
import { Layout } from "../components/Layout";
import { Toaster } from "react-hot-toast";

// Create a single supabase client for the app
const supabaseClient = createClient();

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider supabaseClient={supabaseClient}>
      <Layout>
        <Component {...pageProps} />
        <Toaster />
      </Layout>
    </AuthProvider>
  );
}

export default MyApp;