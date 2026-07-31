"use client";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { LiquidGlassInput } from "@/components/ui/liquid-glass-input";
import { DoorOpen, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "@/hooks/useTranslation";
export default function SearchForm() { const { register, handleSubmit, reset } = useForm(); const router = useRouter(); const { t } = useTranslation(); function handleSearch(data) { const { searchTerm } = data; reset(); router.push(`/search?search=${searchTerm}`); } return ( <form onSubmit={handleSubmit(handleSearch)} className="flex items-center"> <label htmlFor="voice-search" className="sr-only"> Search </label> <LiquidGlassInput {...register("searchTerm")} type="text" id="voice-search" leftIcon={<DoorOpen />} wrapperClassName="w-full" placeholder={t("navbar.searchPlaceholder")} required /> <LiquidGlassButton type="submit" variant="cyan" leftIcon={<Search />} className="ms-2" > Search </LiquidGlassButton> </form> );
}
