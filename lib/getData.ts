import { headers } from "next/headers";

type DynamicServerError = Error & {
  digest?: string;
};

export type LooseApiData = string & LooseApiData[] & {
  [key: string]: LooseApiData;
};

export async function getData<T = LooseApiData>(endpoint: string): Promise<T> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    let reqHeaders: Headers | undefined;
    try {
      reqHeaders = await headers();
    } catch {
      // headers() may throw if called outside a request context
    }

    const cookie = reqHeaders?.get("cookie") || "";
    const response = await fetch(`${baseUrl}/api/${endpoint}`, {
      cache: "no-store",
      headers: {
        ...(cookie ? { cookie } : {}),
      },
    });

    if (!response.ok) {
      console.warn(`getData("${endpoint}") returned HTTP status ${response.status}`);
      return [] as unknown as T;
    }

    return (await response.json()) as T;
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      (error.name === "DynamicServerError" ||
        (error as DynamicServerError).digest === "DYNAMIC_SERVER_USAGE" ||
        error.message.includes("Dynamic server usage"))
    ) {
      throw error;
    }
    console.error(error);
    return [] as unknown as T;
  }
}
