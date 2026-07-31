import { LiquidGlassSwitch } from "@/components/ui/liquid-glass-switch";
import type { FieldValues, Path, UseFormRegister } from "react-hook-form"; type ToggleInputProps<TFieldValues extends FieldValues = FieldValues> = { label: string; name: Path<TFieldValues>; trueTitle: string; falseTitle: string; register: UseFormRegister<TFieldValues>; className?: string; disabled?: boolean; description?: string;
};
export default function ToggleInput<TFieldValues extends FieldValues = FieldValues>({ label, name, trueTitle, falseTitle, register, className = "sm:col-span-2 flex flex-wrap items-center gap-3", disabled = false, description,
}: ToggleInputProps<TFieldValues>) { const registration = register(name); return ( <div className={className}> <div className="w-full sm:w-1/2"> <h2 className="mb-2 block text-sm font-medium leading-6 text-white"> {label} </h2> </div> <div className="w-full sm:w-1/2"> <LiquidGlassSwitch defaultChecked={false} activeLabel={trueTitle} inactiveLabel={falseTitle} variant="success" disabled={disabled} description={description} inputProps={registration} /> </div> </div> );
}
