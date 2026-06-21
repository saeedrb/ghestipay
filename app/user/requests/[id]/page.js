"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, ChevronRight, CreditCard, FileText, Hash, ReceiptText } from "lucide-react";

const requestDetails = {
  requestDate: "۲۸ خرداد ۱۴۰۵",
  installmentsTotal: "۲۴٬۵۰۰٬۰۰۰ تومان",
  firstInstallmentDate: "۲۸ تیر ۱۴۰۵",
  lastInstallmentDate: "۲۸ آذر ۱۴۰۵",
  installments: [
    {
      id: 1,
      checkDate: "۲۸ تیر ۱۴۰۵",
      sayadNumber: "۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶",
      amount: "۴٬۰۸۳٬۰۰۰ تومان",
    },
    {
      id: 2,
      checkDate: "۲۸ مرداد ۱۴۰۵",
      sayadNumber: "۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷",
      amount: "۴٬۰۸۳٬۰۰۰ تومان",
    },
    {
      id: 3,
      checkDate: "۲۸ شهریور ۱۴۰۵",
      sayadNumber: "۳۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸",
      amount: "۴٬۰۸۳٬۰۰۰ تومان",
    },
    {
      id: 4,
      checkDate: "۲۸ مهر ۱۴۰۵",
      sayadNumber: "۴۵۶۷۸۹۰۱۲۳۴۵۶۷۸۹",
      amount: "۴٬۰۸۳٬۰۰۰ تومان",
    },
    {
      id: 5,
      checkDate: "۲۸ آبان ۱۴۰۵",
      sayadNumber: "۵۶۷۸۹۰۱۲۳۴۵۶۷۸۹۰",
      amount: "۴٬۰۸۳٬۰۰۰ تومان",
    },
    {
      id: 6,
      checkDate: "۲۸ آذر ۱۴۰۵",
      sayadNumber: "۶۷۸۹۰۱۲۳۴۵۶۷۸۹۰۱",
      amount: "۴٬۰۸۵٬۰۰۰ تومان",
    },
  ],
};

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
      <span className="flex items-center gap-2 text-sm text-gray-500">
        <Icon size={18} />
        {label}
      </span>
      <span className="text-sm font-bold text-gray-900">{value}</span>
    </div>
  );
}

function InstallmentCard({ installment, index }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <svg
        className="pointer-events-none absolute left-0 top-0 h-full w-28 text-gray-50"
        fill="none"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        <circle cx="96" cy="24" r="42" stroke="currentColor" strokeWidth="14" />
        <path d="M18 92H92" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
        <path d="M18 64H72" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
      </svg>

      <div className="relative space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-black text-gray-900">قسط {index.toLocaleString("fa-IR")}</h3>
          </div>
        </div>

        <div className="grid gap-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-gray-500">
              <CalendarDays size={17} />
              تاریخ چک
            </span>
            <span className="font-bold text-gray-900">{installment.checkDate}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-gray-500">
              <Hash size={17} />
              شماره صیادی
            </span>
            <span className="text-left text-sm font-bold text-gray-900">{installment.sayadNumber}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-gray-500">
              <CreditCard size={17} />
              مبلغ چک
            </span>
            <span className="font-bold text-gray-900">{installment.amount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RequestDetailsPage() {
  const searchParams = useSearchParams();
  const backParams = new URLSearchParams();
  const page = searchParams.get("page");
  const status = searchParams.get("status");

  if (page) backParams.set("page", page);
  if (status) backParams.set("status", status);

  const backHref = backParams.toString() ? `/user/requests?${backParams.toString()}` : "/user/requests";

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="space-y-2">
        <Link href={backHref} className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 transition hover:text-blue-700">
          <ChevronRight size={16} />
          بازگشت به درخواست‌ها
        </Link>
        <h1 className="text-lg font-black text-gray-900">جزئیات درخواست</h1>
        <p className="text-sm leading-6 text-gray-500">اطلاعات کلی درخواست و وضعیت اقساط ثبت‌شده را اینجا می‌بینید.</p>
      </div>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <ReceiptText size={20} className="text-gray-700" />
          <h2 className="text-base font-black text-gray-900">اطلاعات عمومی</h2>
        </div>

        <div className="grid gap-3">
          <InfoItem icon={CalendarDays} label="تاریخ درخواست" value={requestDetails.requestDate} />
          <InfoItem icon={CreditCard} label="مبلغ کل اقساط" value={requestDetails.installmentsTotal} />
          <InfoItem icon={CalendarDays} label="تاریخ اولین قسط" value={requestDetails.firstInstallmentDate} />
          <InfoItem icon={CalendarDays} label="تاریخ آخرین قسط" value={requestDetails.lastInstallmentDate} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-black text-gray-900">اقساط</h2>

        <div className="flex flex-col gap-3">
          {requestDetails.installments.map((installment, index) => (
            <InstallmentCard key={installment.id} installment={installment} index={index + 1} />
          ))}
        </div>
      </section>
    </div>
  );
}
