import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { Card, GradientHeading } from "ui";
import { AuthForm } from "../components/AuthForm";
import Image from "next/image";

export default function LoginPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If the user is already logged in, redirect them to the home page
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <Image
            src="/logo.svg"
            alt="AI Prompt Finder Logo"
            width={80}
            height={80}
            className="mx-auto mb-4"
        />
        <GradientHeading>Welcome Back</GradientHeading>
        <p className="text-neutral-400">Sign in to continue to AI Prompt Finder</p>
      </div>
      <Card className="w-full max-w-sm">
        <AuthForm />
      </Card>
    </div>
  );
}