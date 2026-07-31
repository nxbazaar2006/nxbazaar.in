export type IndiaState = {
  code: string;
  name: string;
  type: "STATE" | "UNION_TERRITORY";
  cities: string[];
};

export type LocationValue = {
  country: "India";
  countryCode: "IN";
  state: string;
  stateCode: string;
  city: string;
  pinCode: string;
};

export type ReverseGeocodeResult = {
  success: boolean;
  country?: string;
  countryCode?: string;
  state?: string;
  stateCode?: string;
  city?: string;
  pinCode?: string;
  formattedAddress?: string;
  message?: string;
  error?: string;
};

export type LocationSelectorProps = {
  defaultValue?: Partial<LocationValue>;
  onSubmit?: (value: LocationValue) => void;
  onCancel?: () => void;
  showCurrentLocation?: boolean;
  className?: string;
};
