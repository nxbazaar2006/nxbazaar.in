"use client";

import { getCurrentCoordinates } from "@/lib/location/geolocation";
import { fetchReverseGeocode } from "@/lib/location/reverse-geocode";
import { LocateFixed, LoaderCircle } from "lucide-react";
import React, { useState } from "react";
import toast from "react-hot-toast";

type UseCurrentLocationButtonProps = {
  onLocationDetected: (location: {
    state: string;
    stateCode: string;
    city: string;
    pinCode: string;
  }) => void;
  disabled?: boolean;
};

export function UseCurrentLocationButton({
  onLocationDetected,
  disabled = false,
}: UseCurrentLocationButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleDetectLocation() {
    if (loading || disabled) return;
    setLoading(true);

    try {
      toast.loading("Detecting your current location...", { id: "geo-toast" });

      const coords = await getCurrentCoordinates();
      const result = await fetchReverseGeocode(coords.latitude, coords.longitude);

      if (!result.state && !result.city) {
        throw new Error("Could not map your location to an Indian state/city.");
      }

      onLocationDetected({
        state: result.state || "",
        stateCode: result.stateCode || "",
        city: result.city || "",
        pinCode: result.pinCode || "",
      });

      toast.success(
        `Location set: ${result.city ? `${result.city}, ` : ""}${result.state || "India"}`,
        { id: "geo-toast" }
      );
    } catch (error) {
      console.error("Location detection error:", error);
      const msg = error instanceof Error ? error.message : "Failed to detect location.";
      toast.error(msg, { id: "geo-toast" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={loading || disabled}
      onClick={handleDetectLocation}
      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-500/20 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 dark:border-cyan-400/30 dark:bg-cyan-400/15 dark:text-cyan-300 dark:hover:bg-cyan-400/25 transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
    >
      {loading ? (
        <>
          <LoaderCircle className="h-4 w-4 animate-spin text-cyan-600 dark:text-cyan-400" />
          <span>Detecting Location...</span>
        </>
      ) : (
        <>
          <LocateFixed className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span>Use Current Location</span>
        </>
      )}
    </button>
  );
}
