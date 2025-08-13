
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import { createClient } from '@/lib/supabase/client';
import type { User as AuthUser } from '@supabase/supabase-js';
import { getStoreById, type StoreFromSupabase } from "@/services/storeService";
import { getAllProductsRevenueForStore, type TopProductByRevenue } from "@/services/reportService";

export default function AllProductsRevenuePage() {
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const storeIdFromUrl = searchParams.get("storeId");

  const supabase = createClient();
  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [selectedStore, setSelectedStore] = React.useState<StoreFromSupabase | null>(null);
  const [allProductsRevenue, setAllProductsRevenue] = React.useState<TopProductByRevenue[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [errorMessages, setErrorMessages] = React.useState<string[]>([]);

  const [daysPeriod] = React.useState<number | null>(null); // null for all-time

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setAuthUser(user));
  }, [supabase]);

  React.useEffect(() => {
    const fetchPageData = async () => {
      setIsLoading(true);
      setErrorMessages([]);
      let currentErrorMessages: string[] = [];

      if (!storeIdFromUrl) {
        currentErrorMessages.push("No store selected.");
        setIsLoading(false);
        setAllProductsRevenue([]);
        setSelectedStore(null);
        setErrorMessages(currentErrorMessages);
        return;
      }
      if (!authUser) {
        currentErrorMessages.push("Authentication issue.");
        setIsLoading(false);
        setAllProductsRevenue([]);
        setSelectedStore(null);
        setErrorMessages(currentErrorMessages);
        return;
      }

      const storePromise = getStoreById(storeIdFromUrl, authUser.id);
      const productsRevenuePromise = getAllProductsRevenueForStore(storeIdFromUrl, daysPeriod);

      const results = await Promise.allSettled([storePromise, productsRevenuePromise]);
      const [storeResult, productsRevenueResult] = results;

      if (storeResult.status === 'fulfilled') {
        const { data, error } = storeResult.value;
        if (error) currentErrorMessages.push(`Store Details: ${error.message}`);
        setSelectedStore(data);
      } else {
        currentErrorMessages.push(`Store Details: ${(storeResult.reason as Error).message}`);
        setSelectedStore(null);
      }

      if (productsRevenueResult.status === 'fulfilled') {
        const { data, error } = productsRevenueResult.value;
        if (error) currentErrorMessages.push(`All Products Revenue: ${error.message}`);
        setAllProductsRevenue(data || []);
      } else {
        currentErrorMessages.push(`All Products Revenue: ${(productsRevenueResult.reason as Error).message}`);
        setAllProductsRevenue([]);
      }
      
      if (currentErrorMessages.length > 0) {
        setErrorMessages(currentErrorMessages);
        currentErrorMessages.forEach(msg => toast({ variant: "destructive", title: "Data Fetch Error", description: msg, duration: 7000 }));
      }
      setIsLoading(false);
    };

    fetchPageData();
  }, [storeIdFromUrl, authUser, daysPeriod, toast]);

  const storeContextMessage = selectedStore ? ` for ${selectedStore.name}` : storeIdFromUrl ? " for selected store" : "";
  const queryParams = storeIdFromUrl ? `?storeId=${storeIdFromUrl}` : "";

  if (errorMessages.length > 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4">
        <AlertCircle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Revenue Data</h2>
        <div className="text-muted-foreground mb-6 max-w-md space-y-1">
          {errorMessages.map((msg, index) => <p key={index}>{msg}</p>)}
        </div>
        <p className="text-xs text-muted-foreground mb-6 max-w-md">This might be due to a missing or misconfigured RPC function. Please ensure it's created correctly and permissions are granted.</p>
        <Button variant="outline" onClick={() => router.push(`/reports/revenue${queryParams}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Revenue Report
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">All Products Revenue{isLoading && !selectedStore ? <Skeleton className="h-8 w-40 inline-block ml-2" /> : storeContextMessage}</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Revenue Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Revenue Breakdown</CardTitle>
          <CardDescription>
            Revenue generated by each product{storeContextMessage}.
            {daysPeriod !== null ? ` (Last ${daysPeriod} days)` : ' (All Time)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : allProductsRevenue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden sm:table-cell">Image</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Units Sold</TableHead>
                  <TableHead className="text-right hidden md:table-cell">Avg. Price/Unit</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allProductsRevenue.map((product) => (
                  <TableRow key={product.product_id}>
                    <TableCell className="hidden sm:table-cell">
                      <Image
                        src={product.primary_image_url || "https://placehold.co/40x40.png"}
                        alt={product.product_name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover border"
                        data-ai-hint={product.primary_image_data_ai_hint || "product"}
                      />
                    </TableCell>
                    <TableCell>
                      <Link href={`/products/${product.product_id}${queryParams}`} className="font-medium hover:underline">
                        {product.product_name}
                      </Link>
                    </TableCell>
                    <TableCell>{product.product_category}</TableCell>
                    <TableCell className="text-right">ZMW {Number(product.total_revenue_generated).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">{product.units_sold.toLocaleString()}</TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      {product.units_sold > 0 ? `ZMW ${(Number(product.total_revenue_generated) / product.units_sold).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` : "ZMW 0.00"}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/products/${product.product_id}${queryParams}`}>View</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">No product revenue data available for this store or period.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
