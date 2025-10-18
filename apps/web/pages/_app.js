import "../styles/globals.css";
import { useState } from "react";
import Head from "next/head";
import { AuthProvider } from "context/AuthContext";
import { createBrowserClient } from "@supabase/ssr";
import { Layout } from "../components/Layout";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
  // Create a new supabase client for each page load on the browser.
  const [supabaseClient] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ));

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider supabaseClient={supabaseClient}>
        <Head>
          <title>I&P - Image & Prompt</title>
          <meta name="description" content="Unlock the prompts behind any AI-generated image." />
          <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        </Head>
        <Layout>
          <Component {...pageProps} />
          <Toaster />
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default MyApp;