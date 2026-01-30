import { getStoreByEmail } from "@/services/storeService";
import { getProductsByStoreId } from "@/services/productService";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingBag, Star, Info, Package } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
    const targetEmail = 'entemba.shop@gmail.com';
    const { data: store, error: storeError } = await getStoreByEmail(targetEmail);

    if (storeError || !store) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Store Not Found</h1>
                <p className="text-muted-foreground">Could not locate the store for {targetEmail}.</p>
            </div>
        );
    }

    const { data: products, error: productsError } = await getProductsByStoreId(store.id, 1, 100);

    if (productsError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
                <h1 className="text-2xl font-bold mb-2">Error Loading Products</h1>
                <p className="text-muted-foreground">Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-card border-b border-border/40">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {store.logo_url ? (
                            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-primary/20 shadow-2xl shrink-0">
                                <Image
                                    src={store.logo_url}
                                    alt={store.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-primary/20 shadow-2xl shrink-0">
                                {store.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">{store.name}</h1>
                            {store.description && (
                                <p className="text-lg text-muted-foreground max-w-2xl">{store.description}</p>
                            )}
                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-2">
                                {store.location && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                        {store.location}
                                    </span>
                                )}
                                <span>•</span>
                                <span>{products?.length || 0} Products</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="container mx-auto px-4 py-12">
                {!products || products.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h2 className="text-xl font-semibold text-foreground">No products available</h2>
                        <p className="text-muted-foreground">Check back soon for new arrivals.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => {
                            // Calculate Profit Amount
                            let profitAmount = 0;
                            let profitMargin = 0;
                            const hasWholesale = product.order_price !== null && product.order_price !== undefined;

                            if (hasWholesale) {
                                profitAmount = Number(product.price) - Number(product.order_price);
                                profitMargin = Math.round((profitAmount / Number(product.price)) * 100);
                            } else if (store.commission_rate) {
                                profitAmount = Number(product.price) * (Number(store.commission_rate) / 100);
                                profitMargin = Number(store.commission_rate);
                            } else if (product.attributes?.commission) {
                                const comm = product.attributes.commission;
                                if (typeof comm === 'string' && comm.includes('%')) {
                                    profitMargin = parseFloat(comm);
                                    profitAmount = Number(product.price) * (profitMargin / 100);
                                } else {
                                    profitAmount = parseFloat(comm.toString().replace(/[^0-9.]/g, ''));
                                    profitMargin = Math.round((profitAmount / Number(product.price)) * 100);
                                }
                            }

                            return (
                                <Card key={product.id} className="group overflow-hidden border border-border/40 shadow-xl hover:shadow-2xl hover:border-primary/30 transition-all duration-500 flex flex-col h-full bg-card/50 backdrop-blur-sm">
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden bg-muted">
                                        {product.product_images && product.product_images.length > 0 ? (
                                            <Image
                                                src={product.product_images[0].image_url}
                                                alt={product.name}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-primary/5">
                                                <Package className="h-12 w-12 opacity-20" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Commission Badge on Image */}
                                        {profitAmount > 0 && (
                                            <div className="absolute top-3 right-3 z-10 animate-in fade-in zoom-in duration-500">
                                                <div className="bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-tighter px-2.5 py-1 rounded shadow-2xl border border-white/20">
                                                    Earn ZMW {profitAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </div>
                                            </div>
                                        )}

                                        {product.stock <= 0 && (
                                            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
                                                <span className="bg-destructive text-destructive-foreground px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full shadow-xl">Out of Stock</span>
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-5 flex-1 flex flex-col space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-start gap-2">
                                                <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                    {product.name}
                                                </h3>
                                            </div>
                                            <p className="text-xs font-semibold text-primary/60 uppercase tracking-widest">{product.category}</p>
                                        </div>

                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-black text-foreground">
                                                ZMW {Number(product.price).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Commission/Profit Display */}
                                        {profitAmount > 0 && (
                                            <div className="flex flex-col gap-1.5 p-4 bg-primary/10 rounded-2xl border border-primary/20 shadow-inner group-hover:bg-primary/15 transition-colors">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-primary/80">
                                                    <span>COMMISSION</span>
                                                    <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded-full shadow-sm">
                                                        {profitMargin}% MARGIN
                                                    </span>
                                                </div>
                                                <div className="flex items-baseline justify-between">
                                                    <span className="text-2xl font-black text-primary">
                                                        ZMW {profitAmount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {product.stock > 0 && product.stock < 10 && (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-destructive/80 bg-destructive/5 w-fit px-2 py-1 rounded-lg">
                                                <div className="w-1 h-1 rounded-full bg-destructive animate-ping" />
                                                Only {product.stock} left in stock
                                            </div>
                                        )}
                                    </CardContent>

                                    <CardFooter className="p-5 pt-0 mt-auto">
                                        <Button className="w-full font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300" size="lg">
                                            Ready to Buy
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
