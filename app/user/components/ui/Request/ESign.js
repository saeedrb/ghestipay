"use client";

import { FileSignature, ScrollText, Store } from "lucide-react";

const defaultContractText = `این قرارداد میان خریدار و فروشگاه برای خرید اقساطی منعقد می‌شود.

خریدار متعهد می‌شود اطلاعات هویتی و مالی خود را به صورت صحیح ارائه کند و اقساط تعیین‌شده را مطابق برنامه پرداخت، در موعد مقرر تسویه نماید.

فروشگاه متعهد می‌شود پس از تکمیل مراحل لازم، کالا یا خدمت موضوع قرارداد را مطابق شرایط اعلام‌شده در اختیار خریدار قرار دهد.

چک‌های صیادی، ضمانت‌ها، پیش‌پرداخت، هزینه‌های جانبی و سایر تعهدات مالی بر اساس اطلاعات ثبت‌شده در مراحل قبل این فرایند معتبر خواهد بود.

ثبت امضای دیجیتال به منزله مطالعه، پذیرش و تایید مفاد قرارداد توسط خریدار است.`;

export default function ESign({
  shopName = "فروشگاه",
  buyerName = "خریدار",
  contractTitle = "قرارداد خرید اقساطی",
  contractText = defaultContractText,
  onSign,
  signing = false,
  disabled = false,
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          امضای قرارداد
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          متن قرارداد میان شما و فروشگاهی که خرید اقساطی از آن انجام می‌شود را
          مطالعه کنید و در صورت تایید، قرارداد را امضا کنید.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard icon={Store} label="فروشگاه" value={shopName} />
        <InfoCard icon={FileSignature} label="خریدار" value={buyerName} />
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <ScrollText size={20} className="text-blue-600" />
          <h3 className="text-sm font-bold">{contractTitle}</h3>
        </div>

        <div className="max-h-80 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-4">
          <p className="whitespace-pre-line text-sm leading-8 text-slate-700">
            {contractText}
          </p>
        </div>
      </section>

      <button
        type="button"
        onClick={onSign}
        disabled={signing || disabled}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FileSignature size={18} />
        {signing ? "در حال امضا..." : "امضای قرارداد"}
      </button>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 truncate text-sm font-bold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}
