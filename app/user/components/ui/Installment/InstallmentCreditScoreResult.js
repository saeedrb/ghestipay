"use client";

import { useEffect, useState } from "react";

import Loading from "@/shared/components/ui/Loading";
import { useCredit } from "@/shared/hooks/useCredit";
import { useGetEvaluateRules } from "@/shared/hooks/useInstallment";
import CreditScoreResult from "../CreditScore/Result";
import PaymentInfo from "../Request/PaymentInfo";

const InstallmentCreditScoreResult = ({ orderDetails, refetchRequest }) => {
  const [step, setStep] = useState(1);
  const [resultData, setResultData] = useState(null);
  const {
    creditScoreResult: { mutate: fetchCreditScoreResult, isPending },
  } = useCredit();

  const trackingId =
    orderDetails?.tracking_id ||
    orderDetails?.trackingId ||
    orderDetails?.tracking_code;

  const {
    refetch: refetchEvaluateRules,
    isFetching: isEvaluateRulesFetching,
  } = useGetEvaluateRules(trackingId, {
    enabled: false,
  });

  useEffect(() => {
    if (!trackingId) return;
    if (resultData) return;

    fetchCreditScoreResult(trackingId, {
      onSuccess: (res) => {
        const responseData = res?.data?.data || res?.data || null;
        const report = responseData?.report || responseData || null;

        if (report) {
          setResultData(report);
          refetchRequest?.();
        }
      },
    });
  }, [fetchCreditScoreResult, refetchRequest, resultData, trackingId]);

  const handleContinue = async () => {
    if (!trackingId) return;

    const res = await refetchEvaluateRules();

    if (res?.isError) return;

    setStep(2);
    refetchRequest?.();
  };

  if (isPending || !resultData) {
    return <Loading message="در حال دریافت نتیجه اعتبارسنجی..." />;
  }

  if (step === 1) {
    return (
      <div className="space-y-4">
        <CreditScoreResult
          status="ready"
          score={resultData?.credit_score?.risk_grade || resultData?.score}
          reportDate={resultData?.checked_at || resultData?.created_at}
          riskTitle={
            resultData?.final_analysis?.risk_level || resultData?.risk_title
          }
          checksSummaryValue={
            resultData?.checks?.summary || resultData?.checks_summary
          }
          loanSummary={
            resultData?.facilities?.received || resultData?.loan_summary
          }
          loanGuarantedSummary={
            resultData?.facilities?.guaranteed ||
            resultData?.loan_guaranteed_summary
          }
        />

        <button
          type="button"
          onClick={handleContinue}
          disabled={isEvaluateRulesFetching}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isEvaluateRulesFetching ? "در حال بررسی قوانین..." : "ادامه"}
        </button>
      </div>
    );
  }

  if (step === 2) {
    return <PaymentInfo />;
  }

  return null;
};

export default InstallmentCreditScoreResult;
