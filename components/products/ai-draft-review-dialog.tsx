"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

type AiDraftField = "title" | "description" | "tags" | "aiMetadata";

type AiDraftValues = {
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  aiMetadata?: Record<string, unknown> | null;
};

type FieldState = {
  selected: boolean;
  value: string;
};

type AiDraftReviewDialogProps = {
  open: boolean;
  productId: string;
  existing: AiDraftValues;
  draft: AiDraftValues;
  onClose: () => void;
  onApplied?: () => void;
};

const FIELD_LABELS: Record<AiDraftField, string> = {
  title: "Title",
  description: "Description",
  tags: "Tags",
  aiMetadata: "AI metadata",
};

const FIELDS: AiDraftField[] = ["title", "description", "tags", "aiMetadata"];

function serializeValue(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return String(value ?? "");
}

function parseValue(field: AiDraftField, value: string) {
  if (field === "tags") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  if (field === "aiMetadata") {
    return value.trim() ? JSON.parse(value) : null;
  }

  return value;
}

export function AiDraftReviewDialog({
  open,
  productId,
  existing,
  draft,
  onClose,
  onApplied,
}: AiDraftReviewDialogProps) {
  const initialFields = useMemo(
    () =>
      FIELDS.reduce(
        (acc, field) => ({
          ...acc,
          [field]: {
            selected: draft[field] !== undefined,
            value: serializeValue(draft[field]),
          },
        }),
        {} as Record<AiDraftField, FieldState>
      ),
    [draft]
  );
  const [fields, setFields] =
    useState<Record<AiDraftField, FieldState>>(initialFields);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setFields(initialFields);
      setError(null);
    }
  }, [initialFields, open]);

  if (!open) return null;

  function updateField(field: AiDraftField, patch: Partial<FieldState>) {
    setFields((current) => ({
      ...current,
      [field]: {
        ...current[field],
        ...patch,
      },
    }));
  }

  function apply(selectedFields: AiDraftField[]) {
    if (selectedFields.length === 0) {
      setError("Select at least one field.");
      return;
    }

    const confirmed = window.confirm(
      "Selected existing product fields will be replaced by the AI draft."
    );

    if (!confirmed) return;

    startTransition(async () => {
      try {
        setError(null);
        const values = Object.fromEntries(
          selectedFields.map((field) => [
            field,
            parseValue(field, fields[field].value),
          ])
        );

        const response = await fetch(`/api/products/${productId}/ai-draft/apply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fields: selectedFields,
            values,
          }),
        });
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error ?? "Failed to apply AI draft.");
        }

        onApplied?.();
        onClose();
      } catch (applyError) {
        setError(
          applyError instanceof Error
            ? applyError.message
            : "Failed to apply AI draft."
        );
      }
    });
  }

  const selectedFields = FIELDS.filter((field) => fields[field].selected);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-xl border bg-background p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Review AI Draft</h2>
            <p className="text-sm text-muted-foreground">
              Select and edit only the fields you want to replace.
            </p>
          </div>
          <button type="button" className="text-sm" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          {FIELDS.map((field) => (
            <section key={field} className="rounded-lg border p-4">
              <label className="mb-3 flex items-center gap-3 font-medium">
                <input
                  type="checkbox"
                  checked={fields[field].selected}
                  onChange={(event) =>
                    updateField(field, { selected: event.target.checked })
                  }
                />
                {FIELD_LABELS[field]}
              </label>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    Existing value
                  </div>
                  <pre className="min-h-28 whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-sm">
                    {serializeValue(existing[field]) || "-"}
                  </pre>
                </div>
                <div>
                  <div className="mb-1 text-xs font-medium text-muted-foreground">
                    AI-generated value
                  </div>
                  <textarea
                    className="min-h-28 w-full rounded-md border bg-background p-3 text-sm"
                    value={fields[field].value}
                    onChange={(event) =>
                      updateField(field, { value: event.target.value })
                    }
                  />
                </div>
              </div>
            </section>
          ))}
        </div>

        {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" className="rounded-md border px-4 py-2" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="rounded-md border px-4 py-2"
            disabled={isPending}
            onClick={() => apply(selectedFields)}
          >
            Apply Selected Fields
          </button>
          <button
            type="button"
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
            disabled={isPending}
            onClick={() => apply(FIELDS)}
          >
            Apply All
          </button>
        </div>
      </div>
    </div>
  );
}
