"use client";
import { useState, useTransition } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";
import { deleteHsnCode } from "@/actions/hsn-code";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
export function HsnDeleteDialog({ id, code, trigger,
}: { id: string; code: string; trigger: React.ReactNode;
}) { const router = useRouter(); const [open, setOpen] = useState(false); const [isPending, startTransition] = useTransition(); function handleDelete() { startTransition(async () => { const result = await deleteHsnCode(id); if (!result.success) { toast.error(result.message); return; } toast.success(result.message); setOpen(false); router.refresh(); }); } return ( <AlertDialog open={open} onOpenChange={setOpen}> <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> <AlertDialogContent> <AlertDialogHeader> <AlertDialogTitle>Delete HSN Code?</AlertDialogTitle> <AlertDialogDescription> HSN {code} will be permanently deleted. <br /> This action cannot be undone. </AlertDialogDescription> </AlertDialogHeader> <AlertDialogFooter> <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel> <Button variant="destructive" disabled={isPending} onClick={handleDelete}> <Trash2 className="h-4 w-4" /> {isPending ? "Deleting..." : "Delete"} </Button> </AlertDialogFooter> </AlertDialogContent> </AlertDialog> );
}
