"use client";

import { CityCombobox } from "@/components/location/city-combobox";
import { CountryField } from "@/components/location/country-field";
import { PinCodeInput } from "@/components/location/pin-code-input";
import { StateCombobox } from "@/components/location/state-combobox";
import { UseCurrentLocationButton } from "@/components/location/use-current-location-button";
import { getIndiaStateByNameOrCode } from "@/lib/india/states";
import { locationSchema, type LocationFormValues } from "@/lib/validations/location-schema";
import type { LocationValue } from "@/types/location";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ArrowRight } from "lucide-react";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";

type LocationFormProps = {
  defaultValue?: Partial<LocationValue>;
  onSubmit: (value: LocationValue) => void;
  onCancel?: () => void;
  showCurrentLocation?: boolean;
};

export function LocationForm({
  defaultValue,
  onSubmit,
  onCancel,
  showCurrentLocation = true,
}: LocationFormProps) {
  const initialFormValues: LocationFormValues = {
    country: "India",
    countryCode: "IN",
    state: defaultValue?.state || "",
    stateCode: defaultValue?.stateCode || "",
    city: defaultValue?.city || "",
    pinCode: defaultValue?.pinCode || "",
  };

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    defaultValues: initialFormValues,
    mode: "onChange",
  });

  const selectedState = watch("state");
  const selectedCity = watch("city");
  const selectedPinCode = watch("pinCode");

  function onFormSubmit(data: LocationFormValues) {
    const matchedState = getIndiaStateByNameOrCode(data.state);
    const locationVal: LocationValue = {
      country: "India",
      countryCode: "IN",
      state: matchedState?.name || data.state,
      stateCode: matchedState?.code || data.stateCode || "",
      city: data.city,
      pinCode: data.pinCode,
    };
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("nxbazaar_user_location", JSON.stringify(locationVal));
      } catch (e) {
        console.error(e);
      }
    }
    if (onSubmit) {
      onSubmit(locationVal);
    } else {
      toast.success(`Delivery location set: ${locationVal.city}, ${locationVal.state} (${locationVal.pinCode})`);
    }
  }

  function handleAutoLocationDetected(loc: {
    state: string;
    stateCode: string;
    city: string;
    pinCode: string;
  }) {
    if (loc.state) {
      setValue("state", loc.state, { shouldValidate: true, shouldDirty: true });
      setValue("stateCode", loc.stateCode, { shouldValidate: true });
    }
    if (loc.city) {
      setValue("city", loc.city, { shouldValidate: true, shouldDirty: true });
    }
    if (loc.pinCode) {
      setValue("pinCode", loc.pinCode, { shouldValidate: true, shouldDirty: true });
    }
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Country (Read-only) */}
      <CountryField />

      {/* State Combobox */}
      <Controller
        name="state"
        control={control}
        render={({ field }) => (
          <StateCombobox
            value={field.value}
            onChange={(stateName, stateCode) => {
              field.onChange(stateName);
              setValue("stateCode", stateCode);
              // Reset city on state change as required
              setValue("city", "", { shouldValidate: true });
            }}
            error={errors.state?.message}
          />
        )}
      />

      {/* City Combobox */}
      <Controller
        name="city"
        control={control}
        render={({ field }) => (
          <CityCombobox
            state={selectedState}
            value={field.value}
            onChange={(cityName) => field.onChange(cityName)}
            error={errors.city?.message}
          />
        )}
      />

      {/* PIN Code */}
      <Controller
        name="pinCode"
        control={control}
        render={({ field }) => (
          <PinCodeInput
            value={field.value}
            onChange={(pin) => field.onChange(pin)}
            error={errors.pinCode?.message}
          />
        )}
      />

      {/* Use Current Location Button */}
      {showCurrentLocation && (
        <div className="pt-1">
          <UseCurrentLocationButton onLocationDetected={handleAutoLocationDetected} />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-white/20 dark:border-white/10">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/40 bg-white/40 hover:bg-white/60 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          <span>Continue</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
