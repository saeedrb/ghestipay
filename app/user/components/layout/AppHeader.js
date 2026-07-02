"use client";

import Link from "next/link";
import { Bell, ChevronLeft, WalletCards, Wallet } from "lucide-react";
import { useAuthStore } from "@/shared/stores/auth.store";

export default function AppHeader() {
  const user = useAuthStore((s) => s.user);

  const fullName = [user?.name, user?.family].filter(Boolean).join(" ").trim();

  return (
    <header className="fixed left-1/2 top-0 z-50 w-full max-w-md -translate-x-1/2 border-b border-white/60 bg-white/45 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur-2xl backdrop-saturate-150 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/90">
      <div className="mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/user/profile"
            className="header-profile flex min-w-0 items-center gap-3"
          >
            <div className="profile-avatar flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-sm">
              <span className="text-sm font-bold">
                {(user?.name?.[0] || "U").toUpperCase()}
              </span>
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-zinc-400">
                خوش اومدی
              </p>

              <div className="flex items-center gap-1">
                <h1 className="truncate text-sm font-bold text-zinc-900">
                  {fullName || "کاربر"}
                </h1>
                <ChevronLeft className="profile-chevron h-3.5 w-3.5 text-zinc-300" />
              </div>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/user/wallet"
            aria-label="کیف پول"
            className="header-action header-action-wallet relative flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all duration-200 active:scale-95"
          >
            <Wallet size={18} />
          </Link>

          <Link
            href="/user/notifications"
            aria-label="اعلان‌ها"
            className="header-action header-action-bell relative flex h-11 w-11 items-center justify-center rounded-2xl border border-zinc-200 bg-white text-zinc-700 shadow-sm transition-all duration-200 active:scale-95"
          >
            <Bell size={18} />
            <span className="notification-dot absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
          </Link>
        </div>
      </div>

      <style>{`
        .header-profile {
          animation: headerFadeUp 640ms cubic-bezier(0.2, 0.85, 0.2, 1) both;
        }

        .profile-avatar {
          animation:
            avatarFloat 2.8s ease-in-out 700ms infinite,
            avatarGlow 2.8s ease-in-out 700ms infinite;
          transition:
            transform 220ms ease,
            box-shadow 220ms ease;
        }

        .header-profile:active .profile-avatar {
          transform: scale(0.94);
        }

        .header-profile:hover .profile-avatar {
          transform: translateY(-1px) scale(1.03);
          box-shadow: 0 10px 22px rgba(24, 24, 27, 0.14);
        }

        .profile-chevron {
          transition: transform 220ms ease;
        }

        .header-profile:hover .profile-chevron {
          transform: translateX(-2px);
        }

        .header-action {
          animation: headerFadeUp 640ms cubic-bezier(0.2, 0.85, 0.2, 1) both;
        }

        .header-action-wallet {
          animation-delay: 110ms;
        }

        .header-action-bell {
          animation-delay: 220ms;
        }

        .header-action svg {
          transition:
            transform 220ms cubic-bezier(0.2, 0.85, 0.2, 1),
            color 220ms ease;
        }

        .header-action-wallet svg {
          animation: walletBob 2.9s ease-in-out 900ms infinite;
        }

        .header-action-bell svg {
          transform-origin: 50% 0%;
          animation: bellRing 3.2s ease-in-out 1200ms infinite;
        }

        .header-action:hover svg {
          transform: translateY(-1px) scale(1.08);
          color: #2563eb;
        }

        .header-action:active svg {
          transform: scale(0.88);
        }

        .notification-dot {
          animation:
            notificationPulse 1.55s ease-in-out infinite,
            notificationPop 3.2s ease-in-out 1200ms infinite;
        }

        @keyframes headerFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes avatarFloat {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }

        @keyframes avatarGlow {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(37, 99, 235, 0);
          }
          50% {
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.18);
          }
        }

        @keyframes walletBob {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          45% {
            transform: translateY(-3px) rotate(-4deg);
          }
          60% {
            transform: translateY(-2px) rotate(3deg);
          }
        }

        @keyframes bellRing {
          0%,
          72%,
          100% {
            transform: rotate(0deg);
          }
          78% {
            transform: rotate(14deg);
          }
          84% {
            transform: rotate(-12deg);
          }
          90% {
            transform: rotate(8deg);
          }
          96% {
            transform: rotate(-4deg);
          }
        }

        @keyframes notificationPulse {
          0%,
          100% {
            box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.28);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(244, 63, 94, 0);
          }
        }

        @keyframes notificationPop {
          0%,
          72%,
          100% {
            transform: scale(1);
          }
          82% {
            transform: scale(1.35);
          }
          92% {
            transform: scale(0.95);
          }
        }
      `}</style>
    </header>
  );
}
