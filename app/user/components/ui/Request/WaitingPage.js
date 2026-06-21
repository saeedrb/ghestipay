import {
  BadgeCheck,
  CircleAlert,
  Clock3,
  FileSignature,
  MessageSquareText,
  ReceiptText,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";

const defaultSubmittedItems = [
  { title: "احراز هویت", status: "ثبت شده", icon: ShieldCheck },
  { title: "اعتبارسنجی", status: "ثبت شده", icon: BadgeCheck },
  { title: "اطلاعات پرداخت و اقساط", status: "ثبت شده", icon: ReceiptText },
  { title: "اطلاعات ضامن", status: "ثبت شده", icon: UserRoundCheck },
  { title: "چک‌ها و امضای قرارداد", status: "ثبت شده", icon: FileSignature },
];

export default function WaitingPage({
  submittedItems = defaultSubmittedItems,
  storeMessage = "",
  storeName = "فروشگاه",
  onEdit,
}) {
  const hasStoreMessage = Boolean(storeMessage);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <Clock3 size={24} />
        </div>

        <h2 className="text-base font-bold text-amber-950">
          در انتظار تایید نهایی فروشگاه
        </h2>

        <p className="mt-2 text-sm leading-6 text-amber-800">
          اطلاعات شما ثبت شده و اکنون باید توسط {storeName} بررسی و تایید شود.
          نتیجه نهایی پس از بررسی فروشگاه به شما نمایش داده می‌شود.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-100 bg-white p-4">
        <h3 className="mb-4 text-sm font-bold text-slate-900">
          موارد ثبت‌شده تا این مرحله
        </h3>

        <div className="space-y-3">
          {submittedItems.map((item) => {
            const Icon = item.icon || BadgeCheck;

            return (
              <div
                key={item.title}
                className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
                    <Icon size={19} />
                  </div>

                  <p className="break-words text-sm font-bold text-slate-900">
                    {item.title}
                  </p>
                </div>

                <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  {item.status || "ثبت شده"}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {hasStoreMessage && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-red-800">
            <CircleAlert size={20} />
            <h3 className="text-sm font-bold">پیام فروشگاه برای ویرایش</h3>
          </div>

          <div className="rounded-xl bg-white/70 p-3">
            <div className="flex gap-2 text-sm leading-7 text-red-800">
              <MessageSquareText className="mt-1 shrink-0" size={18} />
              <p>{storeMessage}</p>
            </div>
          </div>

          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
            >
              ویرایش اطلاعات
            </button>
          )}
        </section>
      )}
    </div>
  );
}
