import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Package, ShoppingCart, Store, Users, Truck, Globe, Factory, Tag, LifeBuoy, MessageSquare, Bell } from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
  external?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Orders",
        href: "/orders",
        icon: ShoppingCart,
      },
      {
        title: "Products",
        href: "/products",
        icon: Package,
      },
      {
        title: "Delivery",
        href: "/delivery",
        icon: Truck,
      },
      {
        title: "Customers",
        href: "/customers",
        icon: Users,
      },
      {
        title: "Returns", // Adding a place holder for returns if needed, but for now stick to existing
        href: "/reviews", // Reviews kind of fits in operations or support. The user said "Reviews" previously.
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Growth",
    items: [
      {
        title: "Marketing",
        href: "/marketing",
        icon: Tag,
      },
      {
        title: "Marketplace",
        href: "/market",
        icon: Globe,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Stores",
        href: "/stores",
        icon: Store,
      },
      {
        title: "Supplier",
        href: "/supplier",
        icon: Factory,
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        title: "Notifications",
        href: "/notifications",
        icon: Bell,
      },
      {
        title: "Help Center",
        href: "/support",
        icon: LifeBuoy,
      },
    ],
  },
];

export const navItems: NavItem[] = navSections.flatMap((section) => section.items);
