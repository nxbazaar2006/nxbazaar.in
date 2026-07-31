// Create the Store

import { configureStore } from "@reduxjs/toolkit";
import cartSlice from "./slices/cartSlice";
import checkoutSlice from "./slices/checkoutSlice";
import languageSlice from "./slices/languageSlice";
import onboardingSlice from "./slices/onboardingSlice";

export const store = configureStore({
  reducer: {
    // Slices go here
    cart: cartSlice,
    checkout: checkoutSlice,
    language: languageSlice,
    onboarding: onboardingSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
