"use client";

import { useState, type ComponentProps } from "react";
import { Loader2, Plus, X } from "lucide-react";
import {
  FieldValues,
  Path,
  PathValue,
  useFormContext,
} from "react-hook-form";

import type { ourFileRouter } from "@/app/api/uploadthing/core";
import Image from "next/image";
import { UploadButton, UploadDropzone } from "@/lib/uploadthing";

type OurFileRouter = typeof ourFileRouter;
type UploadEndpoint = keyof OurFileRouter;
type UploadDropzoneComplete = NonNullable<
  ComponentProps<typeof UploadDropzone>["onClientUploadComplete"]
>;
type UploadedFile = Parameters<UploadDropzoneComplete>[0][number];

type SharedImageInputProps = {
  title?: string;
  label?: string;
  endpoint: UploadEndpoint;
  previewSize?: number;
};

type FormImageInputProps<T extends FieldValues> = SharedImageInputProps & {
  name: Path<T>;
  imageUrl?: never;
  setImageUrl?: never;
};

type ControlledImageInputProps = SharedImageInputProps & {
  imageUrl: string;
  setImageUrl: (url: string) => void;
  name?: never;
};

type ImageInputProps<T extends FieldValues> =
  | FormImageInputProps<T>
  | ControlledImageInputProps;

function getStringProperty<T extends object, K extends PropertyKey>(
  value: T | undefined,
  key: K
) {
  if (!value || !(key in value)) {
    return "";
  }

  const propertyValue = value[key as unknown as keyof T];
  return typeof propertyValue === "string" ? propertyValue : "";
}

function getUploadedUrl(file?: UploadedFile) {
  const serverData =
    file &&
    "serverData" in file &&
    file.serverData !== null &&
    typeof file.serverData === "object"
      ? file.serverData
      : undefined;

  return (
    getStringProperty(serverData ?? undefined, "url") ||
    getStringProperty(file, "ufsUrl") ||
    getStringProperty(file, "url")
  );
}

export default function ImageInput<T extends FieldValues>(
  props: ImageInputProps<T>
) {
  if ("imageUrl" in props) {
    return (
      <ImageInputView
        title={props.title}
        endpoint={props.endpoint}
        imageUrl={props.imageUrl}
        previewSize={props.previewSize}
        setImageUrl={props.setImageUrl}
      />
    );
  }

  return <FormImageInput {...props} />;
}

function FormImageInput<T extends FieldValues>({
  title,
  name,
  endpoint,
  previewSize,
}: FormImageInputProps<T>) {
  const form = useFormContext<T>();

  if (!form) {
    throw new Error(
      "ImageInput with a name prop must be rendered inside a react-hook-form FormProvider. Use imageUrl and setImageUrl for controlled mode."
    );
  }

  const imageUrl = String(form.watch(name) ?? "");

  return (
    <ImageInputView
      title={title}
      endpoint={endpoint}
      imageUrl={imageUrl}
      previewSize={previewSize}
      setImageUrl={(url) =>
        form.setValue(name, url as PathValue<T, typeof name>, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        })
      }
    />
  );
}

function ImageInputView({
  title,
  label,
  imageUrl,
  setImageUrl,
  endpoint,
  previewSize = 1000,
}: SharedImageInputProps & {
  imageUrl: string;
  setImageUrl: (url: string) => void;
}) {
  const displayTitle = title || label || "Upload Image";
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUploadComplete = (response: UploadedFile[]) => {
    const nextUrl = getUploadedUrl(response[0]);

    setIsUploading(false);

    if (!nextUrl) {
      setUploadError("Upload completed, but no image URL was returned.");
      return;
    }

    setUploadError(null);
    setImageUrl(nextUrl);
  };

  const handleUploadError = (error: Error) => {
    setIsUploading(false);
    setUploadError(error.message || "Image upload failed. Please try again.");
  };

  return (
    <div className="relative group w-full">
      {/* Floating Gradient Glow (cyan, blue, purple) */}
      <div className="absolute -inset-1.5 rounded-[36px] bg-gradient-to-r from-cyan-500/25 via-blue-500/25 to-purple-600/25 opacity-70 blur-xl transition-all duration-700 group-hover:opacity-100 group-hover:blur-2xl" />

      {/* Liquid Glass Container */}
      <div className="relative space-y-4 rounded-3xl border border-white/25 bg-white/10 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,0.35)] backdrop-blur-2xl transition-all duration-500">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-white tracking-wide">
            {displayTitle}
          </label>
          {uploadError ? (
            <p className="text-xs font-medium text-red-400 animate-pulse">
              {uploadError}
            </p>
          ) : null}
        </div>

        {imageUrl ? (
          <div className="group/preview relative overflow-hidden rounded-3xl border border-white/25 bg-white/10 shadow-2xl backdrop-blur-2xl p-2 transition-all duration-500 hover:scale-[1.01] hover:border-cyan-400/40">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl">
              <Image
                src={imageUrl}
                alt={displayTitle}
                width={previewSize}
                height={previewSize}
                className="h-full w-full object-contain transition-transform duration-700 group-hover/preview:scale-105"
              />
            </div>

            {isUploading ? (
              <div className="absolute inset-0 z-40 flex flex-col items-center justify-center rounded-3xl bg-slate-950/75 backdrop-blur-md gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                <span className="text-xs font-medium text-white/80">Uploading image...</span>
              </div>
            ) : null}

            {/* Frosted Circular Glass Remove (X) Button */}
            <button
              type="button"
              aria-label="Remove uploaded image"
              disabled={isUploading}
              onClick={() => {
                setUploadError(null);
                setImageUrl("");
              }}
              className="absolute right-3 top-3 z-30 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white shadow-xl backdrop-blur-2xl transition-all duration-300 hover:scale-110 hover:border-red-400/70 hover:bg-red-500/80 focus:outline-none focus:ring-2 focus:ring-red-400/50 disabled:pointer-events-none disabled:opacity-50"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Change Image Button */}
            <div
              aria-label="Change uploaded image"
              className="absolute bottom-3 right-3 z-20 rounded-full border border-white/35 bg-slate-950/75 px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_28px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/60 hover:bg-slate-900/95 hover:shadow-[0_14px_34px_rgba(0,0,0,0.6),0_0_25px_rgba(56,189,248,0.35)]"
            >
              <UploadButton
                endpoint={endpoint}
                disabled={isUploading}
                onUploadBegin={() => {
                  setIsUploading(true);
                  setUploadError(null);
                }}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                appearance={{
                  button:
                    "rounded-full bg-transparent px-0 text-sm font-semibold text-white shadow-none hover:bg-transparent disabled:pointer-events-none disabled:opacity-50",
                  allowedContent: "hidden",
                  container: "m-0 p-0",
                }}
                content={{
                  button: "Change Image",
                }}
              />
            </div>
          </div>
        ) : (
          <div
            aria-label="Upload image"
            className="group/dropzone relative overflow-hidden rounded-full sm:rounded-[40px] border-2 border-dashed border-white/25 bg-white/5 p-8 backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/60 hover:bg-white/10 hover:shadow-[0_0_30px_rgba(56,189,248,0.25)] hover:scale-[1.01]"
          >
            {isUploading ? (
              <div className="flex min-h-44 flex-col items-center justify-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                <span className="text-xs font-medium text-white/80">Uploading file...</span>
              </div>
            ) : (
              <UploadDropzone
                endpoint={endpoint}
                onUploadBegin={() => {
                  setIsUploading(true);
                  setUploadError(null);
                }}
                onClientUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                appearance={{
                  container:
                    "border-none bg-transparent p-0 text-white",
                  uploadIcon: "text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)] transition-transform duration-500 group-hover/dropzone:scale-110",
                  label: "text-white font-medium text-sm",
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
                        Choose File
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
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
