import { createUploadthing } from "uploadthing/next";

const f = createUploadthing();

async function requireUploadSession({ req }: { req: Request }) {
  const { getToken } = await import("next-auth/jwt");
  const token = await getToken({ req: req as never, secret: process.env.AUTH_SECRET });
  if (!token?.id) {
    throw new Error("Unauthorized");
  }
  return { uploadedBy: String(token.id), role: token.role };
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
