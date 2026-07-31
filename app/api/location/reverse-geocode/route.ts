import { getIndiaStateByNameOrCode } from "@/lib/india/states";
import { isValidIndianPinCode, sanitizePinCodeInput } from "@/lib/india/pin-code";
import type { ReverseGeocodeResult } from "@/types/location";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng") || searchParams.get("lon");

    if (!lat || !lng) {
      return NextResponse.json<ReverseGeocodeResult>(
        { success: false, message: "Latitude and Longitude parameters are required." },
        { status: 400 }
      );
    }

    const apiUrl = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&addressdetails=1`;

    const res = await fetch(apiUrl, {
      headers: {
        "User-Agent": "NXBazaar-Ecommerce/1.0 (https://nxbazaar.in)",
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json<ReverseGeocodeResult>(
        { success: false, message: "Failed to reverse geocode location." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const address = data?.address || {};

    const rawState = address.state || address.region || address.state_district || "";
    const matchedState = getIndiaStateByNameOrCode(rawState);

    const state = matchedState?.name || rawState;
    const stateCode = matchedState?.code || "";

    const rawCity =
      address.city ||
      address.town ||
      address.suburb ||
      address.village ||
      address.municipality ||
      address.county ||
      "";

    let city = rawCity;
    if (matchedState?.cities?.length) {
      const foundCity = matchedState.cities.find(
        (c) => c.toLowerCase() === rawCity.toLowerCase() || rawCity.toLowerCase().includes(c.toLowerCase())
      );
      if (foundCity) city = foundCity;
    }

    const rawPostcode = sanitizePinCodeInput(String(address.postcode || ""));
    const pinCode = isValidIndianPinCode(rawPostcode) ? rawPostcode : "";

    return NextResponse.json<ReverseGeocodeResult>({
      success: true,
      country: "India",
      countryCode: "IN",
      state,
      stateCode,
      city,
      pinCode,
      formattedAddress: data.display_name,
    });
  } catch (error) {
    console.error("Reverse geocode handler error:", error);
    return NextResponse.json<ReverseGeocodeResult>(
      { success: false, message: "An error occurred during location detection." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { latitude?: number; longitude?: number; lat?: number; lng?: number };
    const lat = body.latitude ?? body.lat;
    const lng = body.longitude ?? body.lng;

    if (lat === undefined || lng === undefined) {
      return NextResponse.json<ReverseGeocodeResult>(
        { success: false, message: "Latitude and Longitude are required." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lng", String(lng));

    return GET(new Request(url.toString(), { headers: request.headers }));
  } catch (error) {
    return NextResponse.json<ReverseGeocodeResult>(
      { success: false, message: "Invalid payload." },
      { status: 400 }
    );
  }
}
