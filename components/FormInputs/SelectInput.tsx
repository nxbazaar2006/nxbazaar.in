import type { FieldErrors, UseFormRegisterReturn } from "react-hook-form"; type RegisterField = (name: string) => UseFormRegisterReturn;
export type SelectInputOption = { id: string; title: string;
};
export type SelectInputProps = { label: string; name: string; register: RegisterField; errors?: FieldErrors; className?: string; options?: SelectInputOption[]; multiple?: boolean; placeholder?: string; disabled?: boolean;
};
export default function SelectInput({ label, name, register, className = "sm:col-span-2", options = [], multiple = false, placeholder = "Select an option", disabled = false,
}: SelectInputProps) { return ( <div className={className}> <label htmlFor={name} className="mb-2 block text-sm font-medium leading-6 text-white" > {label} </label> <div className="mt-2"> <select {...register(name)} id={name} multiple={multiple} name={name} disabled={disabled} className="liquid-card block w-full rounded-2xl border-0 py-3 px-4 text-white focus:ring-2 focus:ring-inset focus:ring-white/45 sm:text-sm sm:leading-6" > {placeholder && !multiple && <option value="" className="bg-slate-900 text-white">{placeholder}</option>} {options.map((option) => ( <option key={option.id} value={option.id} className="bg-slate-900 text-white"> {option.title} </option> ))} </select> </div> </div> );
}
