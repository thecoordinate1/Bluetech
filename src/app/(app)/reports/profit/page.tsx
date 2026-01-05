"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Percent,
  ArrowLeft,
  Receipt,
  Landmark,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getProfitSummaryStats,
  getTopProductsByProfit,
  getMonthlyProfitOverview,
  type ProfitSummaryStats,
  type ProductProfitData,
  type MonthlyProfitData,
} from "@/services/reportService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO, isValid } from 'date-fns';

interface ProfitChartDataItem {
  month: string;
  grossProfit: number;
  cogs: number;
}

const profitChartConfig = {
  grossProfit: { label: "Gross Profit", color: "hsl(var(--primary))" },
  cogs: { label: "COGS", color: "hsl(var(--destructive))" },
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  description?: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  isLoading?: boolean;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, trend, trendType, isLoading, className }) => {
  if (isLoading) {
    return (
      <Card className="h-[120px]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-5 w-2/5" /> <Skeleton className="h-5 w-5 rounded-full" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-3/5 mb-1" />
          {description && <Skeleton className="h-3 w-full mb-1" />}
          {trend && <Skeleton className="h-3 w-3/4" />}
        </CardContent>
      </Card>
    );
  }
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-background/50 rounded-lg shadow-sm border">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</div>
        {trend && (
          <p className={`text-xs flex items-center mt-1 font-medium ${trendType === "positive" ? "text-emerald-600 dark:text-emerald-400" :
            trendType === "negative" ? "text-red-600 dark:text-red-400" :
              "text-muted-foreground"
            }`}>
            {trendType === "positive" && <TrendingUp className="mr-1 h-3 w-3" />}
            {trendType === "negative" && <TrendingDown className="mr-1 h-3 w-3" />}
            {trend}
          </p>
        )}
        {description && <p className="text-xs text-muted-foreground pt-1 opacity-80">{description}</p>}
      </CardContent>
    </Card>
  );
};

export default function ProfitReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const storeIdFromUrl = searchParams.get("storeId");

  const [summaryStats, setSummaryStats] = React.useState<ProfitSummaryStats | null>(null);
  const [topProducts, setTopProducts] = React.useState<ProductProfitData[]>([]);
  const [monthlyProfit, setMonthlyProfit] = React.useState<ProfitChartDataItem[]>([]);

  const [isLoadingPage, setIsLoadingPage] = React.useState(true);
  const [isLoadingTopProducts, setIsLoadingTopProducts] = React.useState(true);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

  const [timePeriod, setTimePeriod] = React.useState("30");

  React.useEffect(() => {
    const fetchReportData = async () => {
      setIsLoadingPage(true);
      setErrorMessages([]);
      if (!storeIdFromUrl) {
        setErrorMessages(["No store selected. Please select a store to view reports."]);
        setIsLoadingPage(false);
        setSummaryStats(null); setMonthlyProfit([]); setTopProducts([]);
        return;
      }

      const summaryStatsPromise = getProfitSummaryStats(storeIdFromUrl);
      const monthlyProfitPromise = getMonthlyProfitOverview(storeIdFromUrl, 6);

      const results = await Promise.allSettled([
        summaryStatsPromise,
        monthlyProfitPromise
      ]);

      const [summaryResult, monthlyResult] = results;

      if (summaryResult.status === 'fulfilled') {
        const { data, error, accessDenied } = summaryResult.value;
        if (accessDenied) {
          // Handle access denied gracefully, maybe redirect or show specific message
          setErrorMessages(["Access to Profit Analytics is restricted. Please upgrade your plan."]);
        } else if (error) {
          setErrorMessages(prev => [...prev, `Summary Stats: ${error.message || 'Failed to fetch.'}`]);
        }
        setSummaryStats(data);
      } else {
        setErrorMessages(prev => [...prev, `Summary Stats: ${(summaryResult.reason as Error).message || 'Failed to fetch.'}`]);
        setSummaryStats(null);
      }

      if (monthlyResult.status === 'fulfilled') {
        const { data, error } = monthlyResult.value;
        if (error) setErrorMessages(prev => [...prev, `Monthly Overview: ${error.message || 'Failed to fetch.'}`]);
        if (data) {
          setMonthlyProfit(data.map(item => {
            const parsedDate = parseISO(item.period_start_date);
            return {
              month: isValid(parsedDate) ? format(parsedDate, 'MMMM') : 'Unknown',
              grossProfit: item.total_gross_profit || 0,
              cogs: item.total_cogs || 0,
            };
          }).reverse());
        } else {
          setMonthlyProfit([]);
        }
      } else {
        // Silently fail chart if just RPC missing, to not block the whole page if summary works
        console.warn("Failed to load monthly profit", monthlyResult.reason);
        setMonthlyProfit([]);
      }
      setIsLoadingPage(false);
    };

    fetchReportData();
  }, [storeIdFromUrl]);

  React.useEffect(() => {
    const fetchTopProducts = async () => {
      if (!storeIdFromUrl) return;

      setIsLoadingTopProducts(true);
      const days = parseInt(timePeriod, 10);
      const { data, error } = await getTopProductsByProfit(storeIdFromUrl, 5, days);

      if (error) {
        toast({ variant: "destructive", title: "Error fetching top products", description: error.message });
        setTopProducts([]);
      } else {
        setTopProducts(data || []);
      }
      setIsLoadingTopProducts(false);
    };

    fetchTopProducts();
  }, [storeIdFromUrl, timePeriod, toast]);

  const queryParams = storeIdFromUrl ? `?storeId=${storeIdFromUrl}` : "";

  const ytdGrossProfit = summaryStats?.ytd_gross_profit ?? 0;
  const ytdCogs = summaryStats?.ytd_cogs ?? 0;
  const ytdRevenueForMargin = summaryStats?.ytd_revenue_for_margin_calc ?? 0;

  const ytdProfitMargin = ytdRevenueForMargin > 0 ? (ytdGrossProfit / ytdRevenueForMargin) * 100 : 0;
  const netProfitEstYTD = ytdGrossProfit; // Simplified estimation

  if (errorMessages.length > 0 && !isLoadingPage && (!summaryStats || errorMessages[0].includes("Access"))) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-4 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Access Denied or Error</h2>
        <div className="text-muted-foreground mb-6 max-w-md space-y-1">
          {errorMessages.map((msg, index) => <p key={index}>{msg}</p>)}
        </div>
        <Button variant="default" onClick={() => router.push(`/subscription`)}>
          Upgrade Plan
        </Button>
        <Button variant="ghost" className="mt-2" onClick={() => router.push(`/dashboard${queryParams}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>
      </div>
    );
  }

  const displayValue = (value: number, isCurrency = true) => {
    if (isCurrency) {
      return `ZMW ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${Number(value).toFixed(1)}%`;
  };

  const cardValue = (dataAvailable: boolean, value: number, isCurrency = true) => {
    return isLoadingPage ? "Loading..." : (dataAvailable ? displayValue(value, isCurrency) : "N/A");
  };


  return (
    <div className="flex flex-col gap-6 w-full max-w-full animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">Profit Report</h1>
        <div className="flex items-center gap-2">
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last 365 days</SelectItem>
              <SelectItem value="0">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Gross Profit (YTD)"
          value={cardValue(summaryStats !== null, ytdGrossProfit)}
          icon={DollarSign}
          description="Year-to-date gross profit."
          isLoading={isLoadingPage}
          className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-background border-emerald-500/20"
        />
        <StatCard
          title="COGS (YTD)"
          value={cardValue(summaryStats !== null, ytdCogs)}
          icon={Receipt}
          description="Year-to-date cost of goods sold."
          isLoading={isLoadingPage}
          className="bg-gradient-to-br from-orange-500/10 via-orange-500/5 to-background border-orange-500/20"
        />
        <StatCard
          title="Gross Margin (YTD)"
          value={cardValue(summaryStats !== null, ytdProfitMargin, false)}
          icon={Percent}
          description="YTD gross profit as % of revenue."
          isLoading={isLoadingPage}
          className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background border-blue-500/20"
        />
        <StatCard
          title="Net Profit (Est. YTD)"
          value={cardValue(summaryStats !== null, netProfitEstYTD)}
          icon={Landmark}
          description="Est. YTD Net Profit before ops."
          isLoading={isLoadingPage}
          className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-background border-purple-500/20"
        />
      </div>

      {/* Monthly Profit Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Trend</CardTitle>
          <CardDescription>Monthly Gross Profit vs Cost of Goods Sold (6 Months)</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          {isLoadingPage ? (
            <Skeleton className="h-[300px] w-full" />
          ) : monthlyProfit.length > 0 ? (
            <ChartContainer config={profitChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyProfit} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.5} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    fontWeight={500}
                  />
                  <YAxis
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    width={70}
                    tickFormatter={(value) => `K${Number(value / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'hsl(var(--muted)/0.4)' }}
                    content={
                      <ChartTooltipContent
                        indicator="dot"
                        className="bg-background/95 backdrop-blur-sm border shadow-xl"
                      />
                    }
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="grossProfit" name="Gross Profit" fill="var(--color-grossProfit)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  <Bar dataKey="cogs" name="COGS" fill="var(--color-cogs)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground h-[300px] flex items-center justify-center">No monthly profit data available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Products by Profit</CardTitle>
          <CardDescription>
            {timePeriod === "0" ? "Showing top products for all time." : `Showing top products from the last ${timePeriod} days.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTopProducts ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : topProducts && topProducts.length > 0 ? (
            <>
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="hidden sm:table-cell w-[80px]">Image</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Gross Profit</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Units Sold</TableHead>
                      <TableHead className="text-right hidden md:table-cell">Profit/Unit</TableHead>
                      <TableHead className="text-center w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topProducts.map((product) => (
                      <TableRow key={product.product_id} className="cursor-pointer group hover:bg-muted/50 transition-colors" onClick={() => router.push(`/products/${product.product_id}${queryParams}`)}>
                        <TableCell className="hidden sm:table-cell">
                          <div className="relative h-10 w-10 overflow-hidden rounded-md border shadow-sm group-hover:shadow-md transition-all">
                            <Image
                              src={product.primary_image_url || "https://placehold.co/40x40.png"}
                              alt={product.product_name}
                              fill
                              className="object-cover"
                              data-ai-hint={product.primary_image_data_ai_hint || "product"}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium group-hover:text-primary transition-colors whitespace-nowrap sm:whitespace-normal">
                            {product.product_name}
                          </p>
                          <div className="text-xs text-muted-foreground">{product.product_category}</div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-emerald-600 dark:text-emerald-500">ZMW {Number(product.total_profit_generated).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                        <TableCell className="text-right hidden md:table-cell">{product.units_sold.toLocaleString()}</TableCell>
                        <TableCell className="text-right hidden md:table-cell text-muted-foreground">
                          {Number(product.units_sold) > 0 ? `ZMW ${(Number(product.total_profit_generated) / Number(product.units_sold)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "ZMW 0.00"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); router.push(`/products/${product.product_id}${queryParams}`); }}>
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View for Profit */}
              <div className="md:hidden space-y-3">
                {topProducts.map((product) => (
                  <div
                    key={product.product_id}
                    className="flex items-center gap-3 p-3 rounded-xl border bg-card text-card-foreground shadow-sm active:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/products/${product.product_id}${queryParams}`)}
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                      <Image
                        src={product.primary_image_url || "https://placehold.co/100x100.png"}
                        alt={product.product_name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm truncate pr-2">{product.product_name}</h4>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-500 whitespace-nowrap">
                          ZMW {Number(product.total_profit_generated).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <p className="text-xs text-muted-foreground truncate">{product.product_category}</p>
                        <div className="text-xs text-muted-foreground">
                          {product.units_sold} sold • {Number(product.units_sold) > 0 ? `ZMW ${(Number(product.total_profit_generated) / Number(product.units_sold)).toFixed(0)}` : "0"}/unit
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">No top product profit data available for this period.</p>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t pt-4">
          <Button variant="outline" asChild>
            <Link href={`/reports/profit/products${queryParams}`}>View All Products Profit</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
