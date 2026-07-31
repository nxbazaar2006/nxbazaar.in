import { setCurrentStep } from "@/redux/slices/checkoutSlice";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react"; import { useDispatch, useSelector } from "react-redux"; import type { RootState } from "@/redux/store";
export default function NavButtons() { const currentStep = useSelector((store: RootState) => store.checkout.currentStep); const dispatch = useDispatch(); function handlePrevious() { dispatch(setCurrentStep(currentStep - 1)); } return ( <div className="flex justify-between items-center"> {currentStep > 1 && ( <LiquidGlassButton onClick={handlePrevious} type="button" variant="neutral" leftIcon={<ChevronLeft />} className="mt-4 sm:mt-6" > <span>Previous</span> </LiquidGlassButton> )} <LiquidGlassButton type="submit" variant="success" rightIcon={<ChevronRight />} className="mt-4 sm:mt-6" > <span>Next</span> </LiquidGlassButton> </div> );
}
