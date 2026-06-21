"use client";

import Link from "next/link";
import { Banknote, CreditCard, ReceiptText, WalletCards } from "lucide-react";

const defaultExtraCosts = [
  { title: "هزینه تشکیل پرونده", amount: 0 },
  { title: "هزینه خدمات", amount: 0 },
];

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fa-IR")} تومان`;
}

export default function DownPayment({
  downPayment = 0,
  extraCosts = defaultExtraCosts,
  paymentUrl = "",
  paymentLabel = "پرداخت",
  disabled = false,
}) {
  const extraCostsTotal = extraCosts.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const payableAmount = Number(downPayment || 0) + extraCostsTotal;
  const canPay = Boolean(paymentUrl) && !disabled && payableAmount > 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          پرداخت پیش‌پرداخت
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          مبلغ پیش‌پرداخت و هزینه‌های جانبی درخواست را بررسی کنید و از طریق
          لینک پرداخت، مبلغ قابل پرداخت را تسویه کنید.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <AmountCard
          icon={Banknote}
          label="مبلغ پیش‌پرداخت"
          value={formatPrice(downPayment)}
        />
        <AmountCard
          icon={ReceiptText}
          label="جمع هزینه‌های جانبی"
          value={formatPrice(extraCostsTotal)}
        />
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          جزئیات هزینه‌های جانبی
        </h3>

        <div className="space-y-3">
          {extraCosts.map((cost) => (
            <div key={cost.title} className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-600">{cost.title}</span>
              <span className="text-sm font-bold text-slate-900">
                {formatPrice(cost.amount)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white">
            <WalletCards size={22} />
          </div>

          <div>
            <p className="text-xs text-blue-700">مبلغ قابل پرداخت</p>
            <p className="mt-1 text-lg font-bold text-blue-950">
              {formatPrice(payableAmount)}
            </p>
          </div>
        </div>

        {canPay ? (
          <Link
            href={paymentUrl}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            <CreditCard size={18} />
            {paymentLabel}
          </Link>
        ) : (
          <button
            type="button"
            disabled
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-3 text-sm font-bold text-slate-500"
          >
            <CreditCard size={18} />
            لینک پرداخت در دسترس نیست
          </button>
        )}
      </div>
    </div>
  );
}

function AmountCard({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
