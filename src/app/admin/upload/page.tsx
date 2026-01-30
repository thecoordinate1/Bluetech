import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { UploadForm } from "./upload-form";

export const dynamic = 'force-dynamic';

export default async function AdminUploadPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Strict access Control
    if (!user || user.email !== 'entemba.shop@gmail.com') {
        redirect('/');
    }

    return (
        <div className="container mx-auto py-12 px-4 max-w-2xl">
            <div className="mb-8 space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Product Administration</h1>
                <p className="text-muted-foreground">Upload new products to your public shop front.</p>
            </div>

            <Card className="border-none shadow-xl">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-lg text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package-plus"><path d="M16 16h6" /><path d="M19 13v6" /><path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" /><path d="m7.5 4.27 9 5.15" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" x2="12" y1="22" y2="12" /></svg>
                        </div>
                        <div>
                            <CardTitle>Add New Product</CardTitle>
                            <CardDescription>Fill in the details below to list a new item.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <UploadForm />
                </CardContent>
            </Card>
        </div>
    );
}
