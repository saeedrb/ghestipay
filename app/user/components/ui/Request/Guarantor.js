"use client";

import { useState } from "react";
import {
  BadgeCheck,
  CircleAlert,
  CircleCheckBig,
  Clock3,
} from "lucide-react";

const resultConfig = {
  idle: {
    title: "آماده ثبت ضامن",
    text: "اطلاعات ضامن را وارد کنید تا درخواست ثبت شود.",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock3,
  },
  pending: {
    title: "در حال ثبت ضامن",
    text: "اطلاعات ضامن در حال ارسال است.",
    className: "border-amber-200 bg-amber-50 text-amber-800",
    icon: Clock3,
  },
  approved: {
    title: "ضامن ثبت شد",
    text: "اطلاعات ضامن با موفقیت برای این درخواست ثبت شد.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    icon: CircleCheckBig,
  },
  rejected: {
    title: "ثبت ضامن ناموفق بود",
    text: "اطلاعات ضامن ثبت نشد. لطفا دوباره تلاش کنید.",
    className: "border-red-200 bg-red-50 text-red-800",
    icon: CircleAlert,
  },
};

const digitMap = {
  "۰": "0",
  "۱": "1",
  "۲": "2",
  "۳": "3",
  "۴": "4",
  "۵": "5",
  "۶": "6",
  "۷": "7",
  "۸": "8",
  "۹": "9",
  "٠": "0",
  "١": "1",
  "٢": "2",
  "٣": "3",
  "٤": "4",
  "٥": "5",
  "٦": "6",
  "٧": "7",
  "٨": "8",
  "٩": "9",
};

function normalizeDigits(value) {
  return String(value || "")
    .replace(/[۰-۹٠-٩]/g, (digit) => digitMap[digit] || digit)
    .replace(/\D/g, "");
}

function isValidNationalCode(value) {
  const nationalCode = normalizeDigits(value);

  if (!/^\d{10}$/.test(nationalCode)) return false;
  if (/^(\d)\1{9}$/.test(nationalCode)) return false;

  const check = Number(nationalCode[9]);
  const sum = nationalCode
    .slice(0, 9)
    .split("")
    .reduce((total, digit, index) => total + Number(digit) * (10 - index), 0);
  const remainder = sum % 11;

  return remainder < 2 ? check === remainder : check === 11 - remainder;
}

function validate(values) {
  const mobile = normalizeDigits(values.mobile);
  const nationalCode = normalizeDigits(values.nationalCode);
  const errors = {};

  if (!mobile) {
    errors.mobile = "شماره موبایل ضامن الزامی است";
  } else if (!/^09\d{9}$/.test(mobile)) {
    errors.mobile = "شماره موبایل باید با 09 شروع شود و 11 رقم باشد";
  }

  if (!nationalCode) {
    errors.nationalCode = "کد ملی ضامن الزامی است";
  } else if (!/^\d{10}$/.test(nationalCode)) {
    errors.nationalCode = "کد ملی باید 10 رقم باشد";
  } else if (!isValidNationalCode(nationalCode)) {
    errors.nationalCode = "کد ملی وارد شده معتبر نیست";
  }

  return errors;
}

export default function Guarantor({
  defaultValues = {},
  resultStatus = "idle",
  resultMessage = "",
  requiredGuarantorsCount = 0,
  loading = false,
  onSubmit,
}) {
  const [values, setValues] = useState({
    mobile: defaultValues.mobile || defaultValues.phone || "",
    nationalCode: defaultValues.national_code || defaultValues.nationalCode || "",
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const effectiveStatus = loading ? "pending" : resultStatus;
  const config = resultConfig[effectiveStatus] || resultConfig.idle;
  const ResultIcon = config.icon;

  const resetValues = () => {
    setValues({
      mobile: "",
      nationalCode: "",
    });
    setTouched({});
    setErrors({});
  };

  const handleChange = (field) => (event) => {
    const nextValues = {
      ...values,
      [field]: normalizeDigits(event.target.value),
    };

    setValues(nextValues);
    setErrors(validate(nextValues));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nextErrors = validate(values);

    setTouched({
      mobile: true,
      nationalCode: true,
    });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    onSubmit?.(
      {
        mobile: normalizeDigits(values.mobile),
        national_code: normalizeDigits(values.nationalCode),
      },
      resetValues,
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          اطلاعات ضامن
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          شماره موبایل و کد ملی ضامن را وارد کنید تا برای این درخواست ثبت شود.
        </p>
      </div>

      {requiredGuarantorsCount > 0 && (
        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
          برای این درخواست باید{" "}
          {requiredGuarantorsCount.toLocaleString("fa-IR")} ضامن ثبت کنید.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-100 bg-white p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="شماره تلفن ضامن"
            type="tel"
            placeholder="09xxxxxxxxx"
            value={values.mobile}
            onChange={handleChange("mobile")}
            onBlur={handleBlur("mobile")}
            error={touched.mobile ? errors.mobile : ""}
            maxLength={11}
          />

          <Field
            label="شماره ملی ضامن"
            inputMode="numeric"
            placeholder="1234567890"
            value={values.nationalCode}
            onChange={handleChange("nationalCode")}
            onBlur={handleBlur("nationalCode")}
            error={touched.nationalCode ? errors.nationalCode : ""}
            maxLength={10}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <BadgeCheck size={18} />
          {loading ? "در حال ثبت اطلاعات" : "ثبت ضامن"}
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
    </div>
  );
}

function Field({ label, error, ...props }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-bold text-slate-700">
        {label}
      </span>
      <input
        {...props}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-xl border bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-200 focus:border-blue-600 focus:ring-blue-100"
        }`}
      />
      {error && <span className="mt-2 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}
