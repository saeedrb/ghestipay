"use client";

import Link from "next/link";
import {
  BadgeCheck,
  ChevronLeft,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  FileSignature,
  ShieldCheck,
} from "lucide-react";

import STATUS from "@/shared/constant/Status";
import { useAuthStore } from "@/shared/stores/auth.store";

const requirementConfig = {
  identity: {
    title: "احراز هویت",
    description: "اطلاعات هویتی شما باید تایید شده باشد.",
    href: "/identify",
    icon: ShieldCheck,
  },
  creditScore: {
    title: "اعتبارسنجی",
    description: "برای ادامه خرید اقساطی باید نتیجه اعتبارسنجی شما مشخص شود.",
    href: "/user/credit-score",
    icon: BadgeCheck,
  },
  digitalSignature: {
    title: "امضای دیجیتال",
    description: "ثبت امضای دیجیتال برای تکمیل قرارداد و تعهدات الزامی است.",
    href: "/digital-signature",
    icon: FileSignature,
  },
};

const statusStyles = {
  success: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CircleCheckBig,
    action: "تکمیل شده",
  },
  pending: {
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
    action: "ادامه فرایند",
  },
  error: {
    badge: "border-red-200 bg-red-50 text-red-700",
    icon: CircleAlert,
    action: "انجام مرحله",
  },
};

function normalizeUser(userInfo) {
  return Array.isArray(userInfo) ? userInfo[0] : userInfo;
}

function getRequirements(user) {
  const { credit_score_status, digital_signature_status } = STATUS;

  const identityDone = user?.identify_data?.status === "verified";
  const creditStatus = user?.latest_credit_inquiry?.status;
  const signatureStatus = user?.latest_digital_signature_request?.status;

  return [
    {
      key: "identity",
      status: identityDone ? "success" : "error",
      text: identityDone ? "تایید شده" : "تایید نشده",
    },
    {
      key: "creditScore",
      status: !creditStatus ? "error" : creditStatus === "checked" ? "success" : "pending",
      text: !creditStatus
        ? "انجام نشده"
        : credit_score_status[creditStatus] || "در انتظار بررسی",
    },
    {
      key: "digitalSignature",
      status: !signatureStatus
        ? "error"
        : signatureStatus === "token_issued"
          ? "success"
          : "pending",
      text: !signatureStatus
        ? "ثبت نشده"
        : digital_signature_status[signatureStatus] || "در انتظار بررسی",
    },
  ];
}

export default function RequiredMents({ user: userProp }) {
  const storeUser = useAuthStore((s) => s.user);
  const user = normalizeUser(userProp || storeUser);
  const requirements = getRequirements(user);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          الزامات خرید اقساطی
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          برای ادامه درخواست، وضعیت هر مورد را بررسی کنید. اگر مرحله‌ای تکمیل
          نشده باشد، با انتخاب همان مورد می‌توانید وارد صفحه انجام آن شوید.
        </p>
      </div>

      <div className="space-y-3">
        {requirements.map((item) => (
          <RequirementItem key={item.key} item={item} />
        ))}
      </div>
    </div>
  );
}

function RequirementItem({ item }) {
  const config = requirementConfig[item.key];
  const style = statusStyles[item.status];
  const Icon = config.icon;
  const StatusIcon = style.icon;
  const isComplete = item.status === "success";

  const content = (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 transition hover:border-blue-100 hover:bg-blue-50/30">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Icon size={21} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-bold text-slate-900">{config.title}</h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${style.badge}`}
          >
            <StatusIcon size={13} />
            {item.text}
          </span>
        </div>

        <p className="mt-1 text-xs leading-6 text-slate-500">
          {config.description}
        </p>
      </div>

      {!isComplete && (
        <div className="flex shrink-0 items-center gap-1 text-xs font-bold text-blue-600">
          <span>{style.action}</span>
          <ChevronLeft size={16} />
        </div>
      )}
    </div>
  );

  if (isComplete) {
    return content;
  }

  return (
    <Link href={config.href} className="block">
      {content}
    </Link>
  );
}
