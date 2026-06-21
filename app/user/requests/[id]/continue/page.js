"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";

import CheckRegistration from "@/app/user/components/ui/Request/CheckRegistration";
import DownPayment from "@/app/user/components/ui/Request/DownPayment";
import ESign from "@/app/user/components/ui/Request/ESign";
import Guarantor from "@/app/user/components/ui/Request/Guarantor";
import PaymentInfo from "@/app/user/components/ui/Request/PaymentInfo";
import RequestIntro from "@/app/user/components/ui/Request/RequestIntro";
import RequiredMents from "@/app/user/components/ui/Request/RequiredMents";
import WaitingPage from "@/app/user/components/ui/Request/WaitingPage";
import ProgressStepper from "@/shared/components/ui/ProgressStepper";

const REQUEST_STEPS = [
  "راهنما",
  "الزامات",
  "پرداخت",
  "پیش‌پرداخت",
  "ضامن",
  "ثبت چک",
  "بررسی",
  "امضا",
];

function normalizeStep(step) {
  const numericStep = Number(step || 1);
  return Math.min(Math.max(numericStep || 1, 1), REQUEST_STEPS.length);
}

export default function ContinueRequestPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const currentStep = normalizeStep(searchParams.get("step"));
  const isLastStep = currentStep === REQUEST_STEPS.length;

  const goToStep = (step) => {
    const nextStep = normalizeStep(step);
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("step", String(nextStep));

    router.replace(`/user/requests/${params.id}/continue?${nextParams.toString()}`);
  };

  const handleNext = () => {
    if (isLastStep) {
      router.replace(`/user/requests/${params.id}`);
      return;
    }

    goToStep(currentStep + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <RequestIntro />;

      case 2:
        return <RequiredMents />;

      case 3:
        return <PaymentInfo showConfirmButton={false} />;

      case 4:
        return <DownPayment paymentUrl="#" />;

      case 5:
        return <Guarantor />;

      case 6:
        return <CheckRegistration />;

      case 7:
        return <WaitingPage />;

      case 8:
        return <ESign />;

      default:
        return null;
    }
  };

  return (
    <div className="flex w-full flex-col px-4 pb-8 pt-6">
      <ProgressStepper currentStep={currentStep} steps={REQUEST_STEPS} />

      <div className="mt-2">{renderStepContent()}</div>

      <div className="mt-6">
        <button
          type="button"
          onClick={handleNext}
          className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
        >
          {isLastStep ? "پایان فرایند" : "مرحله بعد"}
        </button>
      </div>
    </div>
  );
}
