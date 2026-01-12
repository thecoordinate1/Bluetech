
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { type User as AuthUser } from "@supabase/supabase-js";
import { getCurrentVendorProfile, type VendorProfile } from "@/services/userService";
import { getStoresByUserId } from "@/services/storeService";
import { getSettlementStats, getSettlements, type SettlementStats } from "@/services/settlementService";
import { type Settlement } from "@/lib/types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, ArrowUpRight, Clock, AlertCircle, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { SettlementStatusBadge } from "@/components/SettlementStatusBadge";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function FinancePage() {
    const [loading, setLoading] = React.useState(true);
    const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
    const [storeId, setStoreId] = React.useState<string | null>(null);
    const [stats, setStats] = React.useState<SettlementStats | null>(null);
    const [transactions, setTransactions] = React.useState<Settlement[]>([]);

    const router = useRouter();
    const supabase = createClient();

    React.useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setAuthUser(user as AuthUser);

            // Get Vendor Store
            const { data: stores } = await getStoresByUserId(user.id);
            if (stores && stores.length > 0) {
                const mainStore = stores[0];
                setStoreId(mainStore.id);

                // Fetch Finance Data
                const [statsRes, settlementsRes] = await Promise.all([
                    getSettlementStats(mainStore.id),
                    getSettlements(mainStore.id, 1, 10) // 10 most recent
                ]);

                if (statsRes.data) setStats(statsRes.data);
                if (settlementsRes.data) setTransactions(settlementsRes.data);
            }

            setLoading(false);
        };
        init();
    }, [router, supabase]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!storeId) {
        return (
            <div className="container py-12 text-center">
                <h1 className="text-2xl font-bold mb-4">No Store Found</h1>
                <p className="text-muted-foreground mb-8">You need to create a store to view finances.</p>
                <Button asChild><Link href="/onboarding">Create Store</Link></Button>
            </div>
        );
    }

    return (
        <div className="container py-8 space-y-8 animate-in fade-in duration-500 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance & Earnings</h1>
                    <p className="text-muted-foreground mt-2">Track your revenue, payouts, and settlement history.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline">
                        Export Report
                    </Button>
                    <Button asChild>
                        <Link href="/settings?tab=billing">Payout Settings</Link>
                    </Button>
                </div>
            </div>

            {stats?.frozen && stats.frozen > 0 ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Action Required</AlertTitle>
                    <AlertDescription>
                        You have <span className="font-semibold">ZMW {stats.frozen.toLocaleString()}</span> in frozen funds.
                        Please <Link href="/support" className="underline font-medium">contact support</Link> to resolve this.
                    </AlertDescription>
                </Alert>
            ) : null}

            <div className="grid gap-6 md:grid-cols-3">
                {/* Available Balance */}
                <Card className="border-emerald-100 bg-emerald-50/30 dark:bg-emerald-900/10 dark:border-emerald-900/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                            <Wallet className="w-4 h-4" />
                            Available Payout
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">ZMW {stats?.cleared ? stats.cleared.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Funds cleared and ready for next payout cycle.
                        </p>
                    </CardContent>
                </Card>

                {/* Pending / Escrow */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Pending (Escrow)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">ZMW {stats?.pending ? stats.pending.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Funds held securely until delivery is confirmed.
                        </p>
                    </CardContent>
                </Card>

                {/* Total Processed (Just a stat) */}
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            All-Time Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold text-muted-foreground/60">
                                ZMW {((stats?.cleared || 0) + (stats?.pending || 0) + (stats?.frozen || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            Total gross revenue processed.
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold tracking-tight">Recent Transactions</h2>
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="#">View All &rarr;</Link>
                    </Button>
                </div>
                <Card>
                    {/* Desktop View: Table */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                                            No transactions found yet.
                                            <br />
                                            <span className="text-xs">Once you start selling, your earnings will appear here.</span>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="text-muted-foreground">
                                                {format(new Date(tx.created_at), 'MMM dd, yyyy')}
                                                <br />
                                                <span className="text-xs opacity-70">{format(new Date(tx.created_at), 'hh:mm a')}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium text-sm">{tx.reference || 'N/A'}</div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[150px]">
                                                    {tx.lenco_transaction_id || 'ID: ' + tx.id.slice(0, 8)}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <SettlementStatusBadge status={tx.status} />
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {tx.status === 'frozen' || tx.status === 'disputed' ? (
                                                    <span className="text-red-600">K {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                ) : (
                                                    <span>K {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="md:hidden divide-y">
                        {transactions.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                No transactions found yet.
                                <br />
                                <span className="text-xs">Once you start selling, your earnings will appear here.</span>
                            </div>
                        ) : (
                            transactions.map((tx) => (
                                <div key={tx.id} className="p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium text-sm">{tx.reference || 'N/A'}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {format(new Date(tx.created_at), 'MMM dd, yyyy • hh:mm a')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {tx.status === 'frozen' || tx.status === 'disputed' ? (
                                                <span className="font-semibold text-red-600">K {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            ) : (
                                                <span className="font-semibold">K {Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between text-xs">
                                        <div className="text-muted-foreground truncate max-w-[180px]">
                                            ID: {tx.lenco_transaction_id ? tx.lenco_transaction_id.slice(0, 10) + '...' : tx.id.slice(0, 8)}
                                        </div>
                                        <SettlementStatusBadge status={tx.status} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
