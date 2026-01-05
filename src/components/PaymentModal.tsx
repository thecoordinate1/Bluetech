
"use client";

import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Phone, CheckCircle2, Import } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (phone: string, provider: 'airtel' | 'mtn' | 'zamtel') => Promise<void>;
    onUseCredit?: () => Promise<void>;
    amount: string | number;
    title?: string;
    description?: string;
    isProcessing?: boolean;
    remainingCredits?: number;
}

export function PaymentModal({
    isOpen,
    onClose,
    onConfirm,
    onUseCredit,
    amount,
    title = "Confirm Payment",
    description = "Enter your mobile money details to proceed.",
    isProcessing = false,
    remainingCredits = 0
}: PaymentModalProps) {
    const [phone, setPhone] = React.useState("");
    const [provider, setProvider] = React.useState<'airtel' | 'mtn' | 'zamtel'>('mtn');
    const [mode, setMode] = React.useState<'pay' | 'credit'>(remainingCredits > 0 ? 'credit' : 'pay');
    const [error, setError] = React.useState<string | null>(null);

    const validatePhone = (phoneNumber: string, selectedProvider: string) => {
        // Remove spaces and non-digit characters
        const cleanPhone = phoneNumber.replace(/\D/g, '');

        // Check length (Zambia numbers are usually 10 digits starting with 0)
        if (cleanPhone.length !== 10) {
            return "Phone number must be 10 digits (e.g., 096xxxxxxx)";
        }

        const prefix = cleanPhone.substring(0, 3);

        if (selectedProvider === 'mtn') {
            if (!['096', '076'].includes(prefix)) return "MTN numbers must start with 096 or 076";
        } else if (selectedProvider === 'airtel') {
            if (!['097', '077'].includes(prefix)) return "Airtel numbers must start with 097 or 077";
        } else if (selectedProvider === 'zamtel') {
            if (!['095', '075'].includes(prefix)) return "Zamtel numbers must start with 095 or 075";
        }

        return null;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validationError = validatePhone(phone, provider);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        onConfirm(phone, provider);
    };

    // Clear error when inputs change
    const handlePhoneChange = (val: string) => {
        setPhone(val);
        if (error) setError(null);
    };

    const handleProviderChange = (val: 'airtel' | 'mtn' | 'zamtel') => {
        setProvider(val);
        if (error) setError(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isProcessing && !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4">
                    <div className="bg-muted p-4 rounded-lg mb-6 flex justify-between items-center">
                        <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                        <div className="text-right">
                            {mode === 'credit' ? (
                                <>
                                    <span className="text-xl font-bold text-emerald-600">Free</span>
                                    <span className="block text-xs text-muted-foreground line-through">ZMW {Number(amount).toLocaleString()}</span>
                                </>
                            ) : (
                                <span className="text-xl font-bold text-foreground">ZMW {Number(amount).toLocaleString()}</span>
                            )}
                        </div>
                    </div>

                    {remainingCredits > 0 && (
                        <div className="mb-4">
                            <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                <Button
                                    type="button"
                                    variant={mode === 'credit' ? 'default' : 'ghost'}
                                    className="flex-1 text-xs h-8"
                                    onClick={() => setMode('credit')}
                                >
                                    Use Free Credit ({remainingCredits} left)
                                </Button>
                                <Button
                                    type="button"
                                    variant={mode === 'pay' ? 'default' : 'ghost'}
                                    className="flex-1 text-xs h-8"
                                    onClick={() => setMode('pay')}
                                >
                                    Pay with Mobile Money
                                </Button>
                            </div>
                        </div>
                    )}

                    {mode === 'pay' && (
                        <form id="payment-form" onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="provider">Network Provider</Label>
                                <Select
                                    value={provider}
                                    onValueChange={handleProviderChange}
                                    disabled={isProcessing}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select provider" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mtn">MTN Money</SelectItem>
                                        <SelectItem value="airtel">Airtel Money</SelectItem>
                                        <SelectItem value="zamtel">Zamtel Kwacha</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        placeholder="096 123 4567"
                                        className={cn("pl-9", error && "border-destructive focus-visible:ring-destructive")}
                                        value={phone}
                                        onChange={(e) => handlePhoneChange(e.target.value)}
                                        required
                                        disabled={isProcessing}
                                    />
                                </div>
                                {error && (
                                    <p className="text-xs text-destructive font-medium">{error}</p>
                                )}
                            </div>

                        </form>
                    )}

                    {mode === 'credit' && (
                        <div className="text-center py-6">
                            <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                            <p className="font-medium">You are using 1 free import credit.</p>
                            <p className="text-sm text-muted-foreground">No payment required.</p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} disabled={isProcessing} className="w-full sm:w-auto">
                        Cancel
                    </Button>

                    <Button
                        type="button"
                        onClick={() => mode === 'pay' ? document.getElementById('submit-payment')?.click() : onUseCredit?.()}
                        disabled={isProcessing || (mode === 'pay' && !phone)}
                        className="w-full sm:w-auto"
                    >
                        {/* Hidden submit button to trigger form validation on 'pay' mode */}
                        {mode === 'pay' && <button id="submit-payment" type="submit" form="payment-form" className="hidden" />}

                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : mode === 'credit' ? (
                            <>
                                <Import className="mr-2 h-4 w-4" />
                                Import for Free
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Pay Now
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent >
        </Dialog >
    );
}
