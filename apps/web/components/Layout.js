import { Header } from "./Header";
import { useRouter } from "next/router";

export const Layout = ({ children }) => {
  const router = useRouter();
  const noHeaderRoutes = ["/login"];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {!noHeaderRoutes.includes(router.pathname) && <Header />}
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};