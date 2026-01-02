
"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, AlertCircle } from "lucide-react";
import { getFriendlySettlementStatus } from "@/lib/lenco-status";
import { cn } from "@/lib/utils";

interface SettlementStatusBadgeProps {
    status: string;
    className?: string;
}

export function SettlementStatusBadge({ status, className }: SettlementStatusBadgeProps) {
    const friendly = getFriendlySettlementStatus(status);

    const badgeVariant = friendly.variant === 'warning' ? 'outline' : friendly.variant; // Map custom warning to outline or equivalent if needed

    // Custom styles for specific variants to match design system better if needed
    const variantStyles = {
        default: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
        secondary: "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200",
        destructive: "bg-red-50 text-red-700 hover:bg-red-50 border-red-200",
        outline: "",
        warning: "bg-amber-50 text-amber-700 hover:bg-amber-50 border-amber-200"
    };

    const currentStyle = variantStyles[friendly.variant as keyof typeof variantStyles] || "";

    return (
        <TooltipProvider>
            <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                    <Badge
                        variant={badgeVariant === 'warning' ? 'outline' : badgeVariant}
                        className={cn("cursor-help gap-1.5 pr-1.5", currentStyle, className)}
                    >
                        {friendly.label}
                        {friendly.variant === 'destructive' ? (
                            <AlertCircle className="w-3 h-3" />
                        ) : (
                            <HelpCircle className="w-3 h-3 opacity-50" />
                        )}
                    </Badge>
                </TooltipTrigger>
                <TooltipContent className="max-w-[250px] text-xs">
                    <p className="font-semibold mb-1">{friendly.label}</p>
                    <p className="text-muted-foreground">{friendly.description}</p>
                    {friendly.actionLabel && (
                        <p className="mt-2 text-primary font-medium">{friendly.actionLabel} &rarr;</p>
                    )}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
