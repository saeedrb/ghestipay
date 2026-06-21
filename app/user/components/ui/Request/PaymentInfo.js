"use client";

import { useState } from "react";
import { Banknote, CalendarDays, CreditCard, ReceiptText } from "lucide-react";

const defaultFees = [
  { title: "هزینه اعتبارسنجی", amount: 0 },
  { title: "هزینه ثبت امضای دیجیتال", amount: 0 },
  { title: "هزینه خدمات پرونده", amount: 0 },
];

const defaultInstallmentMonthOptions = Array.from(
  { length: 24 },
  (_, index) => index + 1,
);
const defaultCheckIntervalOptions = Array.from(
  { length: 12 },
  (_, index) => index + 1,
);

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fa-IR")} تومان`;
}

function getIntervalOption(option) {
  const value = typeof option === "number" ? option : option.value;
  const label =
    typeof option === "number"
      ? option === 1
        ? "ماهانه"
        : `هر ${option.toLocaleString("fa-IR")} ماه`
      : option.label;

  return { value, label };
}

export default function PaymentInfo({
  totalAmount = 0,
  downPayment = 0,
  fees = defaultFees,
  installmentMonthOptions = defaultInstallmentMonthOptions,
  checkIntervalOptions = defaultCheckIntervalOptions,
  defaultInstallmentMonths = 12,
  defaultCheckInterval = 1,
  onChange,
  onConfirm,
  confirmLoading = false,
  confirmDisabled = false,
  showConfirmButton = true,
}) {
  const [installmentMonths, setInstallmentMonths] = useState(
    defaultInstallmentMonths,
  );
  const [checkInterval, setCheckInterval] = useState(defaultCheckInterval);

  const payableByChecks = Math.max(
    Number(totalAmount) - Number(downPayment),
    0,
  );
  const checksCount = Math.max(Math.ceil(installmentMonths / checkInterval), 1);
  const checkAmount = Math.ceil(payableByChecks / checksCount);
  const feesTotal = fees.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const totalInstallmentPayments = checkAmount * checksCount;
  const grandTotalPayments =
    Number(downPayment || 0) + feesTotal + totalInstallmentPayments;

  const buildSummary = (months, interval) => {
    const nextChecksCount = Math.max(Math.ceil(months / interval), 1);
    const nextCheckAmount = Math.ceil(payableByChecks / nextChecksCount);

    return {
      installmentMonths: months,
      checkInterval: interval,
      checksCount: nextChecksCount,
      checkAmount: nextCheckAmount,
      totalInstallmentPayments: nextCheckAmount * nextChecksCount,
      grandTotalPayments:
        Number(downPayment || 0) +
        feesTotal +
        nextCheckAmount * nextChecksCount,
      payableByChecks,
      downPayment,
      feesTotal,
      totalAmount,
    };
  };

  const handleInstallmentMonthsChange = (value) => {
    setInstallmentMonths(value);
    onChange?.(buildSummary(value, checkInterval));
  };

  const handleCheckIntervalChange = (value) => {
    setCheckInterval(value);
    onChange?.(buildSummary(installmentMonths, value));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          اطلاعات پرداخت و اقساط
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          در این مرحله هزینه‌های قابل پرداخت، پیش‌پرداخت و شرایط چک‌های اقساطی
          را بررسی و انتخاب می‌کنید.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryCard
          icon={ReceiptText}
          label="مبلغ کل خرید"
          value={formatPrice(totalAmount)}
        />
        <SummaryCard
          icon={Banknote}
          label="پیش‌پرداخت"
          value={formatPrice(downPayment)}
        />
        <SummaryCard
          icon={CreditCard}
          label="مجموع کل پرداختی‌ها"
          value={formatPrice(grandTotalPayments)}
        />
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-900">
          هزینه‌های فرایند
        </h3>

        <div className="space-y-3">
          {fees.map((fee) => (
            <div
              key={fee.title}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-sm text-slate-600">{fee.title}</span>
              <span className="text-sm font-bold text-slate-900">
                {formatPrice(fee.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-sm font-bold text-slate-900">جمع هزینه‌ها</span>
          <span className="text-sm font-bold text-blue-600">
            {formatPrice(feesTotal)}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="mb-4 text-sm font-bold text-slate-900">
          انتخاب شرایط اقساط
        </h3>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              مدت اقساط
            </label>
            <select
              value={installmentMonths}
              onChange={(event) =>
                handleInstallmentMonthsChange(Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              {installmentMonthOptions.map((month) => (
                <option key={month} value={month}>
                  {month.toLocaleString("fa-IR")} ماه
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold text-slate-700">
              فاصله بین چک‌ها
            </label>
            <select
              value={checkInterval}
              onChange={(event) =>
                handleCheckIntervalChange(Number(event.target.value))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            >
              {checkIntervalOptions.map((option) => {
                const { value, label } = getIntervalOption(option);

                return (
                  <option key={value} value={value}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {showConfirmButton && (
          <button
            type="button"
            onClick={() =>
              onConfirm?.(buildSummary(installmentMonths, checkInterval))
            }
            disabled={confirmLoading || confirmDisabled}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 mt-8"
          >
            {confirmLoading ? "در حال ثبت..." : "تایید نهایی"}
          </button>
        )}
      </section>

      <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="mb-3 flex items-center gap-2 text-blue-700">
          <CreditCard size={20} />
          <h3 className="text-sm font-bold">خلاصه چک‌های اقساطی</h3>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <SummaryLine
            label="مبلغ قابل تقسیط"
            value={formatPrice(payableByChecks)}
          />
          <SummaryLine
            label="تعداد چک"
            value={`${checksCount.toLocaleString("fa-IR")} فقره`}
          />
          <SummaryLine
            label="مبلغ هر چک"
            value={formatPrice(checkAmount)}
            highlight
          />
          <SummaryLine
            label="جمع پرداخت اقساطی"
            value={formatPrice(totalInstallmentPayments)}
          />
        </div>

        <div className="mt-4 flex gap-2 rounded-xl bg-white/70 p-3 text-xs leading-6 text-slate-600">
          <CalendarDays className="mt-0.5 shrink-0 text-blue-600" size={18} />
          <p>
            با تغییر مدت اقساط یا فاصله بین چک‌ها، تعداد چک‌ها و مبلغ هر چک
            دوباره محاسبه می‌شود.
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }) {
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

function SummaryLine({ label, value, highlight = false }) {
  return (
    <div className="rounded-xl bg-white p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p
        className={`mt-1 text-sm font-bold ${highlight ? "text-blue-700" : "text-slate-900"}`}
      >
        {value}
      </p>
    </div>
  );
}
