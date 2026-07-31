export const INDIAN_PIN_CODE_REGEX = /^[1-9][0-9]{5}$/;

/**
 * First digit of Indian Postal Index Number (PIN) region mapping:
 * 1: Northern Region (Delhi, Haryana, Punjab, Himachal Pradesh, Jammu & Kashmir, Chandigarh)
 * 2: Northern Region (Uttar Pradesh, Uttarakhand)
 * 3: Western Region (Rajasthan, Gujarat, Daman & Diu, Dadra & Nagar Haveli)
 * 4: Western Region (Maharashtra, Goa, Madhya Pradesh, Chhattisgarh)
 * 5: Southern Region (Andhra Pradesh, Telangana, Karnataka)
 * 6: Southern Region (Tamil Nadu, Kerala, Puducherry, Lakshadweep)
 * 7: Eastern Region (West Bengal, Odisha, Arunachal Pradesh, Assam, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, Tripura, Andaman & Nicobar)
 * 8: Eastern Region (Bihar, Jharkhand)
 */
export function sanitizePinCodeInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 6);
}

export function isValidIndianPinCode(value: string): boolean {
  return INDIAN_PIN_CODE_REGEX.test(value);
}
