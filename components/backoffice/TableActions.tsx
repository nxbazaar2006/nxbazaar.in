import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import { LiquidGlassInput } from "@/components/ui/liquid-glass-input";
import React from "react";
import { Download, Search, Trash2 } from "lucide-react";
export default function TableActions() { return ( <div className="flex justify-between py-6 px-12 bg-white rounded-lg items-center gap-8 "> <LiquidGlassButton variant="neutral" leftIcon={<Download />}> Export </LiquidGlassButton> {/* sEARCH */} <div className="flex-grow "> <label htmlFor="table-search" className="sr-only"> Search </label> <LiquidGlassInput type="text" id="table-search" placeholder="Search for items" leftIcon={<Search />} /> </div> {/* dELETE */} <LiquidGlassButton variant="danger" leftIcon={<Trash2 />}> Bulk Delete </LiquidGlassButton> </div> ); } 