import { getStoreByEmail } from "@/services/storeService";
import { getProductsByStoreId } from "@/services/productService";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ShoppingBag, Star, Info } from "lucide-react";

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
        <div className="min-h-screen bg-gray-50/50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8 md:py-12">
                    <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        {store.logo_url ? (
                            <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-full overflow-hidden border-4 border-white shadow-lg shrink-0">
                                <Image
                                    src={store.logo_url}
                                    alt={store.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-white shadow-lg shrink-0">
                                {store.name.substring(0, 2).toUpperCase()}
                            </div>
                        )}

                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">{store.name}</h1>
                            {store.description && (
                                <p className="text-lg text-muted-foreground max-w-2xl">{store.description}</p>
                            )}
                            <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-2">
                                {store.location && (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
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
                        <h2 className="text-xl font-semibold text-gray-900">No products available</h2>
                        <p className="text-muted-foreground">Check back soon for new arrivals.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <Card key={product.id} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full bg-white">
                                {/* Image Container */}
                                <div className="relative aspect-square overflow-hidden bg-gray-100">
                                    {product.product_images && product.product_images[0] ? (
                                        <Image
                                            src={product.product_images[0].image_url}
                                            alt={product.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                            <ShoppingBag className="h-12 w-12 opacity-20" />
                                        </div>
                                    )}
                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <span className="bg-black text-white px-3 py-1 text-sm font-medium rounded-full">Out of Stock</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <CardContent className="p-5 flex-1 flex flex-col space-y-3">
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground capitalize">{product.category}</p>
                                    </div>

                                    <div className="flex items-baseline gap-2 pt-2">
                                        <span className="text-xl font-bold text-gray-900">
                                            ZMW {product.price.toLocaleString()}
                                        </span>
                                    </div>

                                    {/* Commission/Profit Display */}
                                    {product.order_price !== null && product.order_price !== undefined && (
                                        <div className="flex flex-col gap-1 p-3 bg-primary/5 rounded-xl border border-primary/20 shadow-sm">
                                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                <span>Your Commission</span>
                                                <span className="font-bold text-primary">Profit</span>
                                            </div>
                                            <div className="flex items-baseline justify-between">
                                                <span className="text-lg font-black text-primary">
                                                    ZMW {(product.price - product.order_price).toLocaleString()}
                                                </span>
                                                <span className="text-[10px] font-medium px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full">
                                                    {Math.round(((product.price - product.order_price) / product.price) * 100)}% Margin
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Fallback Legacy Commission Badge */}
                                    {(!product.order_price && ((product.attributes && product.attributes['commission']) || store.commission_rate)) && (
                                        <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 w-fit px-2 py-1 rounded-md border border-primary/20">
                                            <Star className="h-3 w-3 fill-current" />
                                            <span>
                                                Commission: {product.attributes?.['commission'] || (store.commission_rate ? `${store.commission_rate}%` : '')}
                                            </span>
                                        </div>
                                    )}

                                    {product.stock > 0 && product.stock < 10 && (
                                        <p className="text-xs text-amber-600 font-medium pt-1">
                                            Only {product.stock} left in stock
                                        </p>
                                    )}
                                </CardContent>

                                <CardFooter className="p-5 pt-0 mt-auto">
                                    <Button className="w-full font-semibold shadow-sm" size="lg">
                                        Ready to Buy
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
