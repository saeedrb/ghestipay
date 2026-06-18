import { Check } from "lucide-react";

export default function ProgressStepper({
  currentStep = 1,
  steps = [],
}) {
  const safeStep = Math.min(Math.max(currentStep, 1), steps.length || 1);
  const progressPercent = steps.length > 1
    ? ((safeStep - 1) / (steps.length - 1)) * 100
    : 0;

  return (
    <div className="w-full overflow-hidden pb-7" dir="rtl">
      <div className="relative w-full">
        <div className="absolute left-2.5 right-2.5 top-2.5 h-1 -translate-y-1/2 rounded-full bg-slate-200" />
        <div
          className="absolute right-2.5 top-2.5 h-1 -translate-y-1/2 rounded-full bg-emerald-500 transition-all duration-300"
          style={{ width: `calc((100% - 20px) * ${progressPercent / 100})` }}
        />

        <div className="relative z-10 flex w-full items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const completed = stepNumber < safeStep;
            const active = stepNumber === safeStep;
            const isFirst = index === 0;
            const isLast = index === steps.length - 1;

            const labelPositionClass = isFirst
              ? "right-0 translate-x-0 text-right"
              : isLast
              ? "left-0 translate-x-0 text-left"
              : "left-1/2 -translate-x-1/2 text-center";

            return (
              <div key={step} className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                <div
                  className={`
                    flex h-5 w-5 items-center justify-center
                    rounded-full border-2 bg-white transition-all duration-300
                    ${
                      completed
                        ? "border-emerald-500 bg-emerald-500"
                        : active
                        ? "border-emerald-500"
                        : "border-slate-300"
                    }
                  `}
                >
                  {completed && <Check size={12} className="text-white" />}
                  {active && !completed && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
                </div>

                <span
                  className={`absolute top-7 w-20 truncate text-xs ${labelPositionClass} ${
                    completed || active ? "font-bold text-slate-900" : "text-slate-400"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
