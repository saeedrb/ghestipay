"use client";

import Link from "next/link";
import RequestCard from "./RequestCard";
import { useInstallment } from "@/shared/hooks/useInstallment";
import { useEffect, useState } from "react";
import CardSkeletonLoading from "@/shared/components/ui/CardSkeletonLoading";
import {useGetOrderList} from "@/shared/hooks/useInstallment";

export default function LatestRequestsSection() {
  const [latestRequests, setLatestRequests] = useState([]);
  const [list, setList] = useState([]);
  const getOrderList = useGetOrderList({ page: 1, per_page: 10, sort: "desc" });

  // const { getOrderList } = useInstallment();

  useEffect(() => {
    if (getOrderList.isSuccess) {
      setLatestRequests(getOrderList.data.data.data);
    }
  }, [getOrderList.isSuccess]);

  useEffect(() => {
    let data = [];
    latestRequests?.forEach((request) => {
      data.push({
        id: request.id,
        date: new Date(request.created_at).toLocaleDateString("fa-IR"),
        installmentsTotal: `${Number(request?.amounts?.installment_total).toLocaleString("fa-IR")} تومان`,
        status:
          request.status === "rejected"
            ? "رد شده"
            : request.status === "approved"
              ? "تایید شده"
              : "در حال بررسی",
        itemsCount:
          Number(request.invoice.items.length).toLocaleString("fa-IR") || 0,
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
        {list.map((request) => (
          <RequestCard key={request.id} request={request} />
        ))}
      </div>
    </section>
  );
}
