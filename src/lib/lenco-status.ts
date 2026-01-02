
import { SettlementStatus } from "./types";

export interface FriendlyStatus {
    label: string;
    description: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "warning";
    actionLabel?: string;
    actionUrl?: string; // e.g., link to support
}

export function getFriendlySettlementStatus(status: string): FriendlyStatus {
    switch (status) {
        case 'cleared':
            return {
                label: "Cleared",
                description: "Funds have been successfully released to your account.",
                variant: "default"
            };
        case 'pending':
            return {
                label: "Processing",
                description: "Funds are securely held in escrow. Release usually takes 24-48 hours after delivery.",
                variant: "secondary"
            };
        case 'frozen':
        case 'disputed':
            return {
                label: "Action Required",
                description: "These funds are currently on hold due to a dispute or review. Please contact support.",
                variant: "destructive",
                actionLabel: "Contact Support",
            };
        default:
            return {
                label: status,
                description: "Status unknown.",
                variant: "outline"
            };
    }
}

export function getPaymentFailureMessage(reasonCode?: string): string {
    // Map Lenco specific failure codes if available, otherwise generic
    switch (reasonCode) {
        case 'insufficient_funds':
            return "The transaction failed due to insufficient funds. Please top up your account and retry.";
        case 'card_declined':
            return "Your card was declined by the issuer. Please try a different card.";
        case 'expired_card':
            return "Your card has expired. Please update your payment method.";
        case 'fraud_suspected':
            return "Transaction flagged for security review. Please contact your bank.";
        default:
            return "We couldn't process your payment. Please check your details and try again or contact support.";
    }
}
