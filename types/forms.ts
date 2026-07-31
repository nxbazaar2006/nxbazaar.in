import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";

export type FormRecord = Record<string, unknown>;

export type RegisteredInputProps<TFieldValues extends FieldValues = FieldValues> = {
  name: Path<TFieldValues>;
  register: UseFormRegister<TFieldValues>;
  errors?: FieldErrors<TFieldValues>;
};
