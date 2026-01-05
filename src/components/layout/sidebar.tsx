"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LogOut, Settings, Store as StoreIcon, PlusCircle, Download, PanelLeft, ChevronRight, ChevronLeft, ChevronDown } from "lucide-react";

const CollapsibleNavSection = ({
    section,
    isCollapsed,
    pathname,
    getHrefWithStoreId,
    selectedStoreId,
    onMobileClose
}: {
    section: NavSection;
    isCollapsed: boolean;
    pathname: string;
    getHrefWithStoreId: (href: string) => string;
    selectedStoreId: string | null;
    onMobileClose?: () => void;
}) => {
    const [isOpen, setIsOpen] = React.useState(true);

    // When sidebar is collapsed (thin mode), we don't show headers/collapsible behavior in the same way.
    // We just show items as icons.
    if (isCollapsed) {
        return (
            <div>
                <div className="grid gap-1">
                    {section.items.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const isDisabled = !selectedStoreId && item.href !== '/stores' && item.href !== '/settings' && item.href !== '/support';

                        const NavContent = (
                            <Link
                                href={isDisabled ? "#" : getHrefWithStoreId(item.href)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                    isDisabled && "cursor-not-allowed opacity-50",
                                    "justify-center px-2"
                                )}
                                onClick={(e) => {
                                    if (isDisabled) e.preventDefault();
                                    if (onMobileClose) onMobileClose();
                                }}
                            >
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-sidebar-foreground/70")} />
                            </Link>
                        );

                        return (
                            <TooltipProvider key={item.href} delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        {NavContent}
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium bg-secondary text-secondary-foreground border-secondary">
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    })}
                </div>
            </div>
        );
    }

    return (
        <div>
            {section.title && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center justify-between w-full mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors group"
                >
                    <span>{section.title}</span>
                    {isOpen ? (
                        <ChevronDown className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                    ) : (
                        <ChevronRight className="h-3 w-3 opacity-50 group-hover:opacity-100" />
                    )}
                </button>
            )}

            {isOpen && (
                <div className="grid gap-1 animate-in slide-in-from-top-1 duration-200">
                    {section.items.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const isDisabled = !selectedStoreId && item.href !== '/stores' && item.href !== '/settings' && item.href !== '/support';

                        return (
                            <Link
                                key={item.href}
                                href={isDisabled ? "#" : getHrefWithStoreId(item.href)}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                    isDisabled && "cursor-not-allowed opacity-50"
                                )}
                                onClick={(e) => {
                                    if (isDisabled) e.preventDefault();
                                    if (onMobileClose) onMobileClose();
                                }}
                            >
                                <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-primary" : "text-sidebar-foreground/70")} />
                                <span>{item.title}</span>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


import { KioskIcon } from "@/components/icons/KioskIcon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { navSections, type NavSection } from "@/config/nav";
import { signOut } from "@/services/authService";
import type { StoreFromSupabase } from "@/services/storeService";
import type { User as AuthUser } from '@supabase/supabase-js';

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed?: (collapsed: boolean) => void;
    authUser: AuthUser | null;
    vendorProfile: {
        displayName: string | null;
        email: string | null;
        avatarUrl: string | null;
        isSupplier: boolean;
    };
    stores: StoreFromSupabase[];
    selectedStoreId: string | null;
    onStoreChange: (storeId: string) => void;
    isLoadingProfile: boolean;
    isLoadingStores: boolean;
    installPrompt: any;
    onInstallClick: () => void;
    onMobileClose?: () => void;
}

const UserDisplay: React.FC<{
    displayName?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    isLoading: boolean;
    isCollapsed: boolean;
}> = ({ displayName, email, avatarUrl, isLoading, isCollapsed }) => {
    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className={cn("flex flex-col gap-1", isCollapsed && "hidden")}>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
            </div>
        );
    }

    const fallbackName = displayName?.substring(0, 2).toUpperCase() || "VD";

    return (
        <div className={cn("flex items-center gap-3", isCollapsed && "justify-center")}>
            <Avatar className="h-10 w-10 border border-sidebar-border transition-all hover:scale-105">
                <AvatarImage src={avatarUrl || undefined} alt={displayName || "Vendor Avatar"} />
                <AvatarFallback className="bg-primary/10 text-primary">{fallbackName}</AvatarFallback>
            </Avatar>
            <div className={cn("flex flex-col overflow-hidden transition-all duration-300", isCollapsed ? "w-0 opacity-0" : "flex-1 opacity-100")}>
                <span className="text-sm font-medium text-sidebar-foreground truncate">{displayName || "Vendor"}</span>
                <span className="text-xs text-sidebar-foreground/70 truncate">{email || "vendor@example.com"}</span>
            </div>
        </div>
    );
};

const StoreSelector = ({
    stores,
    selectedStoreId,
    onStoreChange,
    isLoading,
    isCollapsed,
}: {
    stores: StoreFromSupabase[];
    selectedStoreId: string | null;
    onStoreChange: (storeId: string) => void;
    isLoading: boolean;
    isCollapsed: boolean;
}) => {
    const router = useRouter();
    const selectedStoreName = stores.find(s => s.id === selectedStoreId)?.name || "Select a store";

    if (isCollapsed) {
        const tooltipText = isLoading ? "Loading..." : (selectedStoreName || (stores.length > 0 ? "Select Store" : "No Stores"));
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-full justify-center text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground my-2" disabled={isLoading || stores.length === 0}>
                            {isLoading && stores.length === 0 ? <Skeleton className="h-5 w-5 rounded-full" /> : <StoreIcon className="h-5 w-5" />}
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{tooltipText}</TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }

    if (isLoading) return <Skeleton className="w-full my-2 h-11" />;

    if (stores.length === 0) {
        return (
            <Link href="/stores" className="w-full my-2">
                <Button variant="outline" className="w-full h-11 text-sm border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border-dashed">
                    <StoreIcon className="h-4 w-4 mr-2 text-sidebar-primary" /> Create a Store
                </Button>
            </Link>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full my-2 h-11 text-sm bg-sidebar-background border-sidebar-border text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:ring-sidebar-ring justify-between px-3 group">
                    <div className="flex items-center gap-2 truncate">
                        <div className="bg-primary/10 p-1 rounded-md text-primary group-hover:text-primary group-hover:bg-primary/20 transition-colors">
                            <StoreIcon className="h-4 w-4" />
                        </div>
                        <span className="truncate font-medium">{selectedStoreName}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuRadioGroup value={selectedStoreId || ""} onValueChange={onStoreChange}>
                    {stores.map((store) => (
                        <DropdownMenuRadioItem key={store.id} value={store.id} className="cursor-pointer">
                            {store.name}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/stores')} className="cursor-pointer text-primary focus:text-primary">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    <span>Create New Store</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export const Sidebar = ({
    isCollapsed,
    setIsCollapsed,
    authUser,
    vendorProfile,
    stores,
    selectedStoreId,
    onStoreChange,
    isLoadingProfile,
    isLoadingStores,
    installPrompt,
    onInstallClick,
    onMobileClose,
}: SidebarProps) => {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = { toast: (props: any) => console.log(props) }; // simplified toast for now, or pass it in. Hook is better used in parent or passed. 
    // Wait, I can import useToast.
    // import { useToast } from "@/hooks/use-toast"; // I'll add this to imports

    const getHrefWithStoreId = (href: string) => {
        const params = new URLSearchParams();
        if (selectedStoreId) params.set("storeId", selectedStoreId);
        if (!selectedStoreId && stores.length > 0) params.set("storeId", stores[0].id); // efficient fallback

        // Some routes might not need storeId or should keep existing params?
        // The original implementation was:
        // const params = new URLSearchParams();
        // if (selectedStoreId) params.set("storeId", selectedStoreId);
        // const queryString = params.toString();
        // return queryString ? `${href}?${queryString}` : href;

        // I will stick to the original logic but cleaner
        if (!selectedStoreId) return href;
        return `${href}?storeId=${selectedStoreId}`;
    };

    const handleLogout = async () => {
        await signOut();
        router.push("/login");
    };

    return (
        <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300">
            {/* Header */}
            <div className="flex h-16 items-center justify-between p-4 flex-shrink-0">
                {!isCollapsed && (
                    <Link href={getHrefWithStoreId("/dashboard")} className="flex items-center gap-2 group transition-all">
                        <div className="bg-primary text-primary-foreground p-1.5 rounded-lg group-hover:scale-110 transition-transform">
                            <KioskIcon className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">E-Ntemba</span>
                    </Link>
                )}
                {setIsCollapsed && (
                    <Button variant="ghost" size="icon" className={cn("ml-auto hidden md:flex text-sidebar-foreground/70 hover:text-sidebar-foreground", isCollapsed && "mx-auto")} onClick={() => setIsCollapsed(!isCollapsed)}>
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
                    </Button>
                )}
            </div>

            <Separator className="bg-sidebar-border/50" />

            {/* Store Selector */}
            {authUser && (
                <div className="px-3 py-2 flex-shrink-0">
                    <StoreSelector stores={stores} selectedStoreId={selectedStoreId} onStoreChange={onStoreChange} isLoading={isLoadingStores} isCollapsed={isCollapsed} />
                </div>
            )}

            {/* Navigation */}
            <ScrollArea className="flex-1 px-3 py-2">
                <nav className="flex flex-col gap-6">
                    {navSections.map((section) => (
                        <CollapsibleNavSection
                            key={section.title || "main"}
                            section={section}
                            isCollapsed={isCollapsed}
                            pathname={pathname}
                            getHrefWithStoreId={getHrefWithStoreId}
                            selectedStoreId={selectedStoreId}
                            onMobileClose={onMobileClose}
                        />
                    ))}
                </nav>
            </ScrollArea>

            <Separator className="bg-sidebar-border/50" />

            {/* Footer / User Profile */}
            <div className="p-3 mt-auto space-y-1">
                {authUser ? (
                    <>
                        {/* Settings Link */}
                        <div className="grid gap-1">
                            <Link
                                href={getHrefWithStoreId('/settings')}
                                className={cn(
                                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                    pathname.startsWith('/settings') && "bg-sidebar-accent text-sidebar-accent-foreground",
                                    isCollapsed && "justify-center px-2"
                                )}
                                onClick={() => onMobileClose && onMobileClose()}
                            >
                                <Settings className="h-5 w-5" />
                                {!isCollapsed && <span>Settings</span>}
                            </Link>
                            {installPrompt && (
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                                        isCollapsed && "justify-center px-2"
                                    )}
                                    onClick={onInstallClick}
                                >
                                    <Download className="h-5 w-5" />
                                    {!isCollapsed && <span>Install App</span>}
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                className={cn(
                                    "w-full justify-start gap-3 px-3 py-2 text-sm font-medium text-destructive/70 hover:text-destructive hover:bg-destructive/10",
                                    isCollapsed && "justify-center px-2"
                                )}
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                                {!isCollapsed && <span>Logout</span>}
                            </Button>
                        </div>

                        {!isCollapsed && <Separator className="my-2 bg-sidebar-border/50" />}

                        <UserDisplay displayName={vendorProfile.displayName} email={vendorProfile.email} avatarUrl={vendorProfile.avatarUrl} isLoading={isLoadingProfile} isCollapsed={isCollapsed} />
                    </>
                ) : (
                    !isLoadingProfile && (
                        <Link href="/login" className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-all", isCollapsed && "justify-center")}>
                            <LogOut className="h-5 w-5" /><span className={cn(isCollapsed && "hidden")}>Login</span>
                        </Link>
                    )
                )}
            </div>
        </div>
    );
};
