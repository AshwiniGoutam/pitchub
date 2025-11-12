"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  Briefcase,
  TrendingUp,
  Users,
  Settings,
  DatabaseIcon,
  TrendingUpIcon,
  ShoppingBag,
  LogOut,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

const navigation = [
  { name: "Dashboard", href: "/dashboard/investor", icon: LayoutDashboard },
  { name: "Inbox", href: "/dashboard/investor/inbox", icon: Inbox },
  { name: "Deals", href: "/dashboard/investor/startups", icon: Briefcase },
  {
    name: "Pitch Connect",
    href: "/dashboard/investor/pitch-connect",
    icon: Mail,
  },
  {
    name: "Market Research",
    href: "/dashboard/investor/market-research",
    icon: TrendingUp,
  },
  { name: "Settings", href: "/dashboard/investor/settings", icon: Settings },
  {
    name: "Portfolio",
    href: "/portfolio",
    icon: ShoppingBag,
    badge: "Coming Soon",
  },
  { name: "Community", href: "/community", icon: Users, badge: "Coming Soon" },
];

export function InvestorSidebar() {
  const pathname = usePathname();

  const { data: session } = useSession();
  // console.log(session);

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        {/* <img src="/images/logo.png" alt="logo" width="120px" /> */}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary-light text-primary"
                  : "text-priamry hover:bg-gray-50"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-auto rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="border-t p-4">
        <div
          className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-gray-50"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700">Logout</span>
        </div>
        <div className="mt-0 flex items-center gap-3 rounded-lg px-2 py-2">
          {/* <Avatar className="h-8 w-8">
            <AvatarImage src={session?.user?.image}/>
            <AvatarFallback>OR</AvatarFallback>
          </Avatar> */}
          {/* {session && (
            <img
              src={(session && session.user.image) ?? undefined}
              alt="User Image"
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.onerror = null;
                target.src = "/images/dummy-user.png";
              }}
            />
          )} */}
          <div className="flex-1 text-sm">
            <p className="font-medium text-gray-900">{session?.user?.name}</p>
            <p className="text-xs text-gray-500">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
