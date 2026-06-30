"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import CheckRegistration from "@/app/user/components/ui/Request/CheckRegistration";
import DownPayment from "@/app/user/components/ui/Request/DownPayment";
import ESign from "@/app/user/components/ui/Request/ESign";
import Guarantor from "@/app/user/components/ui/Request/Guarantor";
import PaymentInfo from "@/app/user/components/ui/Request/PaymentInfo";
import RequestIntro from "@/app/user/components/ui/Request/RequestIntro";
import RequiredMents from "@/app/user/components/ui/Request/RequiredMents";
import WaitingPage from "@/app/user/components/ui/Request/WaitingPage";
import Loading from "@/shared/components/ui/Loading";
import {
  useGetEvaluateRules,
  useGetOrderProgressDetails,
} from "@/shared/hooks/useInstallment";
import { useInstallmentStore } from "@/shared/stores/installment.store";
import CreditScoreIntro from "@/app/user/components/ui/CreditScore/Intro";
import { useCredit } from "@/shared/hooks/useCredit";
import CreditCode from "@/app/user/components/ui/CreditScore/CreditCode";
import CreditScoreResult from "@/app/user/components/ui/CreditScore/Result";

// Keep the step query param inside the valid wizard range.
// function normalizeStep(step) {
//   const numericStep = Number(step || 1);
//   return Math.min(Math.max(numericStep || 1, 1), REQUEST_STEPS.length);
// }

export default function ContinueRequestPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.id;
  const [step, setStep] = useState(1);
  const [creditScoreStartData, setCreditScoreStartData] = useState(null);
  const [creditScoreResultData, setCreditScoreResultData] = useState(null);
  const startedCreditScoreTrackingRef = useRef(null);
  const fetchedCreditScoreResultRef = useRef(null);
  const {
    startCreditScoreResultGeneration: {
      mutate: startCreditScoreResultGeneration,
      isPending: isStartingCreditScoreResultGeneration,
    },
    verifyCreditCode: {
      mutate: verifyCreditCode,
      isPending: isVerifyingCreditCode,
    },
    creditScoreResult: {
      mutate: creditScoreResult,
      isPending: isCreditScoreResultPending,
    },
  } = useCredit();

  // Store a copy of request details so child steps and other pages can reuse it.
  const storedOrderDetails = useInstallmentStore((s) => s.orderDetails);
  const setOrderDetails = useInstallmentStore((s) => s.setOrderDetails);

  // The first page action is loading the latest request details from the API.
  const {
    data: orderDetailsResponse,
    isLoading: isOrderDetailsLoading,
    isError: isOrderDetailsError,
    refetch: refetchOrderDetails,
  } = useGetOrderProgressDetails(orderId);

  // API responses may be wrapped differently; normalize them before use.
  const fetchedOrderDetails =
    orderDetailsResponse?.data?.data || orderDetailsResponse?.data || null;

  console.log("order detail", fetchedOrderDetails);
  const orderDetails = fetchedOrderDetails || storedOrderDetails;
  const trackingId =
    orderDetails?.trackingId ||
    orderDetails?.tracking_id ||
    orderDetails?.tracking_code ||
    orderId;
  const requestStatus =
    fetchedOrderDetails?.request_status || fetchedOrderDetails?.reuest_status;
  const shouldEvaluateRules =
    requestStatus === "waiting_rules" || requestStatus === 'waiting_plan_selection';
  const shouldShowCreditScoreResult =
    fetchedOrderDetails?.current_step === "rules" ||
    requestStatus === "credit_score_result_pending";
  const currentStep = 1;
  const isLastStep = currentStep === 6;

  const {
    data: evaluateRulesResponse,
    isLoading: isEvaluateRulesLoading,
  } = useGetEvaluateRules(trackingId, {
    enabled: Boolean(trackingId) && shouldEvaluateRules,
  });

  const evaluateRulesData =
    evaluateRulesResponse?.data?.data || evaluateRulesResponse?.data || null;

  // Sync fresh API data into Zustand for the rest of the installment flow.
  useEffect(() => {
    if (!fetchedOrderDetails) return;

    setOrderDetails(fetchedOrderDetails);
  }, [fetchedOrderDetails, setOrderDetails]);

  const startCreditScore = useCallback(
    ({ force = false } = {}) => {
      if (!trackingId) return;
      if (!force && startedCreditScoreTrackingRef.current === trackingId)
        return;

      startedCreditScoreTrackingRef.current = trackingId;
      startCreditScoreResultGeneration(trackingId, {
        onSuccess: (res) => {
          setCreditScoreStartData(res?.data?.data || res?.data || null);
        },
      });
    },
    [trackingId, startCreditScoreResultGeneration],
  );

  useEffect(() => {
    if (step !== 2) return;

    startCreditScore();
  }, [step, startCreditScore]);

  useEffect(() => {
    if (!trackingId) return;
    if (!shouldShowCreditScoreResult) return;
    if (fetchedCreditScoreResultRef.current === trackingId) return;

    fetchedCreditScoreResultRef.current = trackingId;
    creditScoreResult(trackingId, {
      onSuccess: (res) => {
        setCreditScoreResultData(
          res?.data?.data?.report || res?.data?.report || null,
        );
        refetchOrderDetails();
      },
      onError: () => {
        fetchedCreditScoreResultRef.current = null;
      },
    });
  }, [
    trackingId,
    shouldShowCreditScoreResult,
    creditScoreResult,
    refetchOrderDetails,
  ]);

  console.log("start credit data", creditScoreStartData);

  // Last step returns the user to the request details page instead of advancing.
  const handleNext = () => {
    if (isLastStep) {
      router.replace(`/user/requests/${params.id}`);
      return;
    }

    setStep(step + 1);
  };

  const handleSubmitCode = (code) => {
    if (!trackingId) return;

    verifyCreditCode(
      {
        trackingId,
        code,
      },
      {
        onSuccess: () => {
          refetchOrderDetails();
        },
      },
    );
  };

  const handleResendCode = () => {
    startCreditScore({ force: true });
  };

  // Each wizard step receives the same request details and decides what it needs.
  const renderStepContent = () => {
    if (shouldEvaluateRules) {
      if (isEvaluateRulesLoading) {
        return <Loading message="در حال بررسی قوانین درخواست..." />;
      }

      return (
        <PaymentInfo
          trackingId={trackingId}
          orderDetails={fetchedOrderDetails}
          evaluateRulesData={evaluateRulesData}
        />
      );
    }

    switch (fetchedOrderDetails?.current_step) {
      case "credit_score":
        if (step == 1) {
          return <RequestIntro orderDetails={orderDetails} />;
        }
        if (step == 2) {
          if (!creditScoreStartData) {
            return <Loading message="در حال آماده‌سازی پرداخت..." />;
          }

          if (shouldShowCreditScoreResult) {
            return (
              <CreditScoreResult
                status={creditScoreResultData ? "ready" : "pending"}
                score={creditScoreResultData?.credit_score?.risk_grade}
                reportDate={
                  creditScoreResultData?.checked_at ||
                  creditScoreResultData?.created_at ||
                  undefined
                }
                riskTitle={creditScoreResultData?.final_analysis?.risk_level}
                checksSummaryValue={creditScoreResultData?.checks?.summary}
                startingNew={isCreditScoreResultPending}
                loanSummary={creditScoreResultData?.facilities?.received}
                loanGuarantedSummary={
                  creditScoreResultData?.facilities?.guaranteed
                }
              />
            );
          }

          if (creditScoreStartData.request_status === "credit_score_otp_sent") {
            return (
              <CreditCode
                canResendAfter={
                  creditScoreStartData?.can_resend_after ||
                  creditScoreStartData?.canResendAfter
                }
                key={
                  creditScoreStartData?.can_resend_after ||
                  creditScoreStartData?.canResendAfter ||
                  "credit-code"
                }
                onRequestCode={handleResendCode}
                onSubmitCode={handleSubmitCode}
                requesting={isStartingCreditScoreResultGeneration}
                submitting={isVerifyingCreditCode}
              />
            );
          }
          return (
            <CreditScoreIntro
              amount={creditScoreStartData?.amount}
              discountAmount={creditScoreStartData?.discount_amount}
              finalAmount={creditScoreStartData?.final_amount}
              paymentUrl={creditScoreStartData?.payment_url}
              loading={isStartingCreditScoreResultGeneration}
              onContinue={() => {}}
              trackingId={trackingId}
              creditScoreStartData={creditScoreStartData}
            />
          );
        }
      case "rules":
      case "plan":
        console.log('rules data', shouldEvaluateRules, isEvaluateRulesLoading, evaluateRulesData)
        if (requestStatus == "waiting_credit_score") {
          return (
            <CreditScoreResult
              status={creditScoreResultData ? "ready" : "pending"}
              score={creditScoreResultData?.credit_score?.risk_grade}
              reportDate={
                creditScoreResultData?.checked_at ||
                creditScoreResultData?.created_at ||
                undefined
              }
              riskTitle={creditScoreResultData?.final_analysis?.risk_level}
              checksSummaryValue={creditScoreResultData?.checks?.summary}
              startingNew={isCreditScoreResultPending}
              loanSummary={creditScoreResultData?.facilities?.received}
              loanGuarantedSummary={
                creditScoreResultData?.facilities?.guaranteed
              }
            />
          );
        }
        if (shouldEvaluateRules && isEvaluateRulesLoading) {
          return <Loading message="در حال بررسی قوانین درخواست..." />;
        }
      
        return (
          <PaymentInfo
            trackingId={trackingId}
            orderDetails={fetchedOrderDetails}
            evaluateRulesData={evaluateRulesData}
          />
        );

      // case 3:
      //   return <PaymentInfo orderDetails={orderDetails} showConfirmButton={false} />;

      // case 4:
      //   return <DownPayment orderDetails={orderDetails} paymentUrl="#" />;

      // case 5:
      //   return <Guarantor orderDetails={orderDetails} />;

      // case 6:
      //   return <CheckRegistration orderDetails={orderDetails} />;

      // case 7:
      //   return <WaitingPage orderDetails={orderDetails} />;

      // case 8:
      //   return <ESign orderDetails={orderDetails} />;

      default:
        return null;
    }
  };

  if (isOrderDetailsLoading) {
    return <Loading message="در حال دریافت جزئیات درخواست..." />;
  }

  if (isOrderDetailsError) {
    return (
      <div className="flex w-full flex-col px-4 pb-8 pt-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
          <h1 className="text-base font-bold text-red-700">
            دریافت جزئیات درخواست ناموفق بود
          </h1>
          <p className="mt-2 text-sm leading-6 text-red-600">
            لطفا دوباره تلاش کنید.
          </p>
          <button
            type="button"
            onClick={() => refetchOrderDetails()}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col px-4 pb-8 pt-6">
      {/* <ProgressStepper currentStep={currentStep} steps={REQUEST_STEPS} /> */}

      <div className="mt-2">{renderStepContent()}</div>

      {step != 2 &&
        requestStatus !== "waiting_credit_score" &&
        requestStatus !== "waiting_rules" && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
            >
              {isLastStep ? "پایان فرایند" : "مرحله بعد"}
            </button>
          </div>
        )}
    </div>
  );
}
