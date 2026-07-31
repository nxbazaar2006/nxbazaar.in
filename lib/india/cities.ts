import { getIndiaStateByNameOrCode } from "@/lib/india/states";

export function getCitiesByState(stateQuery: string | null | undefined): string[] {
  const state = getIndiaStateByNameOrCode(stateQuery);
  return state ? state.cities : [];
}

export function isValidCityForState(stateQuery: string, cityName: string): boolean {
  const cities = getCitiesByState(stateQuery);
  if (!cities.length) return true; // allow custom city if state unknown
  const normalizedCity = cityName.trim().toLowerCase();
  return cities.some((city) => city.toLowerCase() === normalizedCity);
}
