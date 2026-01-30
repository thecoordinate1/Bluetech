import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugStore() {
    const targetEmail = 'entemba.shop@gmail.com';
    console.log(`Checking store for email: ${targetEmail}`);

    // Try by contact_email
    const { data: byContactEmail, error: err1 } = await supabase
        .from('stores')
        .select('id, name, contact_email, vendor_id')
        .eq('contact_email', targetEmail);

    console.log('Results by contact_email:', byContactEmail, err1);

    // Try by name
    const { data: byName, error: err2 } = await supabase
        .from('stores')
        .select('id, name, contact_email, vendor_id')
        .ilike('name', '%entemba%');

    console.log('Results by name:', byName, err2);

    // Try finding vendor
    const { data: vendor, error: err3 } = await supabase
        .from('vendors')
        .select('id, email')
        .eq('email', targetEmail);

    console.log('Vendor matching email:', vendor, err3);

    if (vendor && vendor.length > 0) {
        const { data: storesByVendor, error: err4 } = await supabase
            .from('stores')
            .select('id, name, contact_email')
            .eq('vendor_id', vendor[0].id);
        console.log('Stores for this vendor:', storesByVendor, err4);
    }
}

debugStore();
