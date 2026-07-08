import { CircleX } from "lucide-react";

export default function Faild({
  title = "درخواست رد شد",
  message = "دلیل رد شدن درخواست در دسترس نیست.",
}) {
  return (
    <section className="rounded-2xl border border-red-100 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <CircleX size={22} />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-base font-bold text-red-700">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-red-600">{message}</p>
        </div>
      </div>
    </section>
  );
}
