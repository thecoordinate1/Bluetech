
"use client";

"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import type { User as AuthUser } from '@supabase/supabase-js';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { navItems } from "@/config/nav";
import { Menu, PlusCircle } from "lucide-react";
import { KioskIcon } from "@/components/icons/KioskIcon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/services/authService";
import { getCurrentVendorProfile } from "@/services/userService";
import { getStoresByUserId, type StoreFromSupabase } from "@/services/storeService";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { NotificationsMenu } from "@/components/NotificationsMenu";
import { Sidebar } from "@/components/layout/sidebar";


function AppShellLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const [selectedStoreId, setSelectedStoreId] = React.useState<string | null>(null);
  const [availableStores, setAvailableStores] = React.useState<StoreFromSupabase[]>([]);
  const [isLoadingStores, setIsLoadingStores] = React.useState(true);

  const [authUser, setAuthUser] = React.useState<AuthUser | null>(null);
  const [vendorDisplayName, setVendorDisplayName] = React.useState<string | null>(null);
  const [vendorEmail, setVendorEmail] = React.useState<string | null>(null);
  const [vendorAvatarUrl, setVendorAvatarUrl] = React.useState<string | null>(null);
  const [isSupplier, setIsSupplier] = React.useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [pageTitle, setPageTitle] = React.useState("Loading...");

  const [installPrompt, setInstallPrompt] = React.useState<any>(null);

  const supabase = createClient();

  const fetchInitialUserData = React.useCallback(async (user: AuthUser) => {
    setIsLoadingProfile(true);
    setIsLoadingStores(true);

    const profilePromise = getCurrentVendorProfile(user.id);
    const storesPromise = getStoresByUserId(user.id);

    const [profileResult, storesResult] = await Promise.allSettled([profilePromise, storesPromise]);

    if (profileResult.status === 'fulfilled') {
      const { profile, error } = profileResult.value;
      if (profile) {
        setVendorDisplayName(profile.display_name); setVendorEmail(profile.email); setVendorAvatarUrl(profile.avatar_url);
        setIsSupplier(!!profile.is_supplier);
      } else {
        setVendorDisplayName(user.user_metadata?.display_name || user.email || null);
        setVendorEmail(user.email || null); setVendorAvatarUrl(user.user_metadata?.avatar_url || null);
        setIsSupplier(false);
        if (error) console.warn("Error fetching vendor profile:", (error as Error).message);
      }
    } else {
      console.error("Failed to fetch profile:", profileResult.reason);
    }
    setIsLoadingProfile(false);

    if (storesResult.status === 'fulfilled') {
      const { data, error } = storesResult.value;
      if (error) toast({ variant: "destructive", title: "Error fetching stores", description: error.message });
      setAvailableStores(data || []);
    } else {
      console.error("Failed to fetch stores:", storesResult.reason);
    }
    setIsLoadingStores(false);
  }, [toast]);

  React.useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Effect for Auth changes
  React.useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setAuthUser(currentUser);
      if (event === "SIGNED_IN" && currentUser) {
        fetchInitialUserData(currentUser);
      } else if (event === 'SIGNED_OUT') {
        setVendorDisplayName(null); setVendorEmail(null); setVendorAvatarUrl(null);
        setAvailableStores([]); setSelectedStoreId(null);
        setIsLoadingProfile(false); setIsLoadingStores(false);
        setIsSupplier(false);
      } else if (event === 'USER_UPDATED' && currentUser) {
        setVendorDisplayName(currentUser.user_metadata.display_name || currentUser.email);
        setVendorAvatarUrl(currentUser.user_metadata.avatar_url);
        // We might want to re-fetch profile here if is_supplier depends on metadata, but it's in DB
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      setAuthUser(user);
      if (user) {
        fetchInitialUserData(user);
      } else {
        setIsLoadingProfile(false); setIsLoadingStores(false);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase, fetchInitialUserData]);

  React.useEffect(() => {
    // Only run this logic if we have finished loading stores.
    if (isLoadingStores) {
      return;
    }

    const storeIdFromUrl = searchParams.get("storeId");

    if (availableStores.length > 0) {
      // If there's a valid store ID in the URL, use it.
      if (storeIdFromUrl && availableStores.some(s => s.id === storeIdFromUrl)) {
        if (selectedStoreId !== storeIdFromUrl) {
          setSelectedStoreId(storeIdFromUrl);
        }
      } else {
        // Otherwise, default to the first store and update the URL.
        const firstStoreId = availableStores[0].id;
        if (selectedStoreId !== firstStoreId) {
          setSelectedStoreId(firstStoreId);
          const newParams = new URLSearchParams(searchParams.toString());
          newParams.set("storeId", firstStoreId);
          // Use replace to avoid polluting browser history on initial load.
          router.replace(`${pathname}?${newParams.toString()}`, { scroll: false });
        }
      }
    } else {
      // If the user has no stores, clear the selected store and redirect if they are on the dashboard.
      setSelectedStoreId(null);
      if (pathname === '/dashboard') {
        router.replace('/stores');
      }
    }
  }, [searchParams, availableStores, pathname, router, isLoadingStores, selectedStoreId]);


  React.useEffect(() => {
    const currentNavItem = navItems.find(item => pathname.startsWith(item.href));
    const baseTitle = currentNavItem?.title || "E-Ntemba";
    const store = availableStores.find(s => s.id === selectedStoreId);
    const newTitle = store ? `${store.name} - ${baseTitle}` : baseTitle;

    setPageTitle(newTitle);
    if (typeof window !== 'undefined') {
      document.title = `${newTitle} | E-Ntemba`;
    }
  }, [pathname, selectedStoreId, availableStores]);


  const handleStoreChange = (storeId: string) => {
    setSelectedStoreId(storeId);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set("storeId", storeId);
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleInstallClick = async () => {
    if (!installPrompt) {
      return;
    }
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      toast({ title: "Installation Complete", description: "E-Ntemba has been added to your device." });
    }
    setInstallPrompt(null);
  };

  const isLoadingOverall = isLoadingProfile || isLoadingStores;

  // Reusing Sidebar props 
  const sidebarProps = {
    isCollapsed: isSidebarCollapsed,
    setIsCollapsed: setIsSidebarCollapsed,
    authUser,
    vendorProfile: {
      displayName: vendorDisplayName,
      email: vendorEmail,
      avatarUrl: vendorAvatarUrl,
      isSupplier
    },
    stores: availableStores,
    selectedStoreId,
    onStoreChange: handleStoreChange,
    isLoadingProfile,
    isLoadingStores,
    installPrompt,
    onInstallClick: handleInstallClick
  };

  return (
    <div className="flex min-h-screen w-full bg-muted/30">
      {/* Desktop Sidebar */}
      <aside data-state="sticky" className={cn("hidden md:block bg-sidebar transition-all duration-300 fixed top-0 left-0 z-20 h-full", isSidebarCollapsed ? "w-20" : "w-64")}>
        <Sidebar {...sidebarProps} />
      </aside>

      {/* Main Content Wrapper */}
      <div className={cn("flex flex-col flex-1 transition-all duration-300", isSidebarCollapsed ? "md:pl-20" : "md:pl-64")}>
        <div className="relative flex h-full max-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:h-20 sm:px-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[85vw] max-w-xs bg-sidebar text-sidebar-foreground border-r-sidebar-border">
                <SheetHeader>
                  <SheetTitle className="sr-only">Main Menu</SheetTitle>
                </SheetHeader>
                <Sidebar {...sidebarProps} isCollapsed={false} setIsCollapsed={undefined} onMobileClose={() => setIsMobileMenuOpen(false)} />
              </SheetContent>
            </Sheet>

            <h1 className="text-lg sm:text-xl font-semibold truncate flex-1 md:flex-none">
              {isLoadingOverall ? "Loading..." : pageTitle}
            </h1>

            <div className="flex-1 hidden md:block" /> {/* Spacer */}

            <div className="flex items-center gap-2">
              <NotificationsMenu />
              {selectedStoreId && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" className="hidden sm:flex gap-1 h-9 rounded-full px-3 shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105 active:scale-95">
                      <PlusCircle className="h-4 w-4" />
                      <span>Create</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => router.push(`/orders?storeId=${selectedStoreId}&action=new`)}>
                      <Menu className="mr-2 h-4 w-4" /> New Order
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/products/new?storeId=${selectedStoreId}`)}>
                      <PlusCircle className="mr-2 h-4 w-4" /> New Product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </header>

          <main className={cn("flex-1 w-full max-w-full overflow-x-hidden p-4 sm:p-6", isSupplier ? "theme-supplier" : "")}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


export function AppShell({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <KioskIcon className="h-10 w-10 text-primary animate-pulse" />
      </div>
    );
  }

  return <AppShellLayout>{children}</AppShellLayout>;
}
