"use client";

import { useState } from "react";
import { Banknote, CalendarDays, CreditCard, ReceiptText } from "lucide-react";
import { useInstallment } from "@/shared/hooks/useInstallment";

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
  trackingId,
  totalAmount = 0,
  downPayment = 0,
  minDownPayment = 0,
  maxDownPayment,
  defaultDownPayment,
  fees = defaultFees,
  installmentMonthOptions = defaultInstallmentMonthOptions,
  checkIntervalOptions = defaultCheckIntervalOptions,
  defaultInstallmentMonths = 12,
  defaultCheckInterval = 1,
  onChange,
  confirmLoading = false,
  confirmDisabled = false,
  showConfirmButton = true,
  evaluateRulesData,
}) {
  const { setPaymentPlan, removePaymentPlan } = useInstallment();

  // Derived numbers from API + props.
  const invoiceAmount = Number(
    evaluateRulesData?.invoice_amount ?? totalAmount,
  );
  const downPaymentMin = Number(
    evaluateRulesData?.min_down_payment_amount ?? minDownPayment,
  );
  const downPaymentMax = Number(
    evaluateRulesData?.max_down_payment_amount ??
      maxDownPayment ??
      Math.max(invoiceAmount, downPaymentMin),
  );
  const maxInstallmentMonths = Number(
    evaluateRulesData?.max_months ?? installmentMonthOptions.at(-1) ?? 24,
  );
  const normalizedInstallmentMonthOptions = installmentMonthOptions.filter(
    (month) => Number(month) <= maxInstallmentMonths,
  );
  const allowedCheckIntervals = Array.isArray(
    evaluateRulesData?.allowed_check_intervals,
  )
    ? evaluateRulesData.allowed_check_intervals.map((value) => Number(value))
    : null;
  const normalizedCheckIntervalOptions = allowedCheckIntervals?.length
    ? checkIntervalOptions.filter((option) => {
        const { value } = getIntervalOption(option);
        return allowedCheckIntervals.includes(Number(value));
      })
    : checkIntervalOptions;
  const initialDownPayment = Number(
    defaultDownPayment ?? downPayment ?? downPaymentMin,
  );

  // Local UI state.
  const [installmentMonths, setInstallmentMonths] = useState(
    defaultInstallmentMonths,
  );
  const [checkInterval, setCheckInterval] = useState(defaultCheckInterval);
  const [selectedDownPayment, setSelectedDownPayment] = useState(
    Math.min(Math.max(initialDownPayment, downPaymentMin), downPaymentMax),
  );
  const [paymentPlanData, setPaymentPlanData] = useState(null);
  const [isPlanLocked, setIsPlanLocked] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const activePlan = paymentPlanData || evaluateRulesData;
  const activePlanRoot =
    paymentPlanData?.active_plan ||
    paymentPlanData ||
    evaluateRulesData?.active_plan ||
    evaluateRulesData ||
    null;
  const isCalculated = isPlanLocked;

  // Summary math.
  const payableByChecks = Math.max(invoiceAmount - selectedDownPayment, 0);
  const checksCount = Math.max(Math.ceil(installmentMonths / checkInterval), 1);
  const checkAmount = Math.ceil(payableByChecks / checksCount);
  const feesTotal = fees.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0,
  );
  const totalInstallmentPayments = checkAmount * checksCount;
  const grandTotalPayments =
    selectedDownPayment + feesTotal + totalInstallmentPayments;

  const buildSummary = (
    months,
    interval,
    nextDownPayment = selectedDownPayment,
  ) => {
    const nextPayableByChecks = Math.max(invoiceAmount - nextDownPayment, 0);
    const nextChecksCount = Math.max(Math.ceil(months / interval), 1);
    const nextCheckAmount = Math.ceil(nextPayableByChecks / nextChecksCount);

    return {
      installmentMonths: months,
      checkInterval: interval,
      downPayment: nextDownPayment,
      checksCount: nextChecksCount,
      checkAmount: nextCheckAmount,
      totalInstallmentPayments: nextCheckAmount * nextChecksCount,
      grandTotalPayments:
        nextDownPayment + feesTotal + nextCheckAmount * nextChecksCount,
      payableByChecks: nextPayableByChecks,
      feesTotal,
      totalAmount: invoiceAmount,
    };
  };

  // Change handlers.
  const handleInstallmentMonthsChange = (value) => {
    if (isCalculated) return;
    setInstallmentMonths(value);
    onChange?.(buildSummary(value, checkInterval));
  };

  const handleCheckIntervalChange = (value) => {
    if (isCalculated) return;
    setCheckInterval(value);
    onChange?.(buildSummary(installmentMonths, value));
  };

  const handleDownPaymentChange = (value) => {
    if (isCalculated) return;
    setSelectedDownPayment(value);
    onChange?.(buildSummary(installmentMonths, checkInterval, value));
  };

  const handleCalculatePlan = () => {
    if (!trackingId) return;

    setPaymentPlan.mutate(
      {
        trackingId,
        down_payment_amount: selectedDownPayment,
        months: installmentMonths,
        check_interval_months: checkInterval,
      },
      {
        onSuccess: (res) => {
          setPaymentPlanData(res?.data?.data || res?.data || null);
          setIsPlanLocked(true);
        },
      },
    );
  };

  const handleChangePlan = () => {
    const planId = activePlanRoot?.plan_id;
    if (!trackingId || !planId) return;

    removePaymentPlan.mutate(
      { trackingId, planId },
      {
        onSuccess: () => {
          setIsPlanLocked(false);
          setPaymentPlanData(null);
        },
      },
    );
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
          value={formatPrice(invoiceAmount)}
        />
        <SummaryCard
          icon={Banknote}
          label="حداکثر مبلغ پرداخت اقساطی"
          value={formatPrice(activePlan?.remaining_installment_amount)}
        />
      </div>

      {evaluateRulesData?.decision === "approved_with_guarantor" && (
        <section className="rounded-2xl border border-slate-100 bg-white p-4">
          <h3 className="mb-3 text-sm font-bold text-slate-900">نیازمندی‌ها</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-slate-600">تعداد ضامن</span>
              <span className="text-sm font-bold text-slate-900">
                {Number(evaluateRulesData.guarantors_count || 0).toLocaleString(
                  "fa-IR",
                )}
              </span>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="mb-4 text-sm font-bold text-slate-900">
          انتخاب شرایط اقساط
        </h3>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <label className="text-xs font-bold text-slate-700">
                مبلغ پیش پرداخت
              </label>
              <span className="text-sm font-black text-blue-700">
                {formatPrice(selectedDownPayment)}
              </span>
            </div>

            <input
              type="range"
              min={downPaymentMin}
              max={downPaymentMax}
              step="100000"
              value={selectedDownPayment}
              onChange={(event) =>
                handleDownPaymentChange(Number(event.target.value))
              }
              disabled={isCalculated}
              className="w-full accent-blue-600 disabled:cursor-not-allowed"
            />

            <div className="mt-2 flex items-center justify-between text-[11px] font-medium text-slate-500">
              <span>{formatPrice(downPaymentMin)}</span>
              <span>{formatPrice(downPaymentMax)}</span>
            </div>
          </div>

          <CompactDropdown
            label="مدت اقساط"
            value={`${installmentMonths.toLocaleString("fa-IR")} ماه`}
            open={openDropdown === "months"}
            disabled={isCalculated}
            onToggle={() =>
              setOpenDropdown((current) =>
                current === "months" ? null : "months",
              )
            }
            onClose={() => setOpenDropdown(null)}
            options={normalizedInstallmentMonthOptions.map((month) => ({
              value: month,
              label: `${month.toLocaleString("fa-IR")} ماه`,
            }))}
            onSelect={(value) => handleInstallmentMonthsChange(Number(value))}
          />

          <CompactDropdown
            label="فاصله بین چک‌ها"
            value={getIntervalOption(checkInterval).label}
            open={openDropdown === "interval"}
            disabled={isCalculated}
            onToggle={() =>
              setOpenDropdown((current) =>
                current === "interval" ? null : "interval",
              )
            }
            onClose={() => setOpenDropdown(null)}
            options={normalizedCheckIntervalOptions.map((option) => {
              const { value, label } = getIntervalOption(option);
              return { value, label };
            })}
            onSelect={(value) => handleCheckIntervalChange(Number(value))}
          />
        </div>

        {showConfirmButton && !isCalculated && (
          <button
            type="button"
            onClick={handleCalculatePlan}
            disabled={confirmLoading || confirmDisabled || !trackingId}
            className="mt-8 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {confirmLoading ? "در حال محاسبه..." : "محاسبه"}
          </button>
        )}

        {showConfirmButton && isCalculated && (
          <button
            type="button"
            onClick={handleChangePlan}
            disabled={!trackingId}
            className="mt-8 w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-600 transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            تغییر پلن
          </button>
        )}
      </section>

      {isCalculated && (
        <CalculateResult
          payableByChecks={payableByChecks}
          checksCount={checksCount}
          checkAmount={checkAmount}
          totalInstallmentPayments={totalInstallmentPayments}
          paymentPlanData={paymentPlanData}
        />
      )}
    </div>
  );
}

function CalculateResult({
  payableByChecks,
  checksCount,
  checkAmount,
  totalInstallmentPayments,
  paymentPlanData,
}) {
  console.log(paymentPlanData);
  const planRoot = paymentPlanData?.active_plan || paymentPlanData || null;
  const installment = planRoot?.installment || {};
  const invoice = planRoot?.invoice || {};

  const hasPreviousPlan = Boolean(paymentPlanData?.active_plan);

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <div className="mb-3 flex items-center gap-2 text-blue-700">
        <CreditCard size={20} />
        <h3 className="text-sm font-bold">خلاصه جزئیات پرداخت و چک‌ها</h3>
      </div>

      {hasPreviousPlan && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-6 text-amber-800">
          قبلا یک پلن برای این درخواست ثبت شده است. اگر بخواهید می‌توانید پلن
          فعلی را تغییر دهید.
        </div>
      )}

      <div className="space-y-3">
        <div className="rounded-xl bg-white p-3">
          <p className="mb-3 text-xs font-bold text-slate-500">اطلاعات چک‌ها</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryLine
              label="مبلغ اقساط ماهیانه"
              value={formatPrice(installment?.monthly_installment_amount ?? 0)}
            />
            <SummaryLine
              label="تعداد چک"
              value={`${Number(
                installment?.checks_count ?? checksCount,
              ).toLocaleString("fa-IR")} فقره`}
            />
            <SummaryLine
              label="فاصله بین چک ها"
              value={`هر ${Number(
                installment?.check_interval_months ?? 1,
              ).toLocaleString("fa-IR")} ماه`}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <p className="mb-3 text-xs font-bold text-slate-500">هزینه‌های جانبی</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryLine
              label="هزینه انجام عملیات دیجیتال"
              value={`${Number(invoice.digital_service_fee ?? 0).toLocaleString(
                "fa-IR",
              )} تومان`}
            />
          </div>
        </div>

        <div className="rounded-xl bg-white p-3">
          <p className="mb-3 text-xs font-bold text-slate-500">پیش پرداخت</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <SummaryLine
              label="مبلغ پیش پرداخت"
              value={formatPrice(
                invoice?.down_payment_amount ?? totalInstallmentPayments,
              )}
            />
          </div>
        </div>

        {/* <div className="rounded-xl bg-blue-600 p-3">
          <p className="mb-3 text-xs font-bold text-blue-100">مجموع پرداخت نهایی</p>
          <SummaryLine
            label="جمع کل"
            value={formatPrice(
              installment?.total_installment_amount ?? totalInstallmentPayments,
            )}
          />
        </div> */}
      </div>

      <div className="mt-4 flex gap-2 rounded-xl bg-white/70 p-3 text-xs leading-6 text-slate-600">
        <CalendarDays className="mt-0.5 shrink-0 text-blue-600" size={18} />
        <p>
          با تغییر مدت اقساط یا فاصله بین چک‌ها، تعداد چک‌ها و مبلغ هر چک دوباره
          محاسبه می‌شود.
        </p>
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

function CompactDropdown({
  label,
  value,
  options,
  open,
  disabled,
  onToggle,
  onClose,
  onSelect,
}) {
  return (
    <div className="relative">
      <label className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </label>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <span>{value}</span>
        <span className="text-slate-400">▾</span>
      </button>

      {open && !disabled && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          <div className="max-h-56 overflow-y-auto pr-1">
            <div className="space-y-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onSelect(option.value);
                    onClose();
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-right text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
