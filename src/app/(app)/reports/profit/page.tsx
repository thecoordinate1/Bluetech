"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Calendar,
    ArrowLeft,
    Store as StoreIcon,
    Download,
    Percent,
    TrendingDown
} from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
    ComposedChart,
    Line
} from "recharts";
import { format, parseISO, isValid, subDays } from 'date-fns';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

import { MetricCard } from "@/components/MetricCard";
import { createClient } from '@/lib/supabase/client';
import { getStoresByUserId, getStoreById, type StoreFromSupabase } from "@/services/storeService";
import {
    getProfitSummaryStats,
    getMonthlyProfitOverview,
    getTopProductsByProfit,
    type ProfitSummaryStats,
    type MonthlyProfitData,
    type ProductProfitData
} from "@/services/reportService";
import type { User as AuthUser } from '@supabase/supabase-js';
import { useToast } from "@/hooks/use-toast";

// --- Chart Config ---
const chartConfig = {
    profit: {
        label: "Gross Profit (ZMW)",
        color: "hsl(var(--primary))",
    },
    cogs: {
        label: "COGS (ZMW)",
        color: "hsl(var(--destructive))",
    },
};

export default function ProfitReportPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const storeId = searchParams.get("storeId");
    const supabase = createClient();
    const { toast } = useToast();

    // State
    const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
    const [selectedStore, setSelectedStore] = React.useState<StoreFromSupabase | null>(null);
    const [hasStores, setHasStores] = React.useState<boolean | null>(null);

    const [summaryStats, setSummaryStats] = React.useState<ProfitSummaryStats | null>(null);
    const [chartData, setChartData] = React.useState<MonthlyProfitData[]>([]);
    const [topProducts, setTopProducts] = React.useState<ProductProfitData[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [accessDenied, setAccessDenied] = React.useState(false);

    // Auth Check
    React.useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => {
            setAuthUser(user);
        });
    }, [supabase]);

    // Store Check
    React.useEffect(() => {
        const checkUserStores = async () => {
            if (authUser) {
                const { data, error } = await getStoresByUserId(authUser.id);
                if (error || !data || data.length === 0) {
                    setHasStores(false);
                } else {
                    setHasStores(true);
                    // If no storeId param, redirect to first store
                    if (!storeId) {
                        router.replace(`/reports/profit?storeId=${data[0].id}`);
                    }
                }
            }
        };
        checkUserStores();
    }, [authUser, storeId, router]);

    // Data Fetch
    React.useEffect(() => {
        const fetchData = async () => {
            if (!authUser || !storeId) return;

            setIsLoading(true);
            setAccessDenied(false);

            try {
                const [
                    storeRes,
                    summaryRes,
                    chartRes,
                    productsRes
                ] = await Promise.all([
                    getStoreById(storeId, authUser.id),
                    getProfitSummaryStats(storeId),
                    getMonthlyProfitOverview(storeId, 6),
                    getTopProductsByProfit(storeId, 5, 30) // Top 5, last 30 days
                ]);

                if (storeRes.data) setSelectedStore(storeRes.data);

                // Handle Access Denied
                if (summaryRes.error && summaryRes.error.message.includes('Upgrade required')) {
                    setAccessDenied(true);
                    setIsLoading(false);
                    return;
                }

                if (summaryRes.data) setSummaryStats(summaryRes.data);

                if (chartRes.data) {
                    const mapped = (chartRes.data || []).map(item => ({
                        ...item,
                        period_display: isValid(parseISO(item.period_start_date)) ? format(parseISO(item.period_start_date), 'MMM') : '???',
                    })).reverse();
                    setChartData(mapped);
                }

                if (productsRes.data) setTopProducts(productsRes.data);

            } catch (error) {
                console.error("Error fetching profit data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [storeId, authUser]);

    // Calculations
    const ytdMargin = summaryStats && summaryStats.ytd_revenue_for_margin_calc > 0
        ? ((summaryStats.ytd_gross_profit / summaryStats.ytd_revenue_for_margin_calc) * 100).toFixed(1)
        : "0.0";

    // Loading State
    if (isLoading) {
        return (
            <div className="container max-w-7xl p-4 md:p-8 space-y-6">
                <div className="flex items-center gap-4 mb-8">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <Skeleton className="h-[300px] w-full rounded-xl" />
            </div>
        );
    }

    // Access Denied State
    if (accessDenied) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-6 text-amber-600">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold mb-2">Profit Analytics Locked</h1>
                <p className="text-muted-foreground max-w-sm mb-8">
                    Upgrade to a premium plan to unlock detailed profit and loss reports, margin analysis, and more.
                </p>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.back()}>
                        Go Back
                    </Button>
                    <Button onClick={() => router.push('/subscription')}>
                        View Plans
                    </Button>
                </div>
            </div>
        )
    }

    // Helper for formatting currency
    const formatMoney = (amount: number) => `K${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    return (
        <div className="min-h-screen bg-background pb-20 w-full overflow-x-hidden">
            {/* Header */}
            <div className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
                <div className="container max-w-7xl p-4 md:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => router.back()}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
                                Profit Report
                                <Badge variant="secondary" className="hidden md:inline-flex font-normal bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                    Premium
                                </Badge>
                            </h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="hidden md:flex gap-2">
                            <Calendar className="w-4 h-4" /> Last 30 Days
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Download className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container max-w-7xl p-4 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                {/* Key Metrics Grid - Mobile First */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <MetricCard
                        title="Gross Profit"
                        value={summaryStats ? formatMoney(summaryStats.ytd_gross_profit) : "K0.00"}
                        description="Year to Date"
                        icon={DollarSign}
                        trend="+8%" // Mock trend
                        trendType="positive"
                    />
                    <MetricCard
                        title="Net Margin"
                        value={`${ytdMargin}%`}
                        description="Profit Margin YTD"
                        icon={Percent}
                    />
                    <MetricCard
                        title="COGS"
                        value={summaryStats ? formatMoney(summaryStats.ytd_cogs) : "K0.00"}
                        description="Cost of Goods Sold"
                        icon={TrendingDown}
                        className="opacity-90"
                    />
                    <MetricCard
                        title="This Month"
                        value={summaryStats ? formatMoney(summaryStats.current_month_gross_profit) : "K0.00"}
                        description="Gross Profit"
                        icon={Calendar}
                        className="bg-primary/5 border-primary/20"
                    />
                </div>

                {/* Chart Section */}
                <Card className="border-none shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle>Profit vs COGS</CardTitle>
                        <CardDescription>Monthly performance breakdown</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] md:h-[400px] w-full min-w-0">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="period_display"
                                        axisLine={false}
                                        tickLine={false}
                                        tickMargin={10}
                                        fontSize={12}
                                        stroke="hsl(var(--muted-foreground))"
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        fontSize={12}
                                        stroke="hsl(var(--muted-foreground))"
                                        tickFormatter={(val) => `K${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`}
                                    />
                                    <Tooltip
                                        content={<ChartTooltipContent indicator="dashed" />}
                                        cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                                    />
                                    <Bar
                                        dataKey="total_gross_profit"
                                        name="Gross Profit"
                                        fill="hsl(var(--primary))"
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={50}
                                    />
                                    <Bar
                                        dataKey="total_cogs"
                                        name="COGS"
                                        fill="hsl(var(--destructive))"
                                        opacity={0.5}
                                        radius={[4, 4, 0, 0]}
                                        maxBarSize={50}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Top Profitable Products Section */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-none shadow-sm bg-card/50">
                        <CardHeader>
                            <CardTitle>Most Profitable Products</CardTitle>
                            <CardDescription>Highest gross profit contributors (Last 30 days)</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topProducts.length > 0 ? topProducts.map((product, i) => (
                                    <div key={product.product_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-xs ring-2 ring-background">
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium line-clamp-1">{product.product_name}</p>
                                                <p className="text-xs text-muted-foreground">{product.units_sold} units sold</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(product.total_profit_generated)}</p>
                                            <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden ml-auto">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full"
                                                    style={{ width: `${(product.total_profit_generated / (topProducts[0]?.total_profit_generated || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No profit data available for this period.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Profit Advice Placeholder */}
                    <Card className="border-none shadow-sm bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                                <TrendingUp className="w-5 h-5" />
                                Profit Tips
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Your net margin is <span className="font-bold">{ytdMargin}%</span>.
                                Industry average for retail is around 20%.
                            </p>
                            <div className="bg-background/80 p-4 rounded-xl border border-dashed text-sm">
                                <p className="font-semibold mb-1">Recommendation:</p>
                                <p className="text-muted-foreground text-xs leading-relaxed">
                                    Consider reviewing your COGS for your top-selling items to improve overall margins.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
