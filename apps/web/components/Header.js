import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { supabase } from "supabase-client";
import { DarkButton, GradientButton } from "ui";
import { LogOut, ChevronLeft } from "lucide-react";

export const Header = () => {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <header className="bg-neutral-950 p-4 sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          {router.pathname !== "/" && (
            <DarkButton onClick={() => router.back()} className="!p-2" aria-label="Go back">
              <ChevronLeft size={18} />
            </DarkButton>
          )}
                  <div className="flex items-center gap-4">
                    {router.pathname !== "/" && (
                      <DarkButton onClick={() => router.back()} className="!p-2" aria-label="Go back">
                        <ChevronLeft size={18} />
                      </DarkButton>
                    )}
                    <Link href="/" passHref>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <Image src="/logo.svg" alt="AI Prompt Finder Logo" width={50} height={50} />
                        <span className="font-semibold text-xl hidden sm:block">
                          AI Prompt Finder
                        </span>
                      </div>
                    </Link>
                  </div>        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link href="/explore" passHref>
                <DarkButton>Explore</DarkButton>
              </Link>
              <Link href="/history" passHref>
                <DarkButton>My History</DarkButton>
              </Link>
              <DarkButton
                onClick={() => supabase.auth.signOut()}
                className="!p-2"
                aria-label="Sign Out"
              >
                <LogOut size={18} />
              </DarkButton>
            </>
          )}
          {!user && router.pathname !== "/login" && (
            <Link href="/login" passHref>
              <GradientButton>Login / Sign Up</GradientButton>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};