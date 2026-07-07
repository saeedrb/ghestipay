"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard, RefreshCw } from "lucide-react";
import { useInstallment } from "@/shared/hooks/useInstallment";

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fa-IR")} تومان`;
}

const InstallmentPayErorPage = ({ orderDetails, refetchRequest }) => {
  const { removePaymentPlan, getPaymentInformation } = useInstallment();
  const {
    mutate: fetchPaymentInformation,
    isPending: isPaymentInformationPending,
  } = getPaymentInformation;
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentResponse, setPaymentResponse] = useState(null);

  const trackingId =
    orderDetails?.tracking_code ||
    orderDetails?.tracking_id ||
    orderDetails?.trackingId;
  const planId = orderDetails?.plan_id;

  const paymentData = paymentResponse?.data || null;
  const hasPaymentLink =
    paymentResponse?.success === true && Boolean(paymentData?.payment_url);
  const isExpired =
    paymentResponse?.success === false && paymentData?.plan_status === "expired";

  useEffect(() => {
    if (!trackingId || !planId) return;

    fetchPaymentInformation(
      { trackingId, planId },
      {
        onSuccess: (res) => {
          setErrorMessage("");
          setPaymentResponse(res?.data || res || null);
        },
        onError: (error) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              "خطا در دریافت اطلاعات پرداخت",
          );
        },
      },
    );
  }, [fetchPaymentInformation, trackingId, planId]);

  const handleChangePlan = () => {
    if (!trackingId || !planId) return;

    setErrorMessage("");
    removePaymentPlan.mutate(
      { trackingId, planId },
      {
        onSuccess: () => {
          refetchRequest?.();
        },
        onError: (error) => {
          setErrorMessage(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              "خطا در تغییر پلن",
          );
        },
      },
    );
  };

  const handlePayment = () => {
    if (!paymentData?.payment_url) return;

    window.location.href = paymentData.payment_url;
  };

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <AlertTriangle size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-slate-900">
            پرداخت پلن قبلی تکمیل نشده است
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {hasPaymentLink
              ? "اگر دوست دارید می‌توانید پلن خود را تغییر دهید، یا مطابق پلنی که قبلا انتخاب کرده‌اید مبلغ زیر را پرداخت کنید."
              : isExpired
                ? "به علت گذشتن موعد پرداخت مجددا فرایند انتخاب پلن را انجام دهید."
                : "در حال دریافت اطلاعات پرداخت پلن قبلی هستیم."}
          </p>

          {hasPaymentLink && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-3">
              <p className="text-xs font-medium text-slate-500">
                مبلغ قابل پرداخت
              </p>
              <p className="mt-1 text-lg font-black text-slate-900">
                {formatPrice(paymentData.amount)}
              </p>
            </div>
          )}

          {isPaymentInformationPending && !paymentResponse && (
            <p className="mt-4 text-sm font-medium text-amber-700">
              در حال دریافت اطلاعات پرداخت...
            </p>
          )}

          {hasPaymentLink && (
            <button
              type="button"
              onClick={handlePayment}
              className="mt-5 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
            >
              <CreditCard size={18} />
              پرداخت
            </button>
          )}

          <button
            type="button"
            onClick={handleChangePlan}
            disabled={
              !trackingId ||
              !planId ||
              removePaymentPlan.isPending ||
              isPaymentInformationPending
            }
            className={`${hasPaymentLink ? "mt-3 border border-blue-200 bg-blue-50 text-blue-600" : "mt-5 bg-blue-600 text-white"} inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <RefreshCw size={18} />
            تغییر پلن
          </button>

          {errorMessage && (
            <p className="mt-3 text-sm font-medium text-red-600">
              {errorMessage}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default InstallmentPayErorPage;
