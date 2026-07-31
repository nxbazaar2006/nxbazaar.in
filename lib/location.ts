import { getIndiaStateByName, INDIAN_STATES } from "@/lib/india";
import type { LocationValue, ReverseGeocodeResult } from "@/types/location";
import { z } from "zod";

export const indianPinCodeRegex = /^[1-9][0-9]{5}$/;

export const locationSchema = z.object({
  country: z.literal("India"),
  state: z.string().trim().min(1, "State is required."),
  city: z.string().trim().min(1, "City is required."),
  pinCode: z
    .string()
    .trim()
    .regex(indianPinCodeRegex, "Enter a valid 6-digit Indian PIN code."),
});

export type LocationFormValues = z.infer<typeof locationSchema>;

export function sanitizePinCode(value: string) {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function isValidIndianPinCode(value: string) {
  return indianPinCodeRegex.test(value);
}

export function normalizeIndianState(value: string | null | undefined) {
  const input = String(value || "").trim().toLowerCase();
  if (!input) return "";
  return (
    INDIAN_STATES.find((state) => {
      const name = state.name.toLowerCase();
      return name === input || name.includes(input) || input.includes(name);
    })?.name ?? ""
  );
}

export function normalizeIndianCity(stateName: string, value: string | null | undefined) {
  const state = getIndiaStateByName(stateName);
  const input = String(value || "").trim().toLowerCase();
  if (!state || !input) return "";
  return (
    state.cities.find((city) => {
      const normalizedCity = city.toLowerCase();
      return normalizedCity === input || normalizedCity.includes(input) || input.includes(normalizedCity);
    }) ?? ""
  );
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 300000,
    });
  });
}

function friendlyGeolocationError(error: unknown) {
  if (typeof GeolocationPositionError !== "undefined" && error instanceof GeolocationPositionError) {
    if (error.code === error.PERMISSION_DENIED) {
      return "Location permission was denied. You can still choose your state, city, and PIN code manually.";
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      return "We could not detect your current location. Please choose your location manually.";
    }
    if (error.code === error.TIMEOUT) {
      return "Location detection timed out. Please try again or enter your location manually.";
    }
  }

  return error instanceof Error ? error.message : "We could not detect your location. Please enter it manually.";
}

export async function reverseGeocodeCurrentLocation(): Promise<ReverseGeocodeResult> {
  try {
    const position = await getBrowserPosition();
    const { latitude, longitude } = position.coords;
    const params = new URLSearchParams({
      format: "jsonv2",
      lat: String(latitude),
      lon: String(longitude),
      addressdetails: "1",
    });
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("Location lookup failed. Please choose your location manually.");
    }

    const data = await response.json();
    const address = data?.address ?? {};
    const state = normalizeIndianState(address.state || address.region || address.state_district);
    const city = normalizeIndianCity(
      state,
      address.city || address.town || address.village || address.suburb || address.county
    );
    const pinCode = sanitizePinCode(String(address.postcode || ""));

    return {
      success: true,
      state,
      city,
      pinCode: isValidIndianPinCode(pinCode) ? pinCode : "",
    };
  } catch (error) {
    throw new Error(friendlyGeolocationError(error));
  }
}

export function toLocationValue(value: Partial<LocationValue>): LocationValue {
  return {
    country: "India",
    countryCode: "IN",
    state: value.state ?? "",
    stateCode: value.stateCode ?? "",
    city: value.city ?? "",
    pinCode: value.pinCode ?? "",
  };
}
