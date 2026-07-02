"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  PackageCheck,
  ReceiptText,
  WalletCards,
  Copy,
  Check,
} from "lucide-react";

function getRequestState(genericStatus) {
  const map = {
    waiting_credit_score: {
      label: "در انتظار اعتبارسنجی",
      tone: "info",
      subtitle: "فرآیند اعتبارسنجی درخواست شما آغاز شده است",
    },

    credit_score_otp_sent: {
      label: "تایید شماره برای اعتبارسنجی",
      tone: "action",
      subtitle: "کد تایید برای ادامه اعتبارسنجی ارسال شده است",
    },

    credit_score_verified: {
      label: "اعتبارسنجی ثبت شد",
      tone: "info",
      subtitle: "اطلاعات اعتبارسنجی ثبت شده و نتیجه در حال پردازش است",
    },

    credit_score_result_pending: {
      label: "در انتظار نتیجه اعتبارسنجی",
      tone: "info",
      subtitle: "نتیجه اعتبارسنجی هنوز نهایی نشده است",
    },

    waiting_rules: {
      label: "در انتظار تایید قوانین",
      tone: "action",
      subtitle: "برای ادامه، قوانین و شرایط درخواست را تایید کنید",
    },

    waiting_payment: {
      label: "در انتظار پرداخت",
      tone: "warning",
      subtitle: "برای نهایی شدن درخواست، پرداخت را تکمیل کنید",
    },

    waiting_plan_selection: {
      label: "در انتظار انتخاب طرح",
      tone: "action",
      subtitle: "برای ادامه، طرح بازپرداخت خود را انتخاب کنید",
    },

    manual_review: {
      label: "بررسی دستی",
      tone: "info",
      subtitle: "درخواست شما توسط کارشناسان در حال بررسی است",
    },

    waiting_guarantor: {
      label: "در انتظار ثبت ضامن",
      tone: "action",
      subtitle: "برای ادامه درخواست، اطلاعات ضامن را تکمیل کنید",
    },

    waiting_customer_checks: {
      label: "در حال بررسی اطلاعات",
      tone: "info",
      subtitle: "اطلاعات و مدارک شما در حال بررسی است",
    },

    waiting_signature: {
      label: "در انتظار امضای قرارداد",
      tone: "action",
      subtitle: "برای ادامه، قرارداد را امضا کنید",
    },

    under_review: {
      label: "در حال بررسی",
      tone: "info",
      subtitle: "درخواست شما در حال بررسی نهایی است",
    },

    waiting_documents: {
      label: "در انتظار مدارک",
      tone: "action",
      subtitle: "برای ادامه، مدارک موردنیاز را بارگذاری کنید",
    },

    approved: {
      label: "تایید شده",
      tone: "success",
      subtitle: "درخواست شما تایید شده و جزئیات آن در دسترس است",
    },

    rejected: {
      label: "رد شده",
      tone: "danger",
      subtitle: "این درخواست تایید نشده و امکان ادامه آن وجود ندارد",
      rejectionTitle: "این درخواست تایید نشد",
    },

    cancelled: {
      label: "لغو شده",
      tone: "danger",
      subtitle: "این درخواست لغو شده و در حال حاضر فعال نیست",
      rejectionTitle: "این درخواست لغو شده است",
    },
  };

  return (
    map[genericStatus] || {
      label: "در حال بررسی",
      tone: "info",
      subtitle: "وضعیت درخواست شما در حال بررسی است",
    }
  );
}

function getStatusStyles(tone) {
  if (tone === "success") {
    return {
      badge: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
      dot: "bg-emerald-500",
    };
  }

  if (tone === "danger") {
    return {
      badge: "bg-red-50 text-red-600 ring-1 ring-red-100",
      dot: "bg-red-500",
    };
  }

  if (tone === "warning") {
    return {
      badge: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
      dot: "bg-amber-500",
    };
  }

  if (tone === "action") {
    return {
      badge: "bg-sky-50 text-sky-600 ring-1 ring-sky-100",
      dot: "bg-sky-500",
    };
  }

  return {
    badge: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
    dot: "bg-blue-500",
  };
}

function getAction(request, returnQuery = "") {
  const status = request?.genericStatus;

  if (status === "approved") {
    return {
      href: `/user/requests/${request.id}${returnQuery}`,
      label: "مشاهده جزئیات",
    };
  }

  if (status === "rejected" || status === "cancelled") {
    return null;
  }

  return {
    href: `/user/requests/${request.id}/continue${returnQuery}`,
    label: "ادامه درخواست",
  };
}

export default function RequestCard({ request, returnQuery = "" }) {
  const [copied, setCopied] = useState(false);

  const requestState = getRequestState(request.genericStatus);
  const statusStyle = getStatusStyles(requestState.tone);
  const action = getAction(request, returnQuery);

  const rejectionReason =
    request.rejectionReason ||
    request.cancelReason ||
    "درخواست شما به دلیل عدم تایید اطلاعات ثبت‌شده رد شده است.";

  const shouldShowReason = ["rejected", "cancelled"].includes(
    request.genericStatus
  );

  const handleCopyRequestId = async () => {
    try {
      await navigator.clipboard.writeText(String(request.id));
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  return (
    <div
      dir="rtl"
      className="
        mt-4
        relative overflow-hidden
        rounded-[28px]
        border border-zinc-200/80
        bg-white
        p-4
        shadow-[0_14px_40px_rgba(24,24,27,0.06)]
      "
    >
      {/* ambient background */}
      <div className="pointer-events-none absolute -left-8 -top-8 h-28 w-28 rounded-full bg-sky-100/70 blur-2xl" />
      <div className="pointer-events-none absolute -right-6 bottom-0 h-24 w-24 rounded-full bg-amber-100/40 blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex h-12 w-12 shrink-0 items-center justify-center
                rounded-2xl
                bg-zinc-50 text-zinc-700
                ring-1 ring-zinc-100
              "
            >
              <ReceiptText size={22} />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-zinc-900">
                درخواست خرید اقساطی
              </p>

              <p className="mt-1 text-xs leading-5 text-zinc-500">
                {requestState.subtitle}
              </p>
            </div>
          </div>

          <div
            className={`
              inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5
              whitespace-nowrap text-[11px] font-bold
              ${statusStyle.badge}
            `}
          >
            <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
            <span>{requestState.label}</span>
          </div>
        </div>

        {/* Request ID row */}
        <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50/80 px-3 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="shrink-0 text-[11px] font-medium text-zinc-500">
              شماره درخواست:
            </span>

            <div className="min-w-0 flex flex-1 items-center gap-2">
              <span
                className="block min-w-0 flex-1 truncate text-sm font-bold text-zinc-900"
                title={String(request.id)}
              >
                {request.id}
              </span>

              <button
                type="button"
                onClick={handleCopyRequestId}
                aria-label="کپی شماره درخواست"
                className={`
                  flex h-8 shrink-0 items-center justify-center gap-1 rounded-xl px-2 transition-colors
                  ${
                    copied
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-zinc-500 hover:bg-white hover:text-zinc-700"
                  }
                `}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied && (
                  <span className="text-[11px] font-bold">کپی شد</span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 space-y-2.5">
          <AmountTile value={request.installmentsTotal} />

          <div className="grid grid-cols-2 gap-2.5">
            <MetaTile
              icon={CalendarDays}
              label="تاریخ درخواست"
              value={request.date}
            />

            <MetaTile
              icon={PackageCheck}
              label="تعداد کالا"
              value={`${request.itemsCount} کالا`}
            />
          </div>
        </div>

        {/* Rejection / cancellation reason */}
        {shouldShowReason && (
          <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/80 p-3">
            <div className="flex items-start gap-2.5 text-red-600">
              <AlertTriangle size={17} className="mt-0.5 shrink-0" />

              <div className="min-w-0">
                <p className="text-xs font-bold">
                  {requestState.rejectionTitle || "این درخواست تایید نشد"}
                </p>

                <p className="mt-1 text-xs leading-6 text-red-600/90">
                  {rejectionReason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action */}
        {action && (
          <div className="mt-4 flex justify-end">
            <Link
              href={action.href}
              className="
                inline-flex items-center gap-1.5
                text-sm font-bold text-amber-600
                transition-colors hover:text-amber-700
              "
            >
              <span>{action.label}</span>
              <ChevronLeft size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function AmountTile({ value }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-100 bg-amber-50/80 px-4 py-3.5">
      <div className="pointer-events-none absolute -left-6 top-1/2 h-16 w-16 -translate-y-1/2 rounded-full bg-amber-200/30 blur-2xl" />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-amber-700">
            <WalletCards size={16} />
            <span className="text-[11px] font-medium">مبلغ کل اقساط</span>
          </div>

          <p className="mt-2 text-lg font-extrabold tracking-tight text-zinc-950 break-words">
            {value}
          </p>
        </div>

        <div className="shrink-0 rounded-2xl bg-white/70 px-2.5 py-1 text-[10px] font-medium text-amber-700 ring-1 ring-amber-100">
          اقساط
        </div>
      </div>
    </div>
  );
}

function MetaTile({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-100 bg-zinc-50/70 px-3 py-3">
      <div className="flex items-center gap-1.5 text-zinc-500">
        <Icon size={15} />
        <span className="text-[10px] leading-none">{label}</span>
      </div>

      <p className="mt-2 text-xs font-bold leading-5 text-zinc-900">
        {value}
      </p>
    </div>
  );
}
