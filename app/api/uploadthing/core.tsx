import { createUploadthing } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

import { auth } from "@/auth";

async function requireUploadSession() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UploadThingError({
      code: "FORBIDDEN",
      message: "Please sign in before uploading files.",
    });
  }
  return { uploadedBy: String(session.user.id), role: session.user.role };
}

const onComplete = async ({ metadata }) => {
  return { uploadedBy: metadata.uploadedBy };
};

export const ourFileRouter = {
  categoryImageUploader: f({ image: { maxFileSize: "1MB" } }).middleware(requireUploadSession).onUploadComplete(onComplete),
  bannerImageUploader: f({ image: { maxFileSize: "2MB" } }).middleware(requireUploadSession).onUploadComplete(onComplete),
  marketLogoUploader: f({ image: { maxFileSize: "1MB" } }).middleware(requireUploadSession).onUploadComplete(onComplete),
  productImageUploader: f({ image: { maxFileSize: "1MB" } }).middleware(requireUploadSession).onUploadComplete(onComplete),
  trainingImageUploader: f({ image: { maxFileSize: "1MB" } }).middleware(requireUploadSession).onUploadComplete(onComplete),
  farmerProfileUploader: f({ image: { maxFileSize: "1MB" } }).middleware(requireUploadSession).onUploadComplete(onComplete),
  customerProfileUploader: f({ image: { maxFileSize: "1MB" } }).middleware(requireUploadSession).onUploadComplete(onComplete),
  multipleProductsUploader: f({ image: { maxFileSize: "8MB", maxFileCount: 4 } }).middleware(requireUploadSession).onUploadComplete(onComplete),
};
