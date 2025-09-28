import { Header } from "./Header";

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
};