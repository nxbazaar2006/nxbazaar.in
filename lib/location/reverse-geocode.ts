import type { ReverseGeocodeResult } from "@/types/location";

export async function fetchReverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult> {
  const res = await fetch(`/api/location/reverse-geocode?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`);
  const data = await res.json();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || "Reverse geocoding failed.");
  }
  return data;
}
