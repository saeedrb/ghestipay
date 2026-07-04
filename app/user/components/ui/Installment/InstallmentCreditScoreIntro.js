import Button from "@/shared/components/ui/Button";
import RequestIntro from "../Request/RequestIntro";
import { useEffect, useState } from "react";
import { useCredit } from "@/shared/hooks/useCredit";
import CreditScoreIntro from "../CreditScore/Intro";
import Loading from "@/shared/components/ui/Loading";

function formatAmount(value) {
  if (value === null || value === undefined || value === "") return "";

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return value;

  return `${numericValue.toLocaleString("fa-IR")} ریال`;
}

const InstallmentCreditScoreIntro = ({ orderDetails, refetchRequest }) => {
  const [step, setStep] = useState(1);
  const [creditScoreStartData, setCreditScoreStartData] = useState(null);
  const {
    startCreditScoreResultGeneration: {
      mutate: startCreditScoreResultGeneration,
      isPending: isStartingCreditScore,
    },
  } = useCredit();

  const trackingId =
    orderDetails?.tracking_id ||
    orderDetails?.trackingId ||
    orderDetails?.tracking_code;

  useEffect(() => {
    if (step !== 2) return;
    if (!trackingId) return;
    if (creditScoreStartData) return;

    startCreditScoreResultGeneration(trackingId, {
      onSuccess: (res) => {
        const responseData = res?.data?.data || res?.data || null;

        setCreditScoreStartData(responseData);

        if (responseData?.request_status === "credit_score_otp_sent") {
          refetchRequest?.();
          return;
        }

        if (!responseData?.payment_required) {
          refetchRequest?.();
        }
      },
    });
  }, [
    creditScoreStartData,
    refetchRequest,
    startCreditScoreResultGeneration,
    step,
    trackingId,
  ]);

  const paymentData = creditScoreStartData || {};
  const currentAmount = paymentData?.amount;
  const currentDiscountAmount = paymentData?.discount_amount;
  const currentFinalAmount = paymentData?.final_amount;
  const currentPaymentUrl = paymentData?.payment_url;
  const isLoading = isStartingCreditScore;

  const hasDiscount = Boolean(Number(currentDiscountAmount));
  const displayAmount = formatAmount(currentAmount);
  const displayDiscountAmount = formatAmount(currentDiscountAmount);
  const displayFinalAmount = formatAmount(currentFinalAmount);

  if (step === 1) {
    return (
      <>
        <RequestIntro />
        <Button onClick={() => setStep(2)} className="mt-6">
          {isLoading ? "در حال پردازش..." : "ادامه"}
        </Button>
      </>
    );
  }

  if (step === 2 && !creditScoreStartData) {
    return <Loading />;
  }

  if (step === 2) {
    return (
      <CreditScoreIntro
        amount={currentAmount}
        loading={isLoading}
        finalAmount={currentFinalAmount}
        discountAmount={currentDiscountAmount}
        paymentUrl={currentPaymentUrl}
        hasDiscount={hasDiscount}
        displayAmount={displayAmount}
        displayDiscountAmount={displayDiscountAmount}
        displayFinalAmount={displayFinalAmount}
        refetchRequest={refetchRequest}
        orderDetails={orderDetails}
      />
    );
  }
};

export default InstallmentCreditScoreIntro;
