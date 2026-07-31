import toast from "react-hot-toast";

type LoadingSetter = (loading: boolean) => void;
type FormReset = () => void;
type RedirectHandler = () => void;

async function readResponseMessage(response: Response, fallback: string) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const responseData = (await response.json().catch(() => null)) as { message?: unknown; error?: unknown } | null;
    if (typeof responseData?.message === "string" && responseData.message.trim()) return responseData.message;
    if (typeof responseData?.error === "string" && responseData.error.trim()) return responseData.error;
  }

  const text = await response.text().catch(() => "");
  return text.trim() || fallback;
}

export async function makePostRequest(
  setLoading: LoadingSetter,
  endpoint: string,
  data: unknown,
  resourceName: string,
  reset?: FormReset,
  redirect?: RedirectHandler
) {
  try {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setLoading(false);
      toast.success(`New ${resourceName} Created Successfully`);
      reset?.();
      redirect?.();
    } else {
      setLoading(false);
      const message = await readResponseMessage(response, "Something went wrong, please try again.");
      if (response.status === 409) {
        toast.error(message);
      } else {
        toast.error(message);
      }
    }
  } catch (error) {
    setLoading(false);
    toast.error(error instanceof Error ? error.message : "Something went wrong, please try again.");
  }
}

export async function makePutRequest(
  setLoading: LoadingSetter,
  endpoint: string,
  data: unknown,
  resourceName: string,
  redirect?: RedirectHandler,
  reset?: FormReset
) {
  try {
    setLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const response = await fetch(`${baseUrl}/${endpoint}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      setLoading(false);
      toast.success(`${resourceName} Updated Successfully`);
      reset?.();
      redirect?.();
    } else {
      setLoading(false);
      const message = await readResponseMessage(response, "Something went wrong, please try again.");
      toast.error(message);
    }
  } catch (error) {
    setLoading(false);
    toast.error(error instanceof Error ? error.message : "Something went wrong, please try again.");
  }
}
