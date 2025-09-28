import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "context/AuthContext";
import { Card, DarkButton, GradientHeading } from "ui";
import { AuthForm } from "../components/AuthForm";

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
    <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 left-4">
        <DarkButton onClick={() => router.push("/")}>
          &larr; Back
        </DarkButton>
      </div>
      <GradientHeading className="mb-6">Welcome</GradientHeading>
      <Card>
        {!user && <AuthForm />}
      </Card>
    </div>
  );
}