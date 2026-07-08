import { useMutation, useQuery } from "@tanstack/react-query";
import { gurantorServices } from "../services/guarantor.service";
import { installmentService } from "../services/installment.service";

export function useGetGuarantorProgress(requestId, options = {}) {
  return useQuery({
    queryKey: ["getGuarantorProgress", requestId],
    queryFn: () => gurantorServices.getGuarantorProgress(requestId),
    enabled: Boolean(requestId),
    ...options,
  });
}

export function useGuarantor() {
  const evaluateGuarantor = useMutation({
    mutationFn: (requestId) => installmentService.evaluateGuarantorRules(requestId),
  });

  return {
    evaluateGuarantor,
  };
}
