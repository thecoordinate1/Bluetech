
import * as React from 'react';
import * as crypto from 'crypto';
import { createClient } from '@/lib/supabase/client';
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { NewOrderEmail } from '@/emails/NewOrderEmail';
import { render } from '@react-email/components';

// Initialize Supabase client
const supabase = createClient();

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    console.log('[Webhook] Received Lenco event:', JSON.stringify(body, null, 2));

    // --- Signature Verification ---
    const secret = process.env.LENCO_LIVE_SECRET_KEY;
    const signature = request.headers.get('x-lenco-signature') || request.headers.get('x-webhook-signature');

    if (secret && signature) {
      const derivedSecret = crypto.createHash('sha256').update(secret).digest('hex');
      const hash = crypto.createHmac('sha512', derivedSecret).update(rawBody).digest('hex');

      if (hash !== signature) {
        console.error('[Webhook] Invalid signature. Expected:', hash, 'Got:', signature);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    } else {
      // Dev/Testing bypass if needed, but warn
      console.warn('[Webhook] Missing secret or signature.');
    }

    // --- Payload Normalization (v2 vs v1) ---
    // v2 seems to wrap main data in `data`, but webhooks might still have top-level fields or specific event structures.
    // Based on user provided docs, the GET response has `data`. Webhook usually sends the resource that changed.
    // We will assume the body might contain `data` or be the event itself.

    // We expect an event type or we infer from data
    // If body has `eventType`, it might be v1. If it's v2, we need to check if Lenco sends `event` property.
    // For now, let's look for known fields in `body` or `body.data`.

    const payload = body.data || body;
    const eventType = body.eventType || body.type; // Adjust based on actual v2 webhook sample if available

    // Common fields
    const reference = payload.reference || payload.lencoReference;
    const status = payload.status;

    // Lenco v2 "mobile-money" collection
    if (payload.type === 'mobile-money') {
      // --- Handle Subscription Payment ---
      if (reference && reference.startsWith('sub_')) {
        if (status === 'successful') {
          // Format: sub_{vendorId}_{timestamp}
          const parts = reference.split('_');
          const vendorId = parts[1];

          if (vendorId) {
            await supabase.from('vendor_subscriptions').update({
              status: 'active',
              updated_at: new Date().toISOString()
            }).eq('vendor_id', vendorId);
            console.log(`[Webhook] Subscription activated for ${vendorId}`);
          }
        } else if (status === 'failed') {
          // Handle failure if needed
          console.log(`[Webhook] Subscription payment failed for reference ${reference}`);
        }
        return NextResponse.json({ message: 'Subscription event processed' });
      }

      // --- Handle Market Import Payment ---
      if (reference && reference.startsWith('imp_')) {
        // Format: imp_{storeId}_{productId}_{timestamp}
        const parts = reference.split('_');
        const storeId = parts[1];
        const productId = parts[2];

        if (status === 'successful') {
          // Logic to finalize import or mark transaction as paid
          // For now, we assumed optimistic UI, but this confirms it.
          // We could create a `transaction` record here.
          await supabase.from('transactions').insert({
            store_id: storeId,
            reference: reference,
            amount: payload.amount,
            currency: payload.currency,
            status: 'completed',
            type: 'market_import',
            metadata: payload
          });
          console.log(`[Webhook] Market import payment successful: ${reference}`);
        }
        return NextResponse.json({ message: 'Market import event processed' });
      }
    }

    // Fallback for v1 or other events (keep existing logic if compatible)
    // ... (Retain if needed, but v2 might replace it completely)

    return NextResponse.json({ message: 'Event received' });

  } catch (error) {
    console.error('[Webhook] Error processing request:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
