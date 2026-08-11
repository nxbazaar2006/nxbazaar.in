import type {
  FieldErrors,
  RegisterOptions,
  UseFormRegisterReturn,
} from "react-hook-form";

type RegisterField = (
  name: string,
  options?: RegisterOptions
) => UseFormRegisterReturn;

export type TextInputProps = {
  label: string;
  name: string;
  register: RegisterField;
  errors: FieldErrors;
  isRequired?: boolean;
  type?: string;
  className?: string;
  defaultValue?: string;
  list?: string;
};

export default function TextInput({
  label,
  name,
  register,
  errors,
  isRequired = true,
  type = "text",
  className = "sm:col-span-2",
  defaultValue = "",
  list,
}: TextInputProps) {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium leading-6 text-gray-900 mb-2"
      >
        {label}
      </label>
      <div className="mt-2">
        <input
          {...register(name, { required: isRequired })}
          type={type}
          name={name}
          id={name}
          list={list}
          defaultValue={defaultValue}
          autoComplete={String(name)}
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 py-2.5 px-4 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm [&:-webkit-autofill]:shadow-[0_0_0_1000px_#f9fafb_inset] [&:-webkit-autofill]:[color:_#111827] [&:-webkit-autofill]:[-webkit-text-fill-color:_#111827]"
          placeholder={`Type the ${label.toLowerCase()}`}
        />
        {errors[name] && (
          <span className="text-sm text-red-600">{label} is required</span>
        )}
      </div>
    </div>
  );
}
