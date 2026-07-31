import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type OnboardingState = {
  currentStep: number;
  onboardingFormData: Record<string, unknown>;
};

const initialState: OnboardingState = {
  currentStep: 1,
  onboardingFormData: {},
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    updateOnboardingFormData: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.onboardingFormData = {
        ...state.onboardingFormData,
        ...action.payload,
      };
    },
  },
});

export const { setCurrentStep, updateOnboardingFormData } = onboardingSlice.actions;
export default onboardingSlice.reducer;