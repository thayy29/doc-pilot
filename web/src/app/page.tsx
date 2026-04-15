'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "authenticated") {
      router.replace("/projects");
    } else {
      router.replace("/login");
    }
  }, [status, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <p className="text-sm font-semibold text-foreground-muted">
        Redirecionando...
      </p>
    </div>
  );
}
