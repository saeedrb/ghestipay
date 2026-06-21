"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  UserRoundCheck,
} from "lucide-react";

const resultConfig = {
  idle: {
    title: "در انتظار بررسی ضامن",
    text: "اطلاعات ضامن را وارد کنید تا نتیجه اعتبارسنجی نمایش داده شود.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock3,
  },
  pending: {
    title: "در حال بررسی",
    text: "اعتبارسنجی ضامن در حال انجام است.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock3,
  },
  approved: {
    title: "ضامن مناسب است",
    text: "بر اساس نتیجه اعتبارسنجی، این ضامن برای ادامه فرایند قابل قبول است.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CircleCheckBig,
  },
  rejected: {
    title: "ضامن مناسب نیست",
    text: "بر اساس نتیجه اعتبارسنجی، لازم است ضامن دیگری معرفی کنید.",
    className: "border-red-200 bg-red-50 text-red-800",
    icon: CircleAlert,
  },
};

function normalizeBirthDate(value) {
  return value.replace(/\D/g, "");
}

function validate(values) {
  if (!/^09\d{9}$/.test(values.phone)) {
    return "شماره تلفن ضامن معتبر نیست.";
  }

  if (!/^\d{10}$/.test(values.nationalCode)) {
    return "شماره ملی ضامن باید ۱۰ رقم باشد.";
  }

  if (!/^\d{8}$/.test(normalizeBirthDate(values.birthDate))) {
    return "تاریخ تولد ضامن باید ۸ رقم باشد. مثال: 13700101";
  }

  return "";
}

export default function Guarantor({
  defaultValues = {},
  resultStatus = "rejected",
  resultMessage = "",
  loading = false,
  onSubmit,
}) {
  const [values, setValues] = useState({
    phone: defaultValues.phone || "",
    nationalCode: defaultValues.nationalCode || "",
    birthDate: defaultValues.birthDate || "",
  });
  const [error, setError] = useState("");

  const effectiveStatus = loading ? "pending" : resultStatus;
  const config = resultConfig[effectiveStatus] || resultConfig.idle;
  const ResultIcon = config.icon;

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationError = validate(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit?.({
      phone: values.phone.trim(),
      national_code: values.nationalCode.trim(),
      birth_date: normalizeBirthDate(values.birthDate),
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          اطلاعات ضامن
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          اطلاعات هویتی ضامن را وارد کنید تا نتیجه اعتبارسنجی او مشخص شود و
          سیستم اعلام کند آیا این ضامن برای ادامه فرایند مناسب است یا خیر.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="شماره تلفن ضامن"
            type="tel"
            placeholder="09xxxxxxxxx"
            value={values.phone}
            onChange={handleChange("phone")}
          />

          <Field
            label="شماره ملی ضامن"
            inputMode="numeric"
            placeholder="1234567890"
            value={values.nationalCode}
            onChange={handleChange("nationalCode")}
          />

          <Field
            label="تاریخ تولد ضامن"
            inputMode="numeric"
            placeholder="13700101"
            value={values.birthDate}
            onChange={handleChange("birthDate")}
          />
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BadgeCheck size={18} />
          {loading ? "در حال اعتبارسنجی..." : "اعتبارسنجی ضامن"}
        </button>
      </form>

      <div className={`rounded-2xl border p-4 ${config.className}`}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <ResultIcon size={22} />
          </div>

          <div>
            <h3 className="text-sm font-bold">{config.title}</h3>
            <p className="mt-1 text-sm leading-6">
              {resultMessage || config.text}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-blue-800">
        <UserRoundCheck className="mt-0.5 shrink-0" size={20} />
        <p className="text-xs leading-6">
          ضامن باید اعتبارسنجی و ثبت امضای دیجیتال را تکمیل کند و چک صیادی
          معتبر داشته باشد.
        </p>
      </div>
    </div>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </span>
      <input
        {...props}
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />
    </label>
  );
}
