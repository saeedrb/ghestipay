"use client";

import Link from "next/link";
import RequestCard from "./RequestCard";
import { useEffect, useState } from "react";
import CardSkeletonLoading from "@/shared/components/ui/CardSkeletonLoading";
import {useGetOrderList} from "@/shared/hooks/useInstallment";

export default function LatestRequestsSection() {
  const [latestRequests, setLatestRequests] = useState([]);
  const [list, setList] = useState([]);
  const getOrderList = useGetOrderList({ page: 1, per_page: 10, sort: "desc" });

  useEffect(() => {
    if (getOrderList.isSuccess) {
      setLatestRequests(getOrderList?.data?.data?.data?.data);
    }
  }, [getOrderList.isSuccess]);

  useEffect(() => {
    let data = [];
    latestRequests?.forEach((request) => {
      console.log("request", request);
      data.push({
        id: request.tracking_code,
        date: new Date(request.created_at).toLocaleDateString("fa-IR"),
        installmentsTotal: `${Number(request?.amounts?.invoice_amount).toLocaleString("fa-IR")} تومان`,
        genericStatus: request.status,
        status:
          request.status === "rejected"
            ? "رد شده"
            : request.status === "approved"
              ? "تایید شده"
              : "در حال بررسی",
        itemsCount:
          Number(request?.items?.length).toLocaleString("fa-IR") || 0,
      });
    });
    setList(data);
  }, [latestRequests]);

  if (getOrderList.isLoading) {
    return <CardSkeletonLoading />;
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-black text-gray-900">آخرین درخواست‌</h2>
        <Link
          href="/user/requests"
          className="text-xs font-bold text-blue-600 transition hover:text-blue-700"
        >
          همه
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {list.map((request, index) => (
          <RequestCard key={index} request={request} />
        ))}
      </div>
    </section>
  );
}
