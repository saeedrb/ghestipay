'use client';

import { ShieldCheck, CreditCard, Info } from "lucide-react";
import Button from "@/shared/components/ui/Button";
import Card from "@/shared/components/ui/Card";

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;

  return `${numericValue.toLocaleString("fa-IR")} ریال`;
}

export default function CreditScoreIntro({
  amount = "۵۰٬۰۰۰ تومان",
  onContinue,
  loading = false,
  finalAmount,
  discountAmount,
  paymentUrl,
}) {
  const handlePaymentClick = () => {
    if (paymentUrl) {
      window.location.href = paymentUrl;
      return;
    }

    onContinue?.();
  };

  const hasDiscount = Boolean(Number(discountAmount));
  const displayAmount = formatAmount(amount);
  const displayDiscountAmount = formatAmount(discountAmount);
  const displayFinalAmount = formatAmount(finalAmount || amount);

  return (
    <Card className="mt-6 space-y-5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <ShieldCheck size={26} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-gray-900">اعتبارسنجی</h2>
          <p className="mt-1 text-sm leading-6 text-gray-500">
            با انجام اعتبارسنجی، وضعیت اعتباری شما بررسی می‌شود و نتیجه آن برای
            ادامه فرایند دریافت اعتبار نمایش داده می‌شود.
          </p>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl bg-gray-50 p-4 text-sm text-gray-700">
        {hasDiscount ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-medium">
                <CreditCard size={18} className="text-blue-600" />
                مبلغ اعتبارسنجی
              </span>
              <span className="font-bold text-gray-400 line-through">
                {displayAmount}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-gray-500">تخفیف</span>
              <span className="font-bold text-emerald-600">
                {displayDiscountAmount}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-200 pt-3">
              <span className="font-bold text-gray-900">مبلغ قابل پرداخت</span>
              <span className="font-black text-gray-900">
                {displayFinalAmount}
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 font-medium">
              <CreditCard size={18} className="text-blue-600" />
              مبلغ قابل پرداخت
            </span>
            <span className="font-bold text-gray-900">
              {displayFinalAmount}
            </span>
          </div>
        )}

        <div className="flex items-start gap-2 text-xs leading-6 text-gray-500">
          <Info size={16} className="mt-1 shrink-0 text-amber-500" />
          <span>
            در صورت تمایل به انجام اعتبارسنجی، دکمه ادامه را انتخاب کنید تا وارد
            مرحله بعد شوید.
          </span>
        </div>
      </div>

      <Button disabled={loading || !paymentUrl} onClick={handlePaymentClick}>
        {loading ? "در حال پردازش..." : "پرداخت "}
      </Button>
    </Card>
  );
}
