"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/stores/auth.store";
import Loading from "../components/ui/Loading";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const authPath = ['/otp'];

  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // اجازه بده hydration کامل بشه
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    const isAuthPage = pathname === "/otp";
    const isDashboard =
      pathname.startsWith("/user") || pathname.startsWith("/shop");

    if (!token && isDashboard) {
      router.replace("/");
      return;
    }

    if (token && isAuthPage) {
      if(user?.identify_data?.status !== "verified") {
        router.replace("/identify");
      } else {
        router.replace("/user/dashboard");
      }

      return;
    }
  }, [ready, token, user, pathname]);


  if(hydrated === false) {
    return <Loading fullscreen />;
  }

  return children;
}