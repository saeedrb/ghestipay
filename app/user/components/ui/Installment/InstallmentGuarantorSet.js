import { useState } from "react";
import Guarantor from "../Request/Guarantor";
import { useInstallment } from "@/shared/hooks/useInstallment";

const InstallmentGuarantorSet = ({ orderDetails, refetchRequest }) => {
  const { setGuarantor } = useInstallment();
  const [resultStatus, setResultStatus] = useState("idle");
  const [resultMessage, setResultMessage] = useState("");

  const trackingId =
    orderDetails?.tracking_code ||
    orderDetails?.tracking_id ||
    orderDetails?.trackingId;
  const requiredGuarantorsCount = Number(
    orderDetails?.steps?.guarantor?.required_count || 0,
  );

  const handleSubmit = (guarantor, resetValues) => {
    if (!trackingId) {
      setResultStatus("rejected");
      setResultMessage("شماره درخواست برای ثبت ضامن پیدا نشد.");
      return;
    }

    setResultStatus("idle");
    setResultMessage("");

    setGuarantor.mutate(
      { trackingId, guarantor },
      {
        onSuccess: (res) => {
          const responseData = res?.data || res || null;
          const message = responseData?.message || "";

          if (responseData?.success === false) {
            setResultStatus("rejected");
            setResultMessage(message || "ثبت ضامن انجام نشد. لطفا دوباره تلاش کنید.");
            return;
          }

          setResultStatus("approved");
          setResultMessage(message || "دعوت ضامن با موفقیت ارسال شد.");
          resetValues?.();
          refetchRequest?.();
        },
        onError: (error) => {
          setResultStatus("rejected");
          setResultMessage(
            error?.response?.data?.message ||
              error?.response?.data?.error ||
              error?.message ||
              "ثبت ضامن انجام نشد. لطفا دوباره تلاش کنید.",
          );
        },
      },
    );
  };

  return (
    <Guarantor
      resultStatus={resultStatus}
      resultMessage={resultMessage}
      requiredGuarantorsCount={requiredGuarantorsCount}
      loading={setGuarantor.isPending}
      onSubmit={handleSubmit}
    />
  );
};

export default InstallmentGuarantorSet;
