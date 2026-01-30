"use client";

import { useActionState, useState } from "react";
import { uploadProduct } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle2, AlertCircle, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

const initialState = {
    error: "",
    success: false,
};

export function UploadForm() {
    const [state, formAction, isPending] = useActionState(uploadProduct, initialState);
    const [preview, setPreview] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
        }
    };

    const clearPreview = () => {
        setPreview(null);
        const input = document.getElementById('image') as HTMLInputElement;
        if (input) input.value = '';
    };

    return (
        <form action={formAction} className="space-y-6">
            {state?.error && (
                <div className="flex items-center gap-2 p-4 text-sm font-medium text-destructive bg-destructive/10 rounded-lg border border-destructive/20 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{state.error}</p>
                </div>
            )}

            {state?.success && (
                <div className="flex items-center gap-2 p-4 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100 animate-in fade-in slide-in-from-top-2">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <p>Product uploaded successfully! Redirecting to shop...</p>
                    <script dangerouslySetInnerHTML={{ __html: "setTimeout(() => window.location.href = '/shop', 2000)" }} />
                </div>
            )}

            <div className="grid gap-2">
                <Label htmlFor="name" className="text-sm font-semibold">Product Name</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="e.g., Premium Leather Wallet"
                    required
                    disabled={isPending}
                />
            </div>

            <div className="grid gap-2">
                <Label htmlFor="description" className="text-sm font-semibold">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide a compelling description of the product..."
                    className="min-h-[120px] resize-none"
                    required
                    disabled={isPending}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="price" className="text-sm font-semibold">Selling Price (ZMW)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">K</span>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            className="pl-7"
                            placeholder="0.00"
                            required
                            disabled={isPending}
                        />
                    </div>
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="commission" className="text-sm font-semibold">Commission</Label>
                    <Input
                        id="commission"
                        name="commission"
                        placeholder="e.g., 10% or K50"
                        disabled={isPending}
                    />
                </div>
            </div>

            <div className="grid gap-2">
                <Label className="text-sm font-semibold">Product Image</Label>
                <div className="relative group">
                    <div className={cn(
                        "relative border-2 border-dashed rounded-xl transition-all duration-200 flex flex-col items-center justify-center p-8",
                        preview ? "border-primary/50 bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50"
                    )}>
                        {preview ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-inner">
                                <Image src={preview} alt="Preview" fill className="object-cover" />
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="destructive"
                                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                                    onClick={clearPreview}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center space-y-3">
                                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">Click to upload or drag and drop</p>
                                    <p className="text-xs text-muted-foreground uppercase">PNG, JPG or WebP (Max 5MB)</p>
                                </div>
                            </div>
                        )}
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                            required
                            disabled={isPending}
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-transform active:scale-[0.99]"
                disabled={isPending}
            >
                {isPending ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Product...
                    </>
                ) : (
                    "Publish Product"
                )}
            </Button>
        </form>
    );
}
