"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useAuthStore } from "@/shared/stores/auth.store";

export default function AppHeader() {
  const user = useAuthStore((s) => s.user)


  return (
    <header className="
      sticky top-0 z-50
      h-14 px-4
      flex items-center justify-between
      bg-white/50 backdrop-blur-xl
      border-b border-b-[#e5e7eb] border-solid
    ">

      {/* User */}
      <div className="flex flex-col leading-tight">
        <span className="text-[10px] text-gray-400">
          خوش آمدید
        </span>
        <span className="text-sm font-medium text-gray-800">
          {user[0]?.name}
        </span>
      </div>

      {/* Notification Link */}
      <Link
        href="/notifications"
        className="
          relative
          w-9 h-9
          flex items-center justify-center
          rounded-full
          bg-white/40
          backdrop-blur-md
          border border-white/30
          active:scale-95 transition
        "
      >
        <Bell size={18} className="text-gray-700" />

        {/* Badge */}
        <span className="
          absolute top-2 right-2
          w-2 h-2
          bg-red-500
          rounded-full
        " />
      </Link>

    </header>
  );
}