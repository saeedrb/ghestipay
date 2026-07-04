"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Edit3,
  MessageSquareText,
  Phone,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { useAuth } from "@/shared/hooks/useAuth";

const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

const toPersianDigits = (value) =>
  String(value ?? "").replace(/\d/g, (digit) => persianDigits[Number(digit)]);

const toEnglishDigits = (value) =>
  String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const phoneValidationSchema = Yup.object().shape({
  phone: Yup.string()
    .required("شماره موبایل الزامی است")
    .matches(/^09\d{9}$/, "شماره موبایل نامعتبر است"),
});

const codeValidationSchema = Yup.object().shape({
  code: Yup.string()
    .required("کد تایید الزامی است")
    .matches(/^\d{5}$/, "کد باید 5 رقم باشد"),
});

function HeaderBrand() {
  return (
    <header className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm shadow-blue-200">
        G
      </div>
      <div>
        <p className="text-sm font-bold text-slate-950">GhestiPay</p>
        <p className="text-xs text-slate-500">مدیریت خرید اقساطی</p>
      </div>
    </header>
  );
}

function InlineInput({
  icon: Icon,
  error,
  className = "",
  displayPersianDigits = false,
  value,
  onChange,
  placeholder,
  ...props
}) {
  const displayedValue = displayPersianDigits ? toPersianDigits(value) : value;
  const displayedPlaceholder = displayPersianDigits
    ? toPersianDigits(placeholder)
    : placeholder;

  const handleChange = (event) => {
    if (!displayPersianDigits) {
      onChange?.(event);
      return;
    }

    const normalizedValue = toEnglishDigits(event.target.value);

    onChange?.({
      ...event,
      target: {
        ...event.target,
        name: event.target.name,
        value: normalizedValue,
      },
    });
  };

  return (
    <div className="min-w-0 flex-1">
      <div
        className={`relative flex h-13 items-center rounded-2xl border bg-white px-4 shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 ${
          error ? "border-red-300" : "border-blue-100"
        } ${className}`}
      >
        {Icon && (
          <Icon className="pointer-events-none absolute right-4 h-5 w-5 text-blue-500" />
        )}
        <input
          {...props}
          value={displayedValue}
          onChange={handleChange}
          placeholder={displayedPlaceholder}
          className="h-full min-w-0 flex-1 bg-transparent px-9 text-center text-sm font-semibold text-slate-950 outline-none placeholder:text-center placeholder:text-slate-400"
        />
      </div>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}

function ArrowSubmitButton({ disabled, loading }) {
  return (
    <button
      type="submit"
      disabled={disabled || loading}
      aria-label="ادامه"
      className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-blue-200 disabled:shadow-none"
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />
      ) : (
        <ArrowLeft className="h-5 w-5" />
      )}
    </button>
  );
}

 function OtpLoginIllustration({ className = "" }) {
  return (
    <svg
      viewBox="0 0 440 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="otpGlow1" x1="72" y1="44" x2="360" y2="280" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2563EB" stopOpacity="0.14" />
          <stop offset="1" stopColor="#14B8A6" stopOpacity="0.08" />
        </linearGradient>

        <linearGradient id="otpPhoneStroke" x1="140" y1="62" x2="286" y2="282" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#E4E4E7" />
        </linearGradient>

        <linearGradient id="otpPhoneBg" x1="152" y1="74" x2="274" y2="270" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F8FAFC" />
        </linearGradient>

        <linearGradient id="otpBubbleBg" x1="284" y1="116" x2="356" y2="186" gradientUnits="userSpaceOnUse">
          <stop stopColor="#18181B" />
          <stop offset="1" stopColor="#27272A" />
        </linearGradient>

        <filter id="otpPhoneShadow" x="110" y="44" width="210" height="270" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="28" stdDeviation="24" floodColor="#0F172A" floodOpacity="0.12" />
        </filter>

        <filter id="otpBubbleShadow" x="252" y="96" width="134" height="122" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="18" stdDeviation="18" floodColor="#18181B" floodOpacity="0.14" />
        </filter>

        <filter id="otpSoftShadow" x="80" y="180" width="130" height="90" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#2563EB" floodOpacity="0.10" />
        </filter>
      </defs>

      <circle cx="112" cy="78" r="72" fill="#2563EB" fillOpacity="0.05" />
      <circle cx="346" cy="258" r="70" fill="#14B8A6" fillOpacity="0.05" />
      <path
        d="M60 230C100 178 156 148 214 154C266 160 310 192 364 188"
        stroke="url(#otpGlow1)"
        strokeWidth="18"
        strokeLinecap="round"
      />

      <g filter="url(#otpPhoneShadow)">
        <rect x="132" y="56" width="164" height="236" rx="40" fill="#F4F4F5" />
        <rect x="133" y="57" width="162" height="234" rx="39" stroke="url(#otpPhoneStroke)" strokeWidth="2" />
        <rect x="144" y="68" width="140" height="212" rx="30" fill="url(#otpPhoneBg)" />
      </g>

      <rect x="191" y="78" width="46" height="7" rx="3.5" fill="#D4D4D8" />
      <circle cx="214" cy="264" r="8" fill="#F4F4F5" stroke="#E4E4E7" />

      <rect x="164" y="104" width="100" height="14" rx="7" fill="#18181B" fillOpacity="0.96" />
      <rect x="174" y="128" width="80" height="10" rx="5" fill="#A1A1AA" />

      <rect x="164" y="156" width="100" height="58" rx="20" fill="#F8FAFC" stroke="#E4E4E7" />
      <rect x="176" y="170" width="18" height="30" rx="9" fill="#EFF6FF" stroke="#BFDBFE" />
      <rect x="198" y="170" width="18" height="30" rx="9" fill="#EFF6FF" stroke="#BFDBFE" />
      <rect x="220" y="170" width="18" height="30" rx="9" fill="#EFF6FF" stroke="#BFDBFE" />
      <rect x="242" y="170" width="18" height="30" rx="9" fill="#EFF6FF" stroke="#BFDBFE" />

      <circle cx="185" cy="185" r="4" fill="#2563EB" />
      <circle cx="207" cy="185" r="4" fill="#2563EB" />
      <circle cx="229" cy="185" r="4" fill="#2563EB" />
      <circle cx="251" cy="185" r="4" fill="#D4D4D8" />

      <rect x="170" y="228" width="88" height="12" rx="6" fill="#18181B" />
      <rect x="192" y="232" width="44" height="4" rx="2" fill="white" fillOpacity="0.92" />

      <g filter="url(#otpBubbleShadow)">
        <rect x="270" y="108" width="98" height="74" rx="24" fill="url(#otpBubbleBg)" />
      </g>

      <rect x="286" y="124" width="32" height="10" rx="5" fill="white" fillOpacity="0.22" />
      <path
        d="M286 150L297 161L320 138"
        stroke="#34D399"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="330" y="146" width="20" height="8" rx="4" fill="#34D399" fillOpacity="0.25" />
      <path d="M286 182L300 170H324L310 182H286Z" fill="#27272A" />

      <g filter="url(#otpSoftShadow)">
        <rect x="96" y="194" width="92" height="54" rx="20" fill="white" />
        <rect x="96.75" y="194.75" width="90.5" height="52.5" rx="19.25" stroke="#E4E4E7" strokeWidth="1.5" />
        <rect x="112" y="210" width="20" height="20" rx="10" fill="#DBEAFE" />
        <path d="M120 220L124 224L130 216" stroke="#2563EB" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="140" y="212" width="30" height="8" rx="4" fill="#18181B" fillOpacity="0.92" />
        <rect x="140" y="226" width="22" height="6" rx="3" fill="#D4D4D8" />
      </g>

      <circle cx="106" cy="116" r="6" fill="#2563EB" fillOpacity="0.14" />
      <circle cx="344" cy="92" r="5" fill="#14B8A6" fillOpacity="0.16" />
      <circle cx="362" cy="214" r="7" fill="#2563EB" fillOpacity="0.12" />
    </svg>
  );
}

export default function OtpPage() {
  const { login, verify } = useAuth();

  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(120);
  const [serverError, setServerError] = useState("");
  const lastAutoSubmittedCode = useRef("");

  const phoneFormik = useFormik({
    initialValues: { phone: "" },
    validationSchema: phoneValidationSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      setServerError("");
      login.mutate(values.phone, {
        onSuccess: () => {
          setStep(2);
          setTimer(120);
        },
        onError: (error) => {
          const message = error?.response?.data?.message || "خطا در ارسال کد";
          setServerError(message);
        },
      });
    },
  });

  const codeFormik = useFormik({
    initialValues: { code: "" },
    validationSchema: codeValidationSchema,
    validateOnMount: true,
    onSubmit: (values) => {
      setServerError("");
      verify.mutate(
        {
          phone: phoneFormik.values.phone,
          code: values.code,
        },
        {
          onSuccess: () => {
            // redirect handled inside useAuth (role based)
          },
          onError: (error) => {
            const message =
              error?.response?.data?.message || "کد تایید نامعتبر است";
            setServerError(message);
          },
        }
      );
    },
  });

  useEffect(() => {
    if (step !== 2) return;
    if (timer === 0) return;

    const timeoutId = setTimeout(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [timer, step]);

  useEffect(() => {
    if (step !== 2) return;
    if (verify.isPending) return;
    const code = codeFormik.values.code;

    if (!/^\d{5}$/.test(code)) {
      lastAutoSubmittedCode.current = "";
      return;
    }

    if (lastAutoSubmittedCode.current === code) return;

    lastAutoSubmittedCode.current = code;
    codeFormik.submitForm();
  }, [codeFormik, step, verify.isPending]);

  const formatTime = (sec) => {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return toPersianDigits(`${m}:${s}`);
  };

  const handleResendOtp = () => {
    setTimer(120);
    phoneFormik.handleSubmit();
  };

  const isPhoneReady = phoneFormik.dirty && phoneFormik.isValid;
  const isCodeReady = codeFormik.dirty && codeFormik.isValid;

  return (
    <main className="min-h-screen bg-[#ffffff] text-slate-950">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-white px-5 pb-7 pt-6 shadow-[0_0_60px_rgba(37,99,235,0.08)]">
        <HeaderBrand />

        <div className="flex flex-1 flex-col justify-center">
          <div className="relative mx-auto aspect-[1.29] w-full max-w-85">
            {/* <Image
              src="/media/otp-security.svg"
              alt=""
              fill
              priority
              className="object-cover"
            /> */}

            <OtpLoginIllustration />
            
          </div>

          {serverError && (
            <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm leading-6 text-red-600">{serverError}</p>
            </div>
          )}
        </div>

        {step === 1 && (
          <form onSubmit={phoneFormik.handleSubmit} className="pb-1">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-950">
                شماره موبایل
              </h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                شماره خود را وارد کنید تا کد تایید برایتان ارسال شود.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <InlineInput
                icon={Phone}
                type="tel"
                inputMode="numeric"
                dir="ltr"
                placeholder="09xxxxxxxxx"
                displayPersianDigits
                {...phoneFormik.getFieldProps("phone")}
                error={
                  phoneFormik.touched.phone && phoneFormik.errors.phone
                    ? phoneFormik.errors.phone
                    : ""
                }
              />

              <ArrowSubmitButton
                disabled={!isPhoneReady}
                loading={login.isPending}
              />
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={codeFormik.handleSubmit} className="pb-1">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setServerError("");
                codeFormik.resetForm();
              }}
              className="mb-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت
            </button>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-950">کد تایید</h1>
              <p className="mt-2 text-sm leading-7 text-slate-500">
                کد پنج رقمی ارسال‌شده به {toPersianDigits(phoneFormik.values.phone)} را وارد
                کنید.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <InlineInput
                icon={MessageSquareText}
                type="text"
                inputMode="numeric"
                dir="ltr"
                maxLength={5}
                placeholder="-----"
                className="tracking-[0.45em]"
                displayPersianDigits
                {...codeFormik.getFieldProps("code")}
                error={
                  codeFormik.touched.code && codeFormik.errors.code
                    ? codeFormik.errors.code
                    : ""
                }
              />

              <ArrowSubmitButton
                disabled={!isCodeReady}
                loading={verify.isPending}
              />
            </div>

            <div className="mt-5 flex items-center justify-between text-xs text-slate-500">
              {timer > 0 ? (
                <span>ارسال مجدد تا {formatTime(timer)}</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-semibold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
                  disabled={login.isPending}
                >
                  {login.isPending ? "در حال ارسال..." : "ارسال مجدد کد"}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setServerError("");
                  codeFormik.resetForm();
                }}
                className="inline-flex items-center gap-1 font-semibold text-slate-500 transition hover:text-blue-600"
              >
                <Edit3 className="h-3.5 w-3.5" />
                ویرایش شماره
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
