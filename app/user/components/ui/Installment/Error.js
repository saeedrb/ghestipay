import React from 'react'

const Error = ({ onRetry }) => {
    return (
      <div className="flex w-full flex-col px-4 pb-8 pt-6">
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
          <h1 className="text-base font-bold text-red-700">
            دریافت جزئیات درخواست ناموفق بود
          </h1>
          <p className="mt-2 text-sm leading-6 text-red-600">
            لطفا دوباره تلاش کنید.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition active:scale-[0.98]"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
}

export default Error
