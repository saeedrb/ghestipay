"use client";

import { useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

import Loading from "@/shared/components/ui/Loading";
import { useGetOrderProgressDetails } from "@/shared/hooks/useInstallment";

import Error from "@/app/user/components/ui/Installment/Error";
import InstallmentCreditScoreIntro from "@/app/user/components/ui/Installment/InstallmentCreditScoreIntro";
import InstallmentVerifyCreditScoreOtpCode from "@/app/user/components/ui/Installment/InstallmentVerifyCreditScoreOtpCode";
import InstallmentCreditScoreResult from "@/app/user/components/ui/Installment/InstallmentCreditScoreResult";
import InstallmentPlanSelection from "@/app/user/components/ui/Installment/InstallmentPlanSelection";
import InstallmentPayErorPage from "@/app/user/components/ui/Installment/InstallmentPayErorPage";
import InstallmentGuarantorSet from "@/app/user/components/ui/Installment/InstallmentGuarantorSet";

export default function ContinueRequestPage() {
  const [step, setStep] = useState(1);
  const params = useParams();
  const searchParams = useSearchParams();

  const trackingId =
    searchParams.get("tracking_id") ||
    searchParams.get("trackingId") ||
    params.id;

  const {
    data: orderDetailsResponse,
    isLoading,
    isError,
    refetch,
  } = useGetOrderProgressDetails(trackingId);

  const orderDetails =
    orderDetailsResponse?.data?.data || orderDetailsResponse?.data || null;

  const trackingCode =
    orderDetails?.tracking_id ||
    orderDetails?.trackingId ||
    orderDetails?.tracking_code ||
    trackingId;

  if (isLoading) {
    return <Loading message="در حال دریافت جزئیات درخواست..." />;
  }

  if (isError) {
    return <Error onRetry={refetch} />;
  }

  const requestStatus = orderDetails?.request_status;

  const renderContent = () => {
    switch (requestStatus) {
      case "waiting_credit_score":
        return (
          <InstallmentCreditScoreIntro
            orderDetails={orderDetails}
            refetchRequest={refetch}
          />
        );

      case "credit_score_otp_sent":
        return (
          <InstallmentVerifyCreditScoreOtpCode
            orderDetails={orderDetails}
            refetchRequest={refetch}
          />
        );

      case "credit_score_result_pending":
      case "waiting_rules":
        return (
          <InstallmentCreditScoreResult
            orderDetails={orderDetails}
            refetchRequest={refetch}
          />
        );

      case "waiting_plan_selection":
        return (
          <InstallmentPlanSelection
            orderDetails={orderDetails}
            refetchRequest={refetch}
          />
        );

      case "waiting_payment":
        if (orderDetails.plan_id == null) {
          return (
            <InstallmentPlanSelection
              orderDetails={orderDetails}
              refetchRequest={refetch}
            />
          );
        }
        return (
          <InstallmentPayErorPage
            orderDetails={orderDetails}
            refetchRequest={refetch}
          />
        );

      case "waiting_guarantor":
        return (
          <InstallmentGuarantorSet
            orderDetails={orderDetails}
            refetchRequest={refetch}
          />
        );

      default:
        return (
          <StepPlaceholder
            title="وضعیت درخواست"
            description="برای این وضعیت هنوز کامپوننت مشخص نشده است."
            status={requestStatus || "unknown"}
          />
        );
    }
  };

  return (
    <div className="flex w-full flex-col px-4 pb-8 pt-6">{renderContent()}</div>
  );
}

function StepPlaceholder({ title, description, status }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <h1 className="text-base font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <p dir="ltr" className="mt-4 text-xs font-medium text-slate-400">
        request_status: {status}
      </p>
    </div>
  );
}
