import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  FileSignature,
  ShieldCheck,
  UserCheck,
} from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    title: "احراز هویت",
    description:
      "ابتدا اطلاعات هویتی شما بررسی می‌شود تا امکان ادامه فرایند خرید اقساطی فراهم شود.",
  },
  {
    icon: BadgeCheck,
    title: "اعتبارسنجی",
    description:
      "وضعیت اعتباری شما بررسی می‌شود و نتیجه آن در تصمیم‌گیری و ادامه مراحل اثر دارد.",
  },
  {
    icon: FileSignature,
    title: "ثبت امضای دیجیتال",
    description:
      "برای تکمیل قراردادها و تعهدات، ثبت امضای دیجیتال در طول فرایند لازم است.",
  },
];

const requirements = [
  "داشتن چک صیادی معتبر برای خریدار الزامی است.",
  "ضامن هم باید چک صیادی معتبر داشته باشد.",
  "ضامن باید مراحل اعتبارسنجی را انجام دهد.",
  "ضامن باید ثبت امضای دیجیتال را تکمیل کند.",
];

export default function RequestIntro() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-blue-50 px-4 py-5 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
          <ShieldCheck size={24} />
        </div>

        <h1 className="text-lg font-bold text-slate-900">
          راهنمای شروع خرید اقساطی
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-600">
          برای ثبت درخواست خرید اقساطی، لازم است چند مرحله هویتی و اعتباری
          را طی کنید و مدارک مورد نیاز خود و ضامن را آماده داشته باشید.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-900">
          مراحل اصلی فرایند
        </h2>

        <div className="space-y-3">
          {steps.map((step) => {
            const Icon = step.icon;

            return (
              <div
                key={step.title}
                className="flex gap-3 rounded-xl border border-slate-100 bg-white p-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon size={20} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-xs leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-bold text-slate-900">
          مدارک و الزامات خریدار و ضامن
        </h2>

        <div className="space-y-2 rounded-xl border border-slate-100 bg-white p-4">
          {requirements.map((item) => (
            <div key={item} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-600" size={18} />
              <p className="text-sm leading-6 text-slate-600">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
          <Banknote size={20} />
        </div>

        <div>
          <h2 className="text-sm font-bold text-amber-900">
            هزینه‌های احتمالی فرایند
          </h2>
          <p className="mt-1 text-xs leading-6 text-amber-800">
            برخی مراحل مثل اعتبارسنجی، ثبت امضای دیجیتال یا خدمات مرتبط ممکن
            است شامل هزینه باشد. این هزینه‌ها در طول فرایند به شما نمایش داده
            می‌شود و در صورت نیاز باید پرداخت شوند.
          </p>
        </div>
      </div>
    </div>
  );
}
