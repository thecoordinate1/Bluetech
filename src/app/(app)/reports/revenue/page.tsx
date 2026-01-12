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
    Download
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
    Bar
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
    getRevenueSummaryStats,
    getMonthlyRevenueOverview,
    getTopProductsByRevenue,
    type RevenueSummaryStats,
    type MonthlyRevenueData,
    type TopProductByRevenue
} from "@/services/reportService";
import type { User as AuthUser } from '@supabase/supabase-js';

// --- Chart Config ---
const chartConfig = {
    revenue: {
        label: "Revenue (K)",
        color: "hsl(var(--primary))",
    },
    transactions: {
        label: "Transactions",
        color: "hsl(var(--secondary))",
    },
};

export default function RevenueReportPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const storeId = searchParams.get("storeId");
    const supabase = createClient();

    // State
    const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
    const [selectedStore, setSelectedStore] = React.useState<StoreFromSupabase | null>(null);
    const [hasStores, setHasStores] = React.useState<boolean | null>(null);

    const [summaryStats, setSummaryStats] = React.useState<RevenueSummaryStats | null>(null);
    const [chartData, setChartData] = React.useState<MonthlyRevenueData[]>([]);
    const [topProducts, setTopProducts] = React.useState<TopProductByRevenue[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);

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
                        router.replace(`/reports/revenue?storeId=${data[0].id}`);
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
            try {
                const [
                    storeRes,
                    summaryRes,
                    chartRes,
                    productsRes
                ] = await Promise.all([
                    getStoreById(storeId, authUser.id),
                    getRevenueSummaryStats(storeId),
                    getMonthlyRevenueOverview(storeId, 6),
                    getTopProductsByRevenue(storeId, 5, 30) // Top 5, last 30 days
                ]);

                if (storeRes.data) setSelectedStore(storeRes.data);
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
                console.error("Error fetching revenue data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [storeId, authUser]);

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
                                Revenue Report
                                <Badge variant="outline" className="hidden md:inline-flex font-normal">
                                    {selectedStore?.name}
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

                {/* Key Metrics Grid - Mobile First (2 cols on mobile, 4 on desktop) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                    <MetricCard
                        title="Total Revenue"
                        value={summaryStats ? formatMoney(summaryStats.ytd_revenue) : "K0.00"}
                        description="Year to Date"
                        icon={DollarSign}
                        trend="+12%" // Mock trend for now as RPC doesn't return comparison yet
                        trendType="positive"
                    />
                    <MetricCard
                        title="Transactions"
                        value={summaryStats?.ytd_transactions.toString() || "0"}
                        description="Total Orders YTD"
                        icon={CreditCard}
                    />
                    <MetricCard
                        title="Avg Order Value"
                        value={summaryStats ? formatMoney(summaryStats.ytd_avg_order_value) : "K0.00"}
                        description="Per transaction"
                        icon={TrendingUp}
                    />
                    <MetricCard
                        title="This Month"
                        value={summaryStats ? formatMoney(summaryStats.current_month_revenue) : "K0.00"}
                        description={`${summaryStats?.current_month_transactions || 0} orders`}
                        icon={Calendar}
                        className="bg-primary/5 border-primary/20"
                    />
                </div>

                {/* Chart Section */}
                <Card className="border-none shadow-sm bg-card/50">
                    <CardHeader>
                        <CardTitle>Revenue Trend</CardTitle>
                        <CardDescription>Monthly revenue performance over the last 6 months</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[300px] md:h-[400px] w-full min-w-0">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
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
                                        content={<ChartTooltipContent indicator="dot" />}
                                        cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total_revenue"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorRevenue)"
                                        strokeWidth={3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Top Products Section */}
                <div className="grid md:grid-cols-3 gap-6">
                    <Card className="md:col-span-2 border-none shadow-sm bg-card/50">
                        <CardHeader>
                            <CardTitle>Top Performing Products</CardTitle>
                            <CardDescription>Based on revenue generated in the last 30 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {topProducts.length > 0 ? topProducts.map((product, i) => (
                                    <div key={product.product_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground font-bold text-xs ring-2 ring-background">
                                                {i + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium line-clamp-1">{product.product_name}</p>
                                                <p className="text-xs text-muted-foreground">{product.units_sold} units sold</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{formatMoney(product.total_revenue_generated)}</p>
                                            <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden ml-auto">
                                                <div
                                                    className="h-full bg-primary rounded-full"
                                                    style={{ width: `${(product.total_revenue_generated / (topProducts[0]?.total_revenue_generated || 1)) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        No sales data available for this period.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Actions / Insights Placeholder */}
                    <Card className="border-none shadow-sm bg-primary/5 border-primary/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                Insights
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-muted-foreground">
                                Your store revenue has grown by <span className="font-bold text-emerald-600">12%</span> compared to last month. Keep up the good work!
                            </p>
                            <div className="bg-background/50 p-4 rounded-xl border border-dashed">
                                <p className="text-xs font-medium text-muted-foreground uppercase mb-2">Target Goal</p>
                                <div className="flex items-end justify-between mb-2">
                                    <span className="text-2xl font-bold">75%</span>
                                    <span className="text-sm text-muted-foreground">of K10k goal</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-primary w-3/4 animate-pulse" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
