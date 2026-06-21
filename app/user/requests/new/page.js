"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import Background from "@/shared/components/ui/Background";
import Card from "@/shared/components/ui/Card";
import Loading from "@/shared/components/ui/Loading";
import { useInstallment } from "@/shared/hooks/useInstallment";

const LOGIN_PATH = "/otp";

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "خطا در ثبت سفارش. لطفا دوباره تلاش کنید."
  );
}

function NewRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { storeOrder } = useInstallment();
  const storeOrderAsync = storeOrder.mutateAsync;
  const hasSubmittedRef = useRef(false);

  const phone = searchParams.get("phone")?.trim();
  const invoiceId =
    searchParams.get("invoice_id")?.trim() ||
    searchParams.get("order_number")?.trim();
  const validationError = !phone || !invoiceId
    ? "شماره تلفن و شماره سفارش برای ثبت درخواست الزامی است."
    : !/^09\d{9}$/.test(phone)
      ? "شماره تلفن ارسال شده معتبر نیست."
      : "";

  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (validationError) return;
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const submitOrder = async () => {
      try {
        await storeOrderAsync({
          phone,
          invoice_id: invoiceId,
        });

        setIsLoading(false);
        router.replace(LOGIN_PATH);
      } catch (err) {
        setApiError(getApiErrorMessage(err));
        setIsLoading(false);
      }
    };

    submitOrder();
  }, [invoiceId, phone, router, storeOrderAsync, validationError]);

  const error = validationError || apiError;

  if (isLoading && !error) {
    return <Loading fullscreen message="در حال ثبت درخواست..." />;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      <Background />

      <Card className="relative z-10 w-full max-w-md mx-4 p-6 text-center">
        <h1 className="text-lg font-bold text-slate-900">
          {error ? "خطا در ثبت درخواست" : "پاسخ API"}
        </h1>

        {error && (
          <>
            <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {error}
            </p>

            <Link
              href={LOGIN_PATH}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white transition active:scale-[0.98]"
            >
              رفتن به صفحه ورود
            </Link>
          </>
        )}

      </Card>
    </div>
  );
}

export default function NewRequestPage() {
  return (
    <Suspense fallback={<Loading fullscreen message="در حال ثبت درخواست..." />}>
      <NewRequestContent />
    </Suspense>
  );
}
