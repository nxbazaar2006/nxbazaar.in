"use client";

import { UploadButton } from "@/lib/uploadthing";
import { useState } from "react";
import type { ourFileRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";
import { Loader2, Plus, X } from "lucide-react";

import {
  FieldValues,
  Path,
  PathValue,
  useController,
  useFormContext,
} from "react-hook-form";

type OurFileRouter = typeof ourFileRouter;

type UploadResponseItem = {
  ufsUrl?: string;
  url?: string;
  serverData?: { url?: string };
};

type ImageItem = {
  url: string;
  isPrimary?: boolean;
};

type SharedProps = {
  label: string;
  endpoint: keyof OurFileRouter;
};

type HookedProps<T extends FieldValues> = SharedProps & {
  name: Path<T>;
  imageUrls?: never;
  setImageUrls?: never;
};

type ControlledProps = SharedProps & {
  imageUrls: string[];
  setImageUrls: (urls: string[]) => void;
  name?: never;
};

type MultipleImageInputProps<T extends FieldValues> =
  | HookedProps<T>
  | ControlledProps;

function splitImageUrlValue(value: string): string[] {
  return value.split(/[;,|]/).map((url) => url.trim()).filter(Boolean);
}

function normalizeImageItems(values: Array<string | ImageItem>): ImageItem[] {
  return values.flatMap((item) => {
    if (typeof item === "string") {
      return splitImageUrlValue(item).map((url) => ({ url }));
    }

    return splitImageUrlValue(item.url).map((url) => ({ ...item, url }));
  }).map((item, index) => ({
    ...item,
    isPrimary: index === 0,
  }));
}

export default function MultipleImageInput<T extends FieldValues>(
  props: MultipleImageInputProps<T>
) {
  if ("imageUrls" in props && props.imageUrls !== undefined) {
    const images = normalizeImageItems(props.imageUrls);

    return (
      <MultipleImageInputView
        label={props.label}
        endpoint={props.endpoint}
        images={images}
        onChange={(newImages) => {
          props.setImageUrls(newImages.map((img) => img.url));
        }}
      />
    );
  }

  return <FormMultipleImageInput {...(props as HookedProps<T>)} />;
}

function FormMultipleImageInput<T extends FieldValues>({
  label,
  name,
  endpoint,
}: HookedProps<T>) {
  const formContext = useFormContext<T>();

  if (!formContext) {
    return (
      <StandaloneMultipleImageInput
        label={label}
        name={String(name)}
        endpoint={endpoint}
      />
    );
  }

  return (
    <HookedMultipleImageInput
      label={label}
      name={name}
      endpoint={endpoint}
      control={formContext.control}
    />
  );
}

function HookedMultipleImageInput<T extends FieldValues>({
  label,
  name,
  endpoint,
  control,
}: HookedProps<T> & { control: ReturnType<typeof useFormContext<T>>["control"] }) {
  const { field } = useController({
    name,
    control,
    defaultValue: [] as PathValue<T, Path<T>>,
  });

  const rawValues = Array.isArray(field.value) ? field.value : [];
  const images = normalizeImageItems(rawValues);

  return (
    <MultipleImageInputView
      label={label}
      endpoint={endpoint}
      images={images}
      onChange={(updated) => field.onChange(updated)}
    />
  );
}

function StandaloneMultipleImageInput({
  label,
  name,
  endpoint,
}: {
  label: string;
  name: string;
  endpoint: keyof OurFileRouter;
}) {
  const [images, setImages] = useState<ImageItem[]>([]);

  return (
    <>
      <MultipleImageInputView
        label={label}
        endpoint={endpoint}
        images={images}
        onChange={setImages}
      />
      <input type="hidden" name={name} value={JSON.stringify(images)} />
    </>
  );
}

function MultipleImageInputView({
  label,
  endpoint,
  images,
  onChange,
}: {
  label: string;
  endpoint: keyof OurFileRouter;
  images: ImageItem[];
  onChange: (images: ImageItem[]) => void;
}) {
  const [loading, setLoading] = useState(false);

  function removeImage(index: number) {
    const updated = images.filter((_, i) => i !== index);

    onChange(
      updated.map((img, i) => ({
        ...img,
        isPrimary: i === 0,
      }))
    );
  }

  function handleUpload(res: unknown[]) {
    const items = (res || []) as UploadResponseItem[];
    const urls = items
      .map((item) => item.serverData?.url ?? item.ufsUrl ?? item.url)
      .filter(Boolean) as string[];

    const updated = [...images, ...urls.map((url) => ({ url }))];

    onChange(
      updated.map((img, i) => ({
        ...img,
        isPrimary: i === 0,
      }))
    );

    setLoading(false);
  }

  return (
    <div className="relative group w-full">
      {/* Floating Gradient Glow (cyan, blue, purple) */}
      <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-purple-600/25 opacity-70 blur-xl transition-all duration-700 group-hover:opacity-100 group-hover:blur-2xl" />

      {/* Liquid Glass Container */}
      <div className="relative space-y-4 rounded-3xl border border-white/25 bg-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.35)] backdrop-blur-2xl transition-all duration-500">
        <label className="block text-sm font-semibold text-white tracking-wide">
          {label}
        </label>

        {images.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, index) => (
              <div
                key={`${img.url}-${index}`}
                className="group/item relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow-xl backdrop-blur-2xl p-1.5 transition-all duration-500 hover:scale-[1.02] hover:border-cyan-400/40"
              >
                <div className="relative h-40 w-full overflow-hidden rounded-2xl">
                  <Image
                    src={img.url}
                    alt={`Image ${index + 1}`}
                    width={1000}
                    height={667}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover/item:scale-105"
                  />
                </div>

                {/* Frosted Circular Glass Remove Button */}
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => removeImage(index)}
                  className="absolute right-2 top-2 z-30 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-110 hover:border-red-400/70 hover:bg-red-500/80 focus:outline-none focus:ring-2 focus:ring-red-400/50"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>

                {img.isPrimary ? (
                  <span className="absolute bottom-2 left-2 z-30 rounded-full border border-white/30 bg-cyan-500/30 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-2xl shadow-lg">
                    Primary
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        <div className="group/dropzone relative overflow-hidden rounded-full sm:rounded-[40px] border-2 border-dashed border-white/25 bg-white/5 p-6 backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/60 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:scale-[1.01]">
          {loading ? (
            <div className="flex min-h-24 items-center justify-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-cyan-400" />
              <span className="text-xs font-medium text-white/80">Uploading files...</span>
            </div>
          ) : (
            <UploadButton
              endpoint={endpoint as any}
              disabled={loading}
              appearance={{
                container: "border-none bg-transparent m-0 p-0 text-white",
                allowedContent: "text-white/60 text-xs",
                button:
                  "liquid-glass-control liquid-glass-primary flex min-h-12 min-w-[240px] sm:min-w-[320px] shrink-0 items-center justify-between gap-3 rounded-full py-1.5 pl-6 pr-1.5 " +
                  "font-semibold !text-white [&_*]:!text-white [&_svg]:!stroke-white cursor-pointer",
              }}
              content={{
                button: (
                  <>
                    <span className="liquid-glass-inner pointer-events-none" aria-hidden="true" />
                    <span className="liquid-glass-content min-w-0 flex-1 py-1.5 pr-2 text-center text-sm font-semibold text-white tracking-wide">
                      Choose File(s)
                    </span>
                    <span
                      className="liquid-glass-content pointer-events-none grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/25 bg-white/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.42),inset_0_-1px_0_rgba(0,0,0,0.42),0_0_18px_rgba(99,102,241,0.36)]"
                      aria-hidden="true"
                    >
                      <Plus className="h-4 w-4 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.65)]" />
                    </span>
                  </>
                ),
              }}
              onUploadBegin={() => setLoading(true)}
              onClientUploadComplete={handleUpload}
              onUploadError={(err: Error) => {
                console.error(err);
                setLoading(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
