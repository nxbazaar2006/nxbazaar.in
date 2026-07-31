import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type CheckoutState = {
  currentStep: number;
  checkoutFormData: Record<string, unknown>;
};

const initialState: CheckoutState = {
  currentStep: 1,
  checkoutFormData: {},
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateCheckoutFormData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.checkoutFormData = {
        ...state.checkoutFormData,
        ...action.payload,
      };
    },
  },
});

export const { setCurrentStep, updateCheckoutFormData } = checkoutSlice.actions;
export default checkoutSlice.reducer;