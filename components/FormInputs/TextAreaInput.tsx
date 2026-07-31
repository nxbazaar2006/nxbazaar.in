"use client";

import { useMemo, useRef, useState } from "react";
import {
  FieldValues,
  Path,
  RegisterOptions,
  UseFormReturn,
  get,
  useController,
  useFormContext,
} from "react-hook-form";
import { Languages, Mic, MicOff } from "lucide-react";

import TipTapAIEditor from "@/components/editor/TipTapAIEditor";
import { cn } from "@/lib/utils";

type Locale = "en" | "hi" | "mr";

type FeatureToggles = {
  ai?: boolean;
  voice?: boolean;
  language?: boolean;
  editor?: boolean;
};

type SpeechRecognitionEvent = Event & {
  results: SpeechRecognitionResultList;
};

type SpeechRecognitionLike = EventTarget & {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

type Props<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  register?: any;
  errors?: any;
  isRequired?: boolean;
  rules?: RegisterOptions<T, Path<T>>;
  placeholder?: string;
  rows?: number;
  required?: boolean;
  className?: string;
  languageName?: Path<T>;
  defaultLanguage?: Locale;
  aiPrompt?: string;
  aiEndpoint?: string;
  features?: FeatureToggles;
};

const LOCALES: { value: Locale; formValue: string; label: string; speech: string }[] =
  [
    { value: "en", formValue: "EN", label: "English", speech: "en-IN" },
    { value: "hi", formValue: "HI", label: "Hindi", speech: "hi-IN" },
    { value: "mr", formValue: "MR", label: "Marathi", speech: "mr-IN" },
  ];

const DEFAULT_FEATURES: Required<FeatureToggles> = {
  ai: false,
  voice: false,
  language: false,
  editor: false,
};

function siblingPath(path: string, sibling: string) {
  const parts = path.split(".");
  parts[parts.length - 1] = sibling;
  return parts.join(".");
}

function normalizeLocale(value: unknown, fallback: Locale): Locale {
  const locale = String(value ?? fallback).toLowerCase();
  return locale === "hi" || locale === "mr" ? locale : "en";
}

export default function TextareaInput<T extends FieldValues>(props: Props<T>) {
  const formContext = useFormContext<T>();

  if (!formContext) {
    return <StandaloneTextareaInput {...props} />;
  }

  return <HookedTextareaInput {...props} formContext={formContext} />;
}

function HookedTextareaInput<T extends FieldValues>({
  label,
  name,
  rules,
  placeholder,
  rows = 4,
  required = false,
  className,
  languageName,
  defaultLanguage = "en",
  aiPrompt,
  features,
  formContext,
}: Props<T> & { formContext: UseFormReturn<T> }) {
  const enabled = { ...DEFAULT_FEATURES, ...features };
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = formContext;
  const { field } = useController({
    name,
    control,
    rules,
    defaultValue: "" as never,
  });
  const resolvedLanguageName = useMemo(
    () => languageName ?? (siblingPath(name, "locale") as Path<T>),
    [languageName, name]
  );
  const watchedLanguage = watch(resolvedLanguageName);
  const locale = normalizeLocale(watchedLanguage, defaultLanguage);
  const localeConfig = LOCALES.find((item) => item.value === locale) ?? LOCALES[0];
  const value = typeof field.value === "string" ? field.value : "";
  const error = get(errors, name);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const resolvedPlaceholder =
    placeholder ??
    (label.toLowerCase().includes("description")
      ? "Write a clear ecommerce description"
      : undefined);

  function updateValue(nextValue: string) {
    field.onChange(nextValue);
    setValue(name, nextValue as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function handleLanguageChange(nextLocale: Locale) {
    const next = LOCALES.find((item) => item.value === nextLocale) ?? LOCALES[0];
    setValue(resolvedLanguageName, next.formValue as never, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  }

  function handleVoice() {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ?? window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = localeConfig.speech;
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();

      if (transcript) {
        updateValue([value, transcript].filter(Boolean).join(" "));
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  }

  return (
    <div className={cn("space-y-2", className)}>
      <TextareaHeader
        label={label}
        required={required}
        languageEnabled={enabled.language}
        voiceEnabled={enabled.voice}
        locale={locale}
        isListening={isListening}
        onLanguageChange={handleLanguageChange}
        onVoice={handleVoice}
      />

      {enabled.editor ? (
        <TipTapAIEditor
          value={value}
          onChange={updateValue}
          productTitle={aiPrompt}
          disabled={field.disabled}
        />
      ) : (
        <textarea
          {...field}
          value={value}
          rows={rows}
          lang={locale}
          placeholder={resolvedPlaceholder}
          onChange={(event) => updateValue(event.target.value)}
          className={textareaClass(Boolean(error))}
        />
      )}

      {error ? (
        <p className="mt-1 text-xs text-red-500">
          {String(error.message ?? "This field is required")}
        </p>
      ) : null}
    </div>
  );
}

function StandaloneTextareaInput<T extends FieldValues>({
  label,
  name,
  placeholder,
  rows = 4,
  required = false,
  className,
  aiPrompt,
  features,
}: Props<T>) {
  const enabled = { ...DEFAULT_FEATURES, ...features };
  const [value, setValue] = useState("");
  const resolvedPlaceholder =
    placeholder ??
    (label.toLowerCase().includes("description")
      ? "Write a clear ecommerce description"
      : undefined);

  return (
    <div className={cn("space-y-2", className)}>
      <TextareaHeader
        label={label}
        required={required}
        languageEnabled={false}
        voiceEnabled={false}
        locale="en"
        isListening={false}
        onLanguageChange={() => undefined}
        onVoice={() => undefined}
      />

      {enabled.editor ? (
        <>
          <TipTapAIEditor value={value} onChange={setValue} productTitle={aiPrompt} />
          <input type="hidden" name={String(name)} value={value} />
        </>
      ) : (
        <textarea
          name={String(name)}
          value={value}
          rows={rows}
          placeholder={resolvedPlaceholder}
          onChange={(event) => setValue(event.target.value)}
          className={textareaClass(false)}
        />
      )}
    </div>
  );
}

function TextareaHeader({
  label,
  required,
  languageEnabled,
  voiceEnabled,
  locale,
  isListening,
  onLanguageChange,
  onVoice,
}: {
  label: string;
  required: boolean;
  languageEnabled: boolean;
  voiceEnabled: boolean;
  locale: Locale;
  isListening: boolean;
  onLanguageChange: (locale: Locale) => void;
  onVoice: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <label className="text-sm font-medium text-white">
        {label} {required ? <span className="text-red-400">*</span> : null}
      </label>

      <div className="flex flex-wrap items-center gap-2">
        {languageEnabled ? (
          <label className="inline-flex items-center gap-1 rounded-2xl border border-white/20 px-2 py-1 text-xs text-white shadow-sm bg-white/10">
            <Languages className="h-3.5 w-3.5" aria-hidden="true" />
            <select
              value={locale}
              onChange={(event) => onLanguageChange(event.target.value as Locale)}
              className="bg-transparent text-white outline-none"
              aria-label={`${label} language`}
            >
              {LOCALES.map((item) => (
                <option key={item.value} value={item.value} className="bg-slate-900 text-white">
                  {item.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {voiceEnabled ? (
          <button
            type="button"
            onClick={onVoice}
            className={cn(
              "inline-flex items-center gap-1 rounded-2xl border px-2 py-1 text-xs shadow-sm transition",
              isListening
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-white/20 text-white bg-white/10 hover:bg-white/20"
            )}
          >
            {isListening ? (
              <MicOff className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Mic className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            Voice
          </button>
        ) : null}
      </div>
    </div>
  );
}

function textareaClass(hasError: boolean) {
  return cn(
    "liquid-card w-full resize-none rounded-2xl border-0 px-4 py-3 text-white shadow-sm outline-none transition-all duration-300 ease-in-out placeholder:text-white/55 hover:shadow-md",
    hasError
      ? "ring-2 ring-red-500"
      : "focus:ring-2 focus:ring-inset focus:ring-white/45"
  );
}
