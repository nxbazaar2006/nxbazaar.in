"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import SubmitButton from "../FormInputs/SubmitButton";
import TextInput from "../FormInputs/TextInput";

async function readRegistrationError(response: Response): Promise<string> {
  const responseData = (await response.json().catch(() => null)) as {
    message?: unknown;
  } | null;
  if (
    typeof responseData?.message === "string" &&
    responseData.message.trim()
  ) {
    return responseData.message;
  }
  return "Something went wrong, please try again.";
}

interface RegisterFormProps {
  role?: string;
  plan?: string;
}

export default function RegisterForm({
  role = "USER",
  plan: planProp,
}: RegisterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const plan = planProp ?? searchParams.get("plan");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [loading, setLoading] = useState(false);
  const [emailErr, setEmailErr] = useState("");

  async function onSubmit(data: Record<string, string>) {
    // Sanitize inputs
    data.name = typeof data.name === "string" ? data.name.trim() : data.name;
    data.email =
      typeof data.email === "string" ? data.email.trim().toLowerCase() : data.email;
    data.role = data.role || role;
    data.plan = plan ?? "";

    try {
      setLoading(true);
      setEmailErr("");

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
      const response = await fetch(`${baseUrl}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const responseData = await response.json();
        setLoading(false);
        toast.success("Account created successfully!");
        reset();

        // Use the role from the response, fallback to prop
        const createdRole = responseData?.data?.role ?? role;

        if (createdRole === "USER") {
          router.push("/");
        } else {
          const userId = responseData?.data?.id;
          router.push(`/verify-email?userId=${userId}`);
        }
      } else {
        setLoading(false);
        const message = await readRegistrationError(response);
        if (response.status === 409) {
          setEmailErr("User with this Email already exists");
          toast.error("User with this Email already exists");
        } else {
          toast.error(message);
        }
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong, please try again."
      );
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="">
      {/* Hidden role field */}
      <TextInput
        label=""
        name="role"
        register={register}
        errors={errors}
        type="hidden"
        defaultValue={role}
        className="sm:col-span-2 mb-3"
      />

      <TextInput
        label="Your Full Name"
        name="name"
        register={register}
        errors={errors}
        type="text"
        className="sm:col-span-2 mb-3"
      />

      <TextInput
        label="Email Address"
        name="email"
        register={register}
        errors={errors}
        type="email"
        className="sm:col-span-2 mb-3"
      />

      {emailErr && (
        <small className="text-red-600 -mt-2 mb-2 block">{emailErr}</small>
      )}

      <TextInput
        label="Password"
        name="password"
        register={register}
        errors={errors}
        type="password"
      />

      <SubmitButton
        isLoading={loading}
        buttonTitle="Register"
        loadingButtonTitle="Creating account..."
      />

      <div className="flex gap-2 justify-between">
        <p className="text-[0.75rem] font-light text-gray-500 py-4">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-purple-600 hover:underline"
          >
            Login
          </Link>
        </p>

        {role === "USER" ? (
          <p className="text-[0.75rem] font-light text-gray-500 py-4">
            Are you a Farmer?{" "}
            <Link
              href="/farmer-pricing"
              className="font-medium text-purple-600 hover:underline"
            >
              Register here
            </Link>
          </p>
        ) : (
          <p className="text-[0.75rem] font-light text-gray-500 py-4">
            Are you a User?{" "}
            <Link
              href="/register"
              className="font-medium text-purple-600 hover:underline"
            >
              Register here
            </Link>
          </p>
        )}
      </div>
    </form>
  );
}