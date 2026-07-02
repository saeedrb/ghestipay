"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";


import Pagination from "@/shared/components/ui/Pagination";
import RequestCard from "../components/ui/RequestCard";
import CardSkeletonLoading from "@/shared/components/ui/CardSkeletonLoading";

import {
  useGetGuaranteeRequest,
  useGetOrderList,
  useInstallment,
} from "@/shared/hooks/useInstallment";

import GuaranteeRequestCard from "../components/ui/Request/GuaranteeRequestCard";

const requestTypes = [
  { key: "installments", label: "درخواست‌های اقساطی" },
  { key: "guarantees", label: "درخواست‌های ضمانت" },
];

function getResponsePayload(response) {
  return response?.data?.data || response?.data || {};
}

function getResponseItems(response) {
  const payload = getResponsePayload(response);

  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.requests)) return payload.requests;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.data?.data)) return payload.data.data;

  return [];
}

function getPaginationMeta(response) {
  const payload = getResponsePayload(response);
  const meta = payload.meta || payload.data || payload;

  return {
    currentPage: Number(meta.current_page || meta.currentPage || 1),
    totalPages: Number(meta.last_page || meta.lastPage || meta.total_pages || 1),
  };
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("fa-IR");
}

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fa-IR")} تومان`;
}

function getRequestStatus(status) {
  if (status === "invited") return "دعوت شده";
  if (status === "accepted") return "پذیرفته شده";
  if (status === "rejected") return "رد شده";
  if (status === "approved") return "تایید شده";
  if (status === "cancelled" || status === "canceled") return "لغو شده";
  if (status === "waiting_payment" || status === "pending_payment") {
    return "در انتظار پرداخت";
  }

  return "در حال بررسی";
}


export default function RequestsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { rejectGuaranteeRequest, acceptGuaranteeRequest } = useInstallment();

  const activeType = requestTypes.some(
    (type) => type.key === searchParams.get("type")
  )
    ? searchParams.get("type")
    : "installments";

  const installmentPage = Number(searchParams.get("installment_page")) || 1;
  const guaranteePage = Number(searchParams.get("guarantee_page")) || 1;
  const isGuaranteeType = activeType === "guarantees";

  const getOrderList = useGetOrderList(
    {
      page: installmentPage,
      per_page: 10,
      sort: "desc",
    },
    {
      enabled: !isGuaranteeType,
    }
  );

  const getGuaranteeRequest = useGetGuaranteeRequest(
    {
      page: guaranteePage,
      per_page: 10,
      sort: "desc",
    },
    {
      enabled: isGuaranteeType,
    }
  );

  const installmentRequests = getResponseItems(getOrderList.data);
  const guaranteeRequests = getResponseItems(getGuaranteeRequest.data);

  const installmentPagination = getPaginationMeta(getOrderList.data);
  const guaranteePagination = getPaginationMeta(getGuaranteeRequest.data);

  const installmentList = useMemo(() => {
    return installmentRequests.map((request) => ({
      id: request.tracking_code,
      date: new Date(request.created_at).toLocaleDateString("fa-IR"),
      installmentsTotal: `${Number(
        request?.amounts?.invoice_amount ?? 0
      ).toLocaleString("fa-IR")} تومان`,
      genericStatus: request.status,
      status: getRequestStatus(request.status),
      itemsCount: Number(request?.items?.length).toLocaleString("fa-IR") ?? 0,
    }));
  }, [installmentRequests]);

  const guaranteeList = useMemo(() => {
    return guaranteeRequests.map((request) => ({
      id:
        request.tracking_code ||
        request.tracking_id ||
        request.installment_request?.tracking_code ||
        request.id,
      date: formatDate(request.invited_at || request.created_at),
      guaranteeAmount: formatPrice(
        request?.installment_request?.plan?.guarantee_amount
      ),
      invoiceAmount: formatPrice(request?.installment_request?.invoice_amount),
      displayStatus: getRequestStatus(request.status || request.request_status),
      status: request.status || request.request_status || "",
      rejectReason: request.reject_reason,
      storeTitle: request?.installment_request?.store?.title || "-",
      customerName: request?.installment_request?.customer?.name || "-",
      customerMobile: request?.installment_request?.customer?.mobile || "-",
      installmentTrackingCode:
        request?.installment_request?.tracking_code || "-",
      nextStep: request.next_step,
    }));
  }, [guaranteeRequests]);

  const activeQuery = isGuaranteeType ? getGuaranteeRequest : getOrderList;
  const activeRequests = isGuaranteeType ? guaranteeList : installmentList;
  const activePagination = isGuaranteeType
    ? guaranteePagination
    : installmentPagination;

  const returnQuery = `?type=${activeType}&installment_page=${installmentPagination.currentPage}&guarantee_page=${guaranteePagination.currentPage}`;

  const updateListParams = ({
    type = activeType,
    installmentPage: nextInstallmentPage = installmentPagination.currentPage,
    guaranteePage: nextGuaranteePage = guaranteePagination.currentPage,
  }) => {
    const params = new URLSearchParams();

    params.set("type", type);
    params.set("installment_page", String(nextInstallmentPage));
    params.set("guarantee_page", String(nextGuaranteePage));

    router.replace(`/user/requests?${params.toString()}`);
  };

  const handleTypeChange = (type) => {
    updateListParams({
      type,
    });
  };

  const handleRejectGuarantee = (request) => {
    if (!request?.id) return;

    rejectGuaranteeRequest.mutate(
      { requestId: request.id },
      {
        onSuccess: () => {
          getGuaranteeRequest.refetch();
        },
      },
    );
  };

  const handleAcceptGuarantee = (request) => {
    if (!request?.id) return;

    acceptGuaranteeRequest.mutate(
      { requestId: request.id },
      {
        onSuccess: () => {
          getGuaranteeRequest.refetch();
          router.push(
            `/user/guarantor?id=${encodeURIComponent(request.id)}&status=${encodeURIComponent(
              request.status || "",
            )}&next_step=${encodeURIComponent(request.nextStep || "")}`,
          );
        },
      },
    );
  };

  if (activeQuery.isPending) {
    return (
      <div className="flex flex-col gap-3 px-4 pt-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <CardSkeletonLoading key={index} />
        ))}
      </div>
    );
  }

  if (activeQuery.isError) {
    return (
      <div className="px-4 pt-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
          خطا در دریافت اطلاعات
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6">
      <div className="space-y-3">
        <h1 className="text-lg font-black text-gray-900">
          همه درخواست‌ها
        </h1>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {requestTypes.map((type) => {
            const isActive = activeType === type.key;

            return (
              <button
                key={type.key}
                type="button"
                onClick={() => handleTypeChange(type.key)}
                className={`shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-600 shadow-sm ring-1 ring-gray-100"
                  }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      {activeRequests.length > 0 ? (
        <div className="flex flex-col gap-3">
          {activeRequests.map((request, index) =>
            isGuaranteeType ? (
              <GuaranteeRequestCard
                key={request.id || index}
                request={request}
                onAccept={handleAcceptGuarantee}
                onReject={handleRejectGuarantee}
                continueHref={`/user/guarantor?id=${encodeURIComponent(
                  request.id,
                )}&status=${encodeURIComponent(
                  request.status || "",
                )}&next_step=${encodeURIComponent(request.nextStep || "")}`}
              />
            ) : (
              <RequestCard
                key={request.id || index}
                request={request}
                returnQuery={returnQuery}
              />
            )
          )}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          درخواستی برای نمایش وجود ندارد.
        </div>
      )}

      <Pagination
        currentPage={activePagination.currentPage}
        totalPages={activePagination.totalPages}
        onPageChange={(newPage) => {
          if (isGuaranteeType) {
            updateListParams({ guaranteePage: newPage });
            return;
          }

          updateListParams({ installmentPage: newPage });
        }}
      />
    </div>
  );
}
