import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  defaultLanguage,
  normalizeLanguage,
  type LanguageCode,
} from "@/lib/i18n/languages";

export type LanguageState = {
  currentLanguage: LanguageCode;
};

const initialState: LanguageState = {
  currentLanguage: defaultLanguage,
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<LanguageCode | string>) => {
      state.currentLanguage = normalizeLanguage(action.payload);
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
