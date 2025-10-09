import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { DarkButton, GradientButton } from "ui";
import { LogOut, ChevronLeft } from "lucide-react";

export const Header = () => {
  const { user, supabaseClient } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const { error } = await supabaseClient.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        return;
      }
      // The AuthContext will handle the user state update automatically
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <header className="bg-neutral-950 p-4 sticky top-0 z-10">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
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
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <>
              <Link href="/explore" passHref>
                <DarkButton>Explore</DarkButton>
              </Link>
              <Link href="/packs" passHref>
                <DarkButton>Packs</DarkButton>
              </Link>
              <Link href="/history" passHref>
                <DarkButton>History</DarkButton>
              </Link>
              <Link href="/account" passHref>
                <DarkButton>Account</DarkButton>
              </Link>
              <DarkButton
                onClick={handleSignOut}
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