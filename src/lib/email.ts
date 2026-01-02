
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
}: {
    to: string;
    subject: string;
    html: string;
}) {
    if (!process.env.RESEND_API_KEY) {
        console.error('[Email] RESEND_API_KEY is missing. Email skipped.');
        return { success: false, error: 'Configuration Error' };
    }

    try {
        const data = await resend.emails.send({
            from: 'Entemba <noreply@entemba.shop>',
            to,
            subject,
            html,
        });

        console.log('[Email] Sent successfully:', data.id);
        return { success: true, id: data.id };
    } catch (error) {
        console.error('[Email] Failed to send:', error);
        return { success: false, error };
    }
}
