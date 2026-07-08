"use client";

import { useParams } from "next/navigation";
import { useGetGuarantorProgress } from "@/shared/hooks/useGuarantor";
import CreditScoreIntro from "../../components/ui/CreditScore/Intro";
import GuarantorCreditScoreIntro from "../../components/ui/Guarantor/GuarantorCreditScoreIntro";
import CreditCode from "../../components/ui/CreditScore/CreditCode";
import GuarantorCreditCodeVerify from "../../components/ui/Guarantor/GuarantorCreditCodeVerify";
import GuarantorCreditScoreResult from "../../components/ui/Guarantor/GuarantorCreditScoreResult";
import Faild from "../../components/ui/Faild";

function getResponseData(response) {
  return response?.data?.data || response?.data || response || null;
}

function getApiErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "دریافت اطلاعات ضمانت ناموفق بود."
  );
}

const Page = () => {
  const params = useParams();
  const requestId = params?.id;
  const guarantorProgress = useGetGuarantorProgress(requestId);
  const progressData = getResponseData(guarantorProgress?.data);

  const requestStatus = progressData?.guarantor_status;
  const renderPage = () => {
    console.log('request status', requestStatus)
    switch(requestStatus) {
        case 'waiting_credit_score':
           return  <GuarantorCreditScoreIntro requestData={progressData} refetch={guarantorProgress.refetch}  />
        case 'credit_score_otp_sent':
            return <GuarantorCreditCodeVerify requestData={progressData} refetch={guarantorProgress.refetch} />
        case 'credit_score_result_pending':
        case 'credit_score_completed':
            return <GuarantorCreditScoreResult requestData={progressData} refetch={guarantorProgress.refetch} />;
        case 'failed':
            return <Faild />;

    }
  }
  if (guarantorProgress.isPending) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm font-medium text-slate-600">
          در حال دریافت اطلاعات ضمانت...
        </div>
      </div>
    );
  }

  if (guarantorProgress.isError) {
    return (
      <div className="px-4 py-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
          {getApiErrorMessage(guarantorProgress.error)}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
        {renderPage()}
    </div>
  );
};

export default Page;
