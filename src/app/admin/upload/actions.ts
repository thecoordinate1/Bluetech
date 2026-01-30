'use server';

import { createProduct } from "@/services/productService";
import { getStoreByEmail } from "@/services/storeService";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function uploadProduct(prevState: any, formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== 'entemba.shop@gmail.com') {
        return { error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const wholesalePrice = parseFloat(formData.get('wholesalePrice') as string);
    const image = formData.get('image') as File;

    if (!name || isNaN(price) || isNaN(wholesalePrice)) {
        return { error: 'Invalid input' };
    }

    // Fetch store to attach product to
    // We assume the store is the one associated with this email
    const { data: store, error: storeError } = await getStoreByEmail(user.email!);

    if (storeError || !store) {
        return { error: 'Store not found for this user' };
    }

    const { data, error } = await createProduct(
        user.id,
        store.id,
        {
            name,
            category: 'General',
            price,
            order_price: wholesalePrice,
            stock: 100,
            status: 'Active',
            full_description: description || '',
            description: description || '',
            attributes: {}
        },
        image.size > 0 ? [{ file: image, order: 1 }] : []
    );

    if (error) {
        console.error("Upload error:", error);
        return { error: error.message };
    }

    revalidatePath('/shop');
    return { success: true };
}
