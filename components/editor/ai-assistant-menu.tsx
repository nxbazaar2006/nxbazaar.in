"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Languages,
  Wand2,
  CheckCheck,
  Minimize2,
  Maximize2,
  ListOrdered,
  HelpCircle,
  Search,
  FileText,
  Tag,
  Briefcase,
  ChevronDown,
} from "lucide-react";
import type { ProductAiAction } from "@/lib/ai/product-description-schema";

type AiAssistantMenuProps = {
  disabled?: boolean;
  isProcessing?: boolean;
  onSelectAction: (action: ProductAiAction) => void;
};

export function AiAssistantMenu({
  disabled = false,
  isProcessing = false,
  onSelectAction,
}: AiAssistantMenuProps) {
  const [open, setOpen] = useState(false);

  function handleSelect(action: ProductAiAction) {
    setOpen(false);
    onSelectAction(action);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={disabled || isProcessing}
          className="liquid-glass-control liquid-glass-primary flex items-center gap-2 rounded-full py-1.5 px-4 text-sm font-semibold !text-white hover:opacity-90 disabled:opacity-50 transition"
        >
          <Sparkles className="h-4 w-4 text-purple-300 animate-pulse" />
          <span>{isProcessing ? "AI Working..." : "AI Assistant"}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="liquid-card border-white/20 bg-slate-950/95 text-white min-w-[240px] p-2 rounded-2xl shadow-2xl backdrop-blur-xl z-50 max-h-[80vh] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-purple-300">
          <Sparkles className="h-3.5 w-3.5" />
          <span>AI Content Generation</span>
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleSelect("generate")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Wand2 className="h-4 w-4 text-purple-400" />
            <span>Generate Full Description</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("features")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <ListOrdered className="h-4 w-4 text-amber-400" />
            <span>Generate Key Features</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("faq")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <HelpCircle className="h-4 w-4 text-cyan-400" />
            <span>Generate FAQ Section</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/10 my-1" />

        <DropdownMenuLabel className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
          <Languages className="h-3.5 w-3.5" />
          <span>Smart Translation</span>
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleSelect("translate")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Languages className="h-4 w-4 text-cyan-400" />
            <span>Translate Selected Text</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("translate-full")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Languages className="h-4 w-4 text-cyan-400" />
            <span>Translate Full Description</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("translate-en-hi")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <span className="font-bold text-xs bg-white/15 px-1.5 py-0.5 rounded text-orange-300">HI</span>
            <span>English to Hindi</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("translate-en-mr")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <span className="font-bold text-xs bg-white/15 px-1.5 py-0.5 rounded text-orange-300">MR</span>
            <span>English to Marathi</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/10 my-1" />

        <DropdownMenuLabel className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
          <Wand2 className="h-3.5 w-3.5" />
          <span>Writing Refinements</span>
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleSelect("improve")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-emerald-400" />
            <span>Improve Writing</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("grammar")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <CheckCheck className="h-4 w-4 text-emerald-400" />
            <span>Fix Grammar & Spelling</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("professional")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Briefcase className="h-4 w-4 text-blue-400" />
            <span>Make Professional</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("shorten")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Minimize2 className="h-4 w-4 text-yellow-400" />
            <span>Make Concise (Shorten)</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("expand")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Maximize2 className="h-4 w-4 text-pink-400" />
            <span>Expand Content</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-white/10 my-1" />

        <DropdownMenuLabel className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-300">
          <Search className="h-3.5 w-3.5" />
          <span>SEO Optimization</span>
        </DropdownMenuLabel>

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => handleSelect("seo")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Search className="h-4 w-4 text-orange-400" />
            <span>SEO Optimize Description</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("meta-title")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <FileText className="h-4 w-4 text-orange-400" />
            <span>Generate Meta Title</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("meta-description")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <FileText className="h-4 w-4 text-orange-400" />
            <span>Generate Meta Description</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => handleSelect("keywords")}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-white hover:bg-white/10 cursor-pointer"
          >
            <Tag className="h-4 w-4 text-orange-400" />
            <span>Generate SEO Keywords</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
