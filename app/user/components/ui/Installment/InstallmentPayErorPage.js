import { AlertTriangle, RefreshCw } from "lucide-react";

const InstallmentPayErorPage = ({ orderDetails, refetchRequest }) => {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <AlertTriangle size={20} />
        </div>

        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-slate-900">
            پرداخت پلن قبلی تکمیل نشده است
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            شما قبلا یک پلن برای پرداخت انتخاب کرده‌اید، اما پرداخت آن انجام
            نشده است. برای ادامه درخواست، لازم است پلن فعلی را تغییر دهید و
            دوباره شرایط پرداخت را انتخاب کنید.
          </p>

          <button
            type="button"
            onClick={() => {}}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={18} />
            تغییر پلن
          </button>
        </div>
      </div>
    </section>
  );
};

export default InstallmentPayErorPage;
