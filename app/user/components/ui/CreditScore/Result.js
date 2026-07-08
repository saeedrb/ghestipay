"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileText,
  ShieldCheck,
} from "lucide-react";
import Card from "@/shared/components/ui/Card";

function formatJalaliDate(value) {
  if (!value) return "امروز";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

const gradeConfig = {
  A: {
    label: "عالی",
    description:
      "وضعیت اعتباری شما بسیار مناسب است و امکان دریافت پیشنهادهای بهتر وجود دارد.",
    className: "bg-emerald-50 text-emerald-600",
  },
  B: {
    label: "خوب",
    description:
      "وضعیت اعتباری شما مناسب است و می‌توانید برای دریافت اعتبار اقدام کنید.",
    className: "bg-blue-50 text-blue-600",
  },
  C: {
    label: "متوسط",
    description: "وضعیت اعتباری شما نیاز به بررسی بیشتر دارد.",
    className: "bg-amber-50 text-amber-600",
  },
  D: {
    label: "نیازمند بهبود",
    description:
      "برای دریافت اعتبار بهتر است وضعیت مالی و سوابق بازپرداخت خود را بهبود دهید.",
    className: "bg-red-50 text-red-600",
  },
  E: {
    label: "ضعیف",
    description:
      "برای دریافت اعتبار بهتر است وضعیت مالی و سوابق بازپرداخت خود را بهبود دهید.",
    className: "bg-red-50 text-red-600",
  },
};

export default function CreditScoreResult({
  status = "pending",
  score = "A",
  reportDate = "امروز",
  riskTitle,
  checksSummaryValue,
  loanSummary,
  loanGuarantedSummary,
}) {
  const [isLoanSummaryOpen, setIsLoanSummaryOpen] = useState(false);
  const [isLoanGuaranteedSummaryOpen, setIsLoanGuaranteedSummaryOpen] =
    useState(false);
  const isReady = status === "ready";
  const grade = gradeConfig[score] || gradeConfig.A;
  const formattedReportDate = formatJalaliDate(reportDate);
  const overdueLoans = Array.isArray(loanSummary)
    ? loanSummary.filter((loan) => Number(loan?.overdue_amount || 0) > 0)
    : [];

  if (!isReady) {
    return (
      <Card className="mt-6 space-y-4 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Clock size={30} />
        </div>

        <div>
          <h2 className="text-base font-bold text-gray-900">
            در انتظار نتیجه اعتبارسنجی
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            کد اعتبارسنجی ثبت شد و نتیجه پس از بررسی در همین بخش نمایش داده
            می‌شود.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900">
            نتیجه اعتبارسنجی آماده است
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            گزارش اعتبارسنجی شما با موفقیت دریافت شد و خلاصه نتیجه در ادامه
            نمایش داده می‌شود.
          </p>
        </div>
      </div>

      <div className={`rounded-3xl p-5 text-center ${grade.className}`}>
        <p className="text-xs font-medium opacity-80">رتبه اعتباری</p>
        <p className="mt-2 text-5xl font-black leading-none">{score}</p>
        <p className="mt-2 text-sm font-bold">{riskTitle || grade.label}</p>
      </div>

      <div className="grid gap-3">
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-3">
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <FileText size={18} className="text-gray-500" />
            تاریخ گزارش
          </span>
          <span className="text-sm font-bold text-gray-900">
            {formattedReportDate}
          </span>
        </div>

        {checksSummaryValue && (
          <div className="flex items-center justify-between rounded-2xl border border-gray-100 p-3">
            <span className="flex items-center gap-2 text-sm text-gray-500">
              <ShieldCheck size={18} className="text-blue-600" />
              وضعیت چک
            </span>
            <span className="text-sm font-bold text-gray-900">
              {checksSummaryValue}
            </span>
          </div>
        )}

        {overdueLoans.length > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50">
            <button
              type="button"
              onClick={() => setIsLoanSummaryOpen((current) => !current)}
              className="flex w-full items-center justify-between gap-3 p-3 text-right"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-red-700">
                <AlertTriangle size={18} />
                اقساط عقب‌افتاده
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-red-600 transition ${
                  isLoanSummaryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLoanSummaryOpen && (
              <div className="space-y-2 border-t border-red-100 p-3">
                {overdueLoans.map((loan, index) => (
                  <div
                    key={`${loan.bank || "bank"}-${index}`}
                    className="rounded-xl bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-gray-900">
                        {loan.bank || "بانک نامشخص"}
                      </span>
                      <span className="text-xs font-bold text-red-600">
                        {Number(loan.overdue_amount).toLocaleString("fa-IR")}{" "}
                        قسط
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-6 text-gray-500">
                      مبلغ اقساط عقب‌افتاده:{" "}
                      <span className="font-bold text-gray-800">
                        {Number(loan.overdue_amount).toLocaleString("fa-IR")}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {loanGuarantedSummary?.length > 0 && (
          <div className="rounded-2xl border border-red-100 bg-red-50/50">
            <button
              type="button"
              onClick={() =>
                setIsLoanGuaranteedSummaryOpen((current) => !current)
              }
              className="flex w-full items-center justify-between gap-3 p-3 text-right"
            >
              <span className="flex items-center gap-2 text-sm font-bold text-red-700">
                <AlertTriangle size={18} />
                اقساط عقب‌افتاده که ضامن هستید
              </span>
              <ChevronDown
                size={18}
                className={`shrink-0 text-red-600 transition ${
                  isLoanGuaranteedSummaryOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLoanGuaranteedSummaryOpen && (
              <div className="space-y-2 border-t border-red-100 p-3">
                {loanGuarantedSummary.map((loan, index) => {
                  if (loan.overdue_amount == null || loan.overdue_amount == 0) {
                    return;
                  }

                  return (
                    <div
                      key={`${loan.bank || "bank"}-${index}`}
                      className="rounded-xl bg-white p-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold text-gray-900">
                          {loan.bank || "بانک نامشخص"}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-6 text-gray-500">
                        مبلغ اقساط عقب افتاده:{" "}
                        <span className="font-bold text-gray-800">
                          {Number(loan.overdue_amount).toLocaleString("fa-IR")}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
