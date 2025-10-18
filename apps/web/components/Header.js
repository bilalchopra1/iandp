import Link from "next/link";
import { useAuth } from "context/AuthContext";
import { GradientButton } from "ui";
import { ThemeToggle } from "./ThemeToggle";
import { NavLink } from "./NavLink";
import { useRouter } from "next/router";
import { ThemeAwareLogo } from "./ThemeAwareLogo";

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
    <header className="bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm p-4 sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800">
      <nav className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <ThemeAwareLogo width={220} height={220} />
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <NavLink href="/">Generate</NavLink>
          <NavLink href="/explore">Explore</NavLink>
          {user && <NavLink href="/history">My History</NavLink>}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link href="/account" className="flex items-center gap-2 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {user.email ? user.email[0].toUpperCase() : 'U'}
              </div>
            </Link>
          ) : (
            <Link href="/login">
              <GradientButton>Login</GradientButton>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};