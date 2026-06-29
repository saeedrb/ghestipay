import { useMutation, useQuery } from "@tanstack/react-query";
import { installmentService } from "../services/installment.service";

export function useInstallment() {
  const storeOrder = useMutation({
    mutationFn: ({ phone, invoice_id }) =>
      installmentService.storeOrder({ phone, invoice_id }),
  });

  const getOrderList = (options) =>  useQuery({
    queryKey: ["getOrderList"],
    queryFn: () => installmentService.getOrderList(options),
  });

  return {
    storeOrder,
    getOrderList,
  };
}

export function useGetOrderList(options) {
  return useQuery({
    queryKey: ["getOrderList", options],
    queryFn: () => installmentService.getOrderList(options),
  });
}

export function useGetOrderDetails(orderId, options = {}) {
  return useQuery({
    queryKey: ["getOrderDetails", orderId],
    queryFn: () => installmentService.getOrderDetails(orderId),
    enabled: Boolean(orderId),
    ...options,
  });
}

export function useGetOrderProgressDetails(orderId, options = {}) {
  return useQuery({
    queryKey: ["getOrderProgressDetails", orderId],
    queryFn: () => installmentService.getOrderProgressDetails(orderId),
    enabled: Boolean(orderId),
    ...options,
  });
}