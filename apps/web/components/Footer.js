import Link from 'next/link';
import Image from 'next/image';

const FooterLink = ({ href, children }) => (
  <Link href={href} className="text-neutral-400 hover:text-white transition-colors duration-200">
    {children}
  </Link>
);

export const Footer = () => {
  return (
    <footer className="bg-neutral-900 border-t border-neutral-800 mt-24">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="space-y-4 col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo-for-dark-theme.svg" alt="Logo" width={220} height={220} />
            </Link>
            <p className="text-neutral-400 text-sm">Unlock the prompts behind any image.</p>
            <p className="text-neutral-500 text-xs">&copy; {new Date().getFullYear()} I&P. All rights reserved.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-3">
              <li><FooterLink href="/">Generate</FooterLink></li>
              <li><FooterLink href="/explore">Explore</FooterLink></li>
              <li><FooterLink href="/account">My Account</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">Community</h3>
            <ul className="mt-4 space-y-3">
              <li><FooterLink href="#">Discord</FooterLink></li>
              <li><FooterLink href="#">Twitter</FooterLink></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-300 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-3"> 
              <li><FooterLink href="/privacy">Privacy Policy</FooterLink></li>
              <li><FooterLink href="/terms">Terms of Service</FooterLink></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};