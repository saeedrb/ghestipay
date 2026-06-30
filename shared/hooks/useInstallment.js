import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { installmentService } from "../services/installment.service";
import { useInstallmentStore } from "../stores/installment.store";

export function useInstallment() {
  const queryClient = useQueryClient();
  const setStoredPaymentPlan = useInstallmentStore((s) => s.setPaymentPlan);

  const storeOrder = useMutation({
    mutationFn: ({ phone, invoice_id }) =>
      installmentService.storeOrder({ phone, invoice_id }),
  });

  const setPaymentPlan = useMutation({
    mutationFn: ({
      trackingId,
      down_payment_amount,
      check_interval_months,
      months,
    }) =>
      installmentService.setPaymentPlan({
        trackingId,
        down_payment_amount,
        check_interval_months,
        months,
      }),
    onSuccess: (_data, variables) => {
      const responseData = _data?.data?.data || _data?.data || _data || null;
      setStoredPaymentPlan(responseData);

      if (!variables?.trackingId) return;

      queryClient.invalidateQueries({
        queryKey: ["getOrderProgressDetails", variables.trackingId],
      });
    },
  });

  const getPaymentInformation = useMutation({
    mutationKey: ['Payment'],
    mutationFn: ({trackingId, planId}) => installmentService.getPaymentInformation({trackingId, planId})
  })

  const removePaymentPlan = useMutation({
    mutationFn: (data) => installmentService.removePaymentPlan(data),
    onSuccess: (_data, variables) => {
      if (!variables?.trackingId) return;

      queryClient.invalidateQueries({
        queryKey: ["getOrderProgressDetails", variables.trackingId],
      });
    },
  });

  const getOrderList = (options) =>
    useQuery({
      queryKey: ["getOrderList"],
      queryFn: () => installmentService.getOrderList(options),
    });

  return {
    storeOrder,
    getOrderList,
    setPaymentPlan,
    removePaymentPlan,
    getPaymentInformation
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

export function useGetEvaluateRules(trackingId, options = {}) {
  return useQuery({
    queryKey: ["getEvaluateRules", trackingId],
    queryFn: () => installmentService.getEvaluateRules(trackingId),
    enabled: Boolean(trackingId),
    ...options,
  });
}
