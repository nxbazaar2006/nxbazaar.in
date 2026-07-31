"use server"; import db from "@/lib/db";
import { enqueueTranslationJobs } from "@/lib/queues/translation-job-service";
import { getTranslationQueue } from "@/lib/queues/translation-queue";
import { revalidatePath } from "next/cache"; const dashboardPath = "/dashboard/translation-jobs";
export async function retryTranslationJob(formData: FormData) { const id = String(formData.get("id") ?? ""); const job = await db.translationJob.findUnique({ where: { id } }); if (!job) return; await enqueueTranslationJobs({ entityType: job.entityType, entityId: job.entityId, sourceHash: job.sourceHash, targetLanguages: [job.targetLanguage === "mr" ? "mr" : "hi"], forceRetranslate: true, requestedByUserId: job.requestedById ?? undefined, }); revalidatePath(dashboardPath);
}
export async function regenerateTranslationJob(formData: FormData) { await retryTranslationJob(formData);
}
export async function cancelTranslationJob(formData: FormData) { const id = String(formData.get("id") ?? ""); const job = await db.translationJob.findUnique({ where: { id } }); if (!job) return; if (job.queueJobId) { const queueJob = await getTranslationQueue().getJob(job.queueJobId); await queueJob?.remove(); } await db.translationJob.update({ where: { id }, data: { status: "SKIPPED", errorCode: "CANCELLED", errorMessage: "Cancelled by admin.", completedAt: new Date(), }, }); revalidatePath(dashboardPath);
}
