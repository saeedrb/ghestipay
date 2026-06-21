"use client";

import { useRef, useState } from "react";
import {
  CalendarDays,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  Hash,
  ImageUp,
  ReceiptText,
  UserRound,
} from "lucide-react";

const sampleChecks = [
  {
    id: 1,
    status: "registered",
    amount: 25000000,
    dueDate: "1403/08/15",
    receiverName: "شرکت فروشگاه نمونه",
    receiverNationalCode: "10101234567",
  },
  {
    id: 2,
    status: "not_registered",
    amount: 25000000,
    dueDate: "1403/09/15",
    receiverName: "شرکت فروشگاه نمونه",
    receiverNationalCode: "10101234567",
  },
];

const checkStatusConfig = {
  not_registered: {
    label: "ثبت نشده",
    className: "border-slate-200 bg-slate-50 text-slate-700",
    icon: Clock3,
  },
  pending: {
    label: "در حال بررسی",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    icon: Clock3,
  },
  registered: {
    label: "ثبت شده",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    icon: CircleCheckBig,
  },
  rejected: {
    label: "رد شده",
    className: "border-red-200 bg-red-50 text-red-700",
    icon: CircleAlert,
  },
};

function formatPrice(value) {
  return `${Number(value || 0).toLocaleString("fa-IR")} تومان`;
}

export default function CheckRegistration({
  checks = sampleChecks,
  onUpload,
  uploadingCheckId = null,
}) {
  const [forms, setForms] = useState({});

  const updateForm = (checkId, patch) => {
    setForms((prev) => ({
      ...prev,
      [checkId]: {
        ...(prev[checkId] || {}),
        ...patch,
      },
    }));
  };

  const handleSubmit = (check) => {
    const form = forms[check.id] || {};

    onUpload?.({
      check_id: check.id,
      sayad_number: form.sayadNumber || "",
      image: form.image || null,
      check,
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-base font-bold text-slate-900">
          ثبت و آپلود چک‌ها
        </h2>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          اطلاعات هر چک را مطابق موارد زیر ثبت کنید. برای هر چک، شماره صیادی
          و تصویر چک نوشته‌شده باید ارسال شود.
        </p>
      </div>

      <SampleCheck />

      <div className="space-y-4">
        {checks.map((check, index) => (
          <CheckUploadCard
            key={check.id}
            check={check}
            index={index}
            form={forms[check.id] || {}}
            uploading={uploadingCheckId === check.id}
            onChange={(patch) => updateForm(check.id, patch)}
            onSubmit={() => handleSubmit(check)}
          />
        ))}
      </div>
    </div>
  );
}

function SampleCheck() {
  return (
    <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <h3 className="mb-3 text-sm font-bold text-blue-950">
        نمونه تکمیل صحیح چک
      </h3>

      <div className="rounded-2xl border border-blue-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-dashed border-blue-200 pb-3">
          <span className="text-xs font-bold text-blue-700">چک صیادی</span>
          <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">
            شماره صیادی: ۱۲۳۴۵۶۷۸۹۰۱۲۳۴۵۶
          </span>
        </div>

        <div className="space-y-3 text-sm text-slate-700">
          <SampleRow label="در وجه" value="شرکت فروشگاه نمونه" />
          <SampleRow label="شناسه/شماره ملی دریافت‌کننده" value="۱۰۱۰۱۲۳۴۵۶۷" />
          <SampleRow label="مبلغ" value="۲۵٬۰۰۰٬۰۰۰ تومان" />
          <SampleRow label="تاریخ" value="۱۴۰۳/۰۸/۱۵" />
        </div>

        <p className="mt-4 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-6 text-amber-800">
          تصویر چک باید خوانا باشد و مبلغ، تاریخ، نام دریافت‌کننده و شماره
          صیادی در آن مشخص باشد.
        </p>
      </div>
    </section>
  );
}

function SampleRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}

function CheckUploadCard({ check, index, form, uploading, onChange, onSubmit }) {
  const fileInputRef = useRef(null);
  const canSubmit = form.sayadNumber?.trim() && form.image;
  const statusKey = uploading ? "pending" : check.status || "not_registered";
  const status = checkStatusConfig[statusKey] || checkStatusConfig.not_registered;
  const StatusIcon = status.icon;
  const isRegistered = statusKey === "registered";

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">
          چک شماره {Number(index + 1).toLocaleString("fa-IR")}
        </h3>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
        >
          <StatusIcon size={13} />
          {status.label}
        </span>
      </div>

      <div className="space-y-3">
        <InfoItem icon={ReceiptText} label="مبلغ چک" value={formatPrice(check.amount)} />
        <InfoItem icon={CalendarDays} label="تاریخ چک" value={check.dueDate} />
        <InfoItem icon={UserRound} label="نام دریافت‌کننده" value={check.receiverName} />
        <InfoItem
          icon={Hash}
          label="شماره ملی دریافت‌کننده"
          value={check.receiverNationalCode}
        />
      </div>

      {!isRegistered && (
        <>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">
                شماره صیادی چک
              </span>
              <input
                value={form.sayadNumber || ""}
                onChange={(event) => onChange({ sayadNumber: event.target.value })}
                inputMode="numeric"
                placeholder="شماره صیادی را وارد کنید"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div>
              <span className="mb-2 block text-xs font-bold text-slate-700">
                تصویر چک
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onChange({ image: event.target.files?.[0] || null })}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-700"
              >
                <ImageUp size={18} />
                {form.image ? form.image.name : "انتخاب عکس چک"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit || uploading}
            className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {uploading ? "در حال ارسال..." : "ارسال اطلاعات چک"}
          </button>
        </>
      )}
    </section>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600">
        <Icon size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-slate-500">{label}</p>
        <p className="mt-1 break-words text-sm font-bold leading-6 text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}
