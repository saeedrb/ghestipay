class InstallmentStepUtils {
    getStepIndexByStatus(status) {
        const statusToStepIndexMap = {
            waiting_credit_score: 1,
            waiting_requirements: 2,
            waiting_payment: 3,
            waiting_down_payment: 4,
            waiting_guarantor: 5,
            waiting_check_registration: 6,
            waiting_review: 7,
            waiting_signature: 8,
        };  
        return statusToStepIndexMap[status] ?? -1;
    }
}

const installmentStepUtils = new InstallmentStepUtils();

export default installmentStepUtils;