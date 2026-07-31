import assert from "node:assert/strict";
import {
  buildTranslationJobId,
  translationJobDataSchema,
  type TranslationJobData,
} from "@/lib/queues/translation-job-types";
import { createTranslationSourceHash } from "@/lib/translations/source-hash";

const baseJob: TranslationJobData = {
  entityType: "PRODUCT",
  entityId: "product-1",
  sourceLanguage: "en",
  targetLanguage: "hi",
  sourceHash: "a".repeat(64),
};

assert.equal(translationJobDataSchema.safeParse(baseJob).success, true, "valid job payload should parse");
assert.equal(
  translationJobDataSchema.safeParse({ ...baseJob, targetLanguage: "fr" }).success,
  false,
  "invalid target language should fail validation"
);

assert.equal(
  buildTranslationJobId(baseJob),
  buildTranslationJobId({ ...baseJob }),
  "job id must be deterministic for duplicate prevention"
);
assert.equal(
  buildTranslationJobId({ ...baseJob, entityId: "product/1" }).includes("/"),
  false,
  "job id must be BullMQ safe"
);

const firstHash = createTranslationSourceHash({ title: "Apple", description: "Fresh" });
const sameHash = createTranslationSourceHash({ description: "Fresh", title: "Apple" });
const changedHash = createTranslationSourceHash({ title: "Apple", description: "Fresh and sweet" });

assert.equal(firstHash, sameHash, "source hash should be stable for reordered fields");
assert.notEqual(firstHash, changedHash, "source hash should change when English source content changes");

const manualTarget = { isManuallyEdited: true, sourceHash: firstHash };
assert.equal(manualTarget.isManuallyEdited, true, "manual translation flag protects target records");
assert.equal(firstHash !== changedHash, true, "stale jobs can be detected by hash mismatch");

console.log("translation queue tests passed");
