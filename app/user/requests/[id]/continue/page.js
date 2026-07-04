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
import Loading from "@/shared/components/ui/Loading";
import {
  useGetEvaluateRules,
  useGetOrderProgressDetails,
} from "@/shared/hooks/useInstallment";
import { useInstallment } from "@/shared/hooks/useInstallment";
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
  const [isCreditScorePollingStopped, setIsCreditScorePollingStopped] =
    useState(false);
  const [isEvaluateRulesRequested, setIsEvaluateRulesRequested] =
    useState(false);
  const [guarantorResult, setGuarantorResult] = useState({
    status: "idle",
    message: "",
  });
  const [guarantorClearKey, setGuarantorClearKey] = useState(0);
  const startedCreditScoreTrackingRef = useRef(null);
  const creditScoreResultMutationRef = useRef(null);
  const creditScoreResultInFlightRef = useRef(false);
  const refetchOrderDetailsRef = useRef(null);
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
  const { getPaymentInformation, setGuarantor } = useInstallment();

  // Store a copy of request details so child steps and other pages can reuse it.
  const storedOrderDetails = useInstallmentStore((s) => s.orderDetails);
  const storedPaymentPlan = useInstallmentStore((s) => s.paymentPlan);
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
  const nextStep =
    orderDetails?.next_step ||
    orderDetails?.nextStep ||
    fetchedOrderDetails?.next_step ||
    fetchedOrderDetails?.nextStep ||
    fetchedOrderDetails?.data?.next_step ||
    fetchedOrderDetails?.data?.nextStep ||
    null;
  const requestStatus =
    fetchedOrderDetails?.request_status || fetchedOrderDetails?.reuest_status;
  const currentOrderStep =
    fetchedOrderDetails?.current_step ||
    orderDetails?.current_step ||
    orderDetails?.currentStep ||
    null;
  const shouldEvaluateRules =
    requestStatus === "waiting_rules" ||
    requestStatus === "waiting_plan_selection" ||
    requestStatus == "waiting_payment";
  const shouldFetchEvaluateRules =
    requestStatus === "waiting_rules"
      ? isEvaluateRulesRequested
      : shouldEvaluateRules;
  const shouldShowCreditScoreResult =
    fetchedOrderDetails?.current_step === "rules" ||
    requestStatus === "credit_score_result_pending" ||
    requestStatus === "waiting_plan_selection";
  const shouldPollCreditScoreResult =
    Boolean(trackingId) &&
    shouldShowCreditScoreResult &&
    !creditScoreResultData &&
    !isCreditScorePollingStopped &&
    ["credit_score_result_pending", "waiting_credit_score"].includes(
      requestStatus,
    );
  const effectiveCreditScoreStartData =
    creditScoreStartData ||
    (requestStatus === "credit_score_otp_sent" ? fetchedOrderDetails : null);
  const hasCreditScoreOtp =
    requestStatus === "credit_score_otp_sent" ||
    nextStep === "credit_score_otp_sent" ||
    effectiveCreditScoreStartData?.request_status === "credit_score_otp_sent";
  const currentStep = 1;
  const isLastStep = currentStep === 6;
  const shouldShowDownPaymentButton =
    nextStep === "payment" ||
    currentOrderStep === "payment" ||
    requestStatus === "payment";

  const { data: evaluateRulesResponse, isLoading: isEvaluateRulesLoading } =
    useGetEvaluateRules(trackingId, {
      enabled: Boolean(trackingId) && shouldFetchEvaluateRules,
      onSuccess: () => {
        refetchOrderDetails();
      },
    });

  const evaluateRulesData =
    evaluateRulesResponse?.data?.data || evaluateRulesResponse?.data || null;

  // Sync fresh API data into Zustand for the rest of the installment flow.
  useEffect(() => {
    creditScoreResultMutationRef.current = creditScoreResult;
    refetchOrderDetailsRef.current = refetchOrderDetails;
  }, [creditScoreResult, refetchOrderDetails]);

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
    if (hasCreditScoreOtp) return;
    if (shouldShowCreditScoreResult) return;

    startCreditScore();
  }, [hasCreditScoreOtp, shouldShowCreditScoreResult, step, startCreditScore]);

  useEffect(() => {
    setIsCreditScorePollingStopped(false);
  }, [trackingId]);

  useEffect(() => {
    if (!shouldPollCreditScoreResult) return;

    const requestCreditScoreResult = () => {
      if (creditScoreResultInFlightRef.current) return;

      creditScoreResultInFlightRef.current = true;
      creditScoreResultMutationRef.current?.(trackingId, {
        onSuccess: (res) => {
          const responseData = res?.data?.data || res?.data || null;
          const report = responseData?.report || res?.data?.report || null;
          const responseStatus =
            responseData?.request_status || res?.data?.request_status;
          const responseNextStep =
            responseData?.next_step || res?.data?.next_step;

          if (report) {
            setCreditScoreResultData(report);
            refetchOrderDetailsRef.current?.();
            return;
          }

          if (
            responseStatus === "waiting_plan_selection" ||
            responseNextStep === "plan"
          ) {
            setIsCreditScorePollingStopped(true);
            refetchOrderDetailsRef.current?.();
          }
        },
        onSettled: () => {
          creditScoreResultInFlightRef.current = false;
        },
        onError: () => {
          creditScoreResultInFlightRef.current = false;
        },
      });
    };

    requestCreditScoreResult();
    const intervalId = setInterval(requestCreditScoreResult, 10000);

    return () => {
      clearInterval(intervalId);
      creditScoreResultInFlightRef.current = false;
    };
  }, [trackingId, shouldPollCreditScoreResult]);

  console.log("start credit data", creditScoreStartData);

  // Last step returns the user to the request details page instead of advancing.
  const handleNext = () => {
    if (requestStatus === "waiting_rules" && !isEvaluateRulesRequested) {
      setIsEvaluateRulesRequested(true);
      return;
    }

    if (shouldShowDownPaymentButton) {
      const planId =
        storedPaymentPlan?.plan_id ||
        storedPaymentPlan?.id ||
        storedPaymentPlan?.active_plan?.plan_id ||
        storedPaymentPlan?.active_plan?.id ||
        orderDetails?.active_plan?.plan_id ||
        orderDetails?.active_plan?.id ||
        orderDetails?.payment_plan?.plan_id ||
        orderDetails?.payment_plan?.id ||
        orderDetails?.plan_id ||
        fetchedOrderDetails?.active_plan?.plan_id ||
        fetchedOrderDetails?.active_plan?.id ||
        fetchedOrderDetails?.plan_id ||
        fetchedOrderDetails?.payment_plan?.plan_id ||
        fetchedOrderDetails?.payment_plan?.id;

      if (!trackingId || !planId) return;

      getPaymentInformation.mutate(
        { trackingId, planId },
        {
          onSuccess: (res) => {
            const paymentUrl =
              res?.data?.data?.payment_url ||
              res?.data?.payment_url ||
              res?.data?.data?.url ||
              res?.data?.url ||
              res?.payment_url;

            if (paymentUrl) {
              router.push(paymentUrl);
            }
          },
        },
      );
      return;
    }

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

  const handleSubmitGuarantor = (guarantor) => {
    if (!trackingId) return;

    setGuarantor.mutate(
      {
        trackingId,
        guarantor,
      },
      {
        onSuccess: (res) => {
          const responseData = res?.data?.data || res?.data || null;
          setGuarantorResult({
            status: "approved",
            message:
              responseData?.message ||
              res?.data?.message ||
              "اطلاعات ضامن با موفقیت ثبت شد.",
          });
          setGuarantorClearKey((key) => key + 1);
          refetchOrderDetails();
        },
        onError: (error) => {
          setGuarantorResult({
            status: "rejected",
            message:
              error?.response?.data?.message ||
              error?.message ||
              "ثبت اطلاعات ضامن ناموفق بود. لطفا دوباره تلاش کنید.",
          });
        },
      },
    );
  };

  // Each wizard step receives the same request details and decides what it needs.
  const renderStepContent = () => {

    // if (requestStatus === "waiting_rules" && isEvaluateRulesRequested) {
    //   if (isEvaluateRulesLoading) {
    //     return <Loading message="در حال بررسی قوانین درخواست..." />;
    //   }

    //   return (
    //     <PaymentInfo
    //       trackingId={trackingId}
    //       orderDetails={fetchedOrderDetails}
    //       evaluateRulesData={evaluateRulesData}
    //     />
    //   );
    // }
    
    if (shouldEvaluateRules && requestStatus != 'waiting_rules') {
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

    console.log('cur', requestStatus);
    switch (fetchedOrderDetails?.current_step) {
      case "credit_score":
        if (step == 1) {
          return <RequestIntro orderDetails={orderDetails} />;
        }
        if (step == 2) {
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

          if (!effectiveCreditScoreStartData) {
            return <Loading message="در حال آماده‌سازی پرداخت..." />;
          }

          if (
            effectiveCreditScoreStartData.request_status === "credit_score_otp_sent" ||
            requestStatus === "credit_score_otp_sent"
          ) {
            return (
              <CreditCode
                canResendAfter={
                  effectiveCreditScoreStartData?.can_resend_after ||
                  effectiveCreditScoreStartData?.canResendAfter
                }
                key={
                  effectiveCreditScoreStartData?.can_resend_after ||
                  effectiveCreditScoreStartData?.canResendAfter ||
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
              amount={effectiveCreditScoreStartData?.amount}
              discountAmount={effectiveCreditScoreStartData?.discount_amount}
              finalAmount={effectiveCreditScoreStartData?.final_amount}
              paymentUrl={effectiveCreditScoreStartData?.payment_url}
              loading={isStartingCreditScoreResultGeneration}
              onContinue={() => {}}
              trackingId={trackingId}
              creditScoreStartData={effectiveCreditScoreStartData}
            />
          );
        }
      case "rules":
      case "plan":
      case "payment":
        console.log(
          "rules data",
          shouldEvaluateRules,
          isEvaluateRulesLoading,
          evaluateRulesData,
          requestStatus
        );
        if (requestStatus == "waiting_credit_score" || requestStatus == 'waiting_rules') {
          console.log('hi hi hi')
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
        console.log('hi hihi')
        return (

          <PaymentInfo
            trackingId={trackingId}
            orderDetails={fetchedOrderDetails}
            evaluateRulesData={evaluateRulesData}
          />
        );

      case "guarantor":
        // if(requestStatus == 'waiting_guarantor') {
        //   return (
        //     <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-center">
        //       <h2 className="text-base font-bold text-amber-800">
        //         در انتظار تایید ضامن
        //       </h2>
        //       <p className="mt-2 text-sm leading-6 text-amber-700">
        //         درخواست شما ثبت شده و پس از تایید ضامن، ادامه فرایند فعال می‌شود.
        //       </p>
        //     </div>
        //   );
        // }
        return (
          <Guarantor
            orderDetails={fetchedOrderDetails}
            loading={setGuarantor.isPending}
            clearKey={guarantorClearKey}
            onSubmit={handleSubmitGuarantor}
            resultStatus={guarantorResult.status}
            resultMessage={guarantorResult.message}
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

  console.log(nextStep);

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
        // requestStatus !== "waiting_credit_score" &&
        // requestStatus !== "waiting_rules" &&
        requestStatus !== 'waiting_guarantor' &&
        nextStep !== "plan" && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleNext}
              disabled={getPaymentInformation.isPending || isEvaluateRulesLoading}
              className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEvaluateRulesLoading
                ? "در حال بررسی قوانین..."
                : getPaymentInformation.isPending
                ? "در حال انتقال..."
                : shouldShowDownPaymentButton
                  ? "پرداخت پیش پرداخت"
                  : isLastStep
                    ? "پایان فرایند"
                    : "مرحله بعد"}
            </button>
          </div>
        )}
    </div>
  );
}
