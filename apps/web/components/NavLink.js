import Link from 'next/link';
import { useRouter } from 'next/router';
import clsx from 'clsx';

export const NavLink = ({ href, children }) => {
  const router = useRouter();
  const isActive = router.pathname === href;

  return (
    <Link
      href={href}
      className={clsx(
        'px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white'
          : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white'
      )}
    >
      {children}
    </Link>
  );
};