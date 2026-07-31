import { Loader2, Plus } from "lucide-react";

export type SubmitButtonProps = {
  isLoading?: boolean;
  disabled?: boolean;
  buttonTitle: string;
  loadingButtonTitle: string;
  className?: string;
};

export default function SubmitButton({
  isLoading = false,
  disabled = false,
  buttonTitle,
  loadingButtonTitle,
  className = "",
}: SubmitButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <div className="col-span-full flex justify-center w-full">
      <button
        type={isLoading ? "button" : "submit"}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        className={`liquid-glass-control liquid-glass-primary mt-4 flex min-h-11 shrink-0 items-center gap-2.5 rounded-full py-1 pl-4 pr-1 font-semibold !text-white sm:mt-6 [&_*]:!text-white [&_svg]:!stroke-white ${className}`}
      >
        <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
        <span className="liquid-glass-content min-w-0 flex-1 py-1.5 pr-1.5 text-sm font-semibold text-white">
          {isLoading ? loadingButtonTitle : buttonTitle}
        </span>
        <span
          className="liquid-glass-content pointer-events-none grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(0,0,0,0.42),0_0_18px_rgba(99,102,241,0.36)]"
          aria-hidden="true"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.65)]" />
          ) : (
            <Plus className="h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.65)]" />
          )}
        </span>
      </button>
    </div>
  );
}
