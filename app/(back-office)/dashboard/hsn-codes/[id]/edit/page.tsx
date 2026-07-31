import HsnCodeForm from "@/components/back-office/hsn/HsnCodeForm";
import { getHsnCodeById } from "@/actions/hsn-code";
export default async function EditHsnCodePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const result = await getHsnCodeById(id); if (!result.success) return <div className="p-6">{result.message}</div>; return <HsnCodeForm initialData={result.data} />;
}
