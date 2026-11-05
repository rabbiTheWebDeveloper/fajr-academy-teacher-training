'use client';

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  ChevronsUpDown,
  CreditCard,
  ExternalLink,
  FolderOpen,
  GraduationCap,
  Globe,
  LayoutDashboard,
  LogOut,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  Users,
  Video,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePanelTheme } from "./PanelThemeContext";

/**
 * One shell for the admin and the instructor panel: shadcn Sidebar (collapses to icons on
 * desktop, a sheet on phones), a gradient top bar, and a user menu. Nav items name their icon
 * by key because the layouts are server components and cannot pass component functions.
 */
const ICONS = {
  dashboard: LayoutDashboard,
  trainees: Users,
  payments: CreditCard,
  courses: BookOpen,
  instructors: GraduationCap,
  evaluations: Award,
  users: ShieldCheck,
  settings: Settings,
  resources: FolderOpen,
  live: Video,
  website: Globe,
  portal: ExternalLink,
};

// Sidebar entry: rounded pill; the active one gets the violet gradient from the theme.
const NAV_BUTTON =
  "h-10 gap-3 rounded-xl px-3 text-[13px] font-semibold [&>svg]:size-[18px] " +
  "data-[active=true]:bg-[image:var(--panel-nav-active)] data-[active=true]:font-bold data-[active=true]:text-white " +
  "data-[active=true]:hover:text-white data-[active=true]:shadow-[0_10px_20px_-10px_rgba(109,74,232,0.85)]";

function UserMenu({ user, menuLinks, onLogout, isLight, toggleTheme }) {
  const { isMobile } = useSidebar();
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" className="rounded-xl data-[state=open]:bg-sidebar-accent">
          <UserAvatar user={user} initial={initial} className="size-8 rounded-lg" />
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate text-[13px] font-bold">{user.name}</span>
            <span className="truncate text-[11px] text-sidebar-foreground/60">{user.roleLabel}</span>
          </div>
          <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/50" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" sideOffset={10} className="min-w-60 rounded-xl">
        <DropdownMenuLabel className="flex items-center gap-2.5 p-2">
          <UserAvatar user={user} initial={initial} className="size-9 rounded-lg" />
          <div className="grid min-w-0 text-left leading-tight">
            <span className="truncate text-sm font-bold">{user.name}</span>
            <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {menuLinks.map((l) => {
          const Icon = ICONS[l.icon] || ExternalLink;
          return (
            <DropdownMenuItem key={l.href} asChild className="cursor-pointer gap-2.5 rounded-lg text-[13px] font-medium">
              <Link href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener noreferrer" : undefined}>
                <Icon className="size-4" /> {l.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
        <DropdownMenuItem onSelect={toggleTheme} className="cursor-pointer gap-2.5 rounded-lg text-[13px] font-medium">
          {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
          {isLight ? "ডার্ক মোডে যান" : "লাইট মোডে যান"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onLogout}
          className="cursor-pointer gap-2.5 rounded-lg text-[13px] font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700"
        >
          <LogOut className="size-4" /> লগআউট
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function UserAvatar({ user, initial, className = "" }) {
  if (user.avatar) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={user.avatar} alt="" className={`${className} object-cover`} />;
  }
  return (
    <span className={`${className} flex shrink-0 items-center justify-center bg-gradient-to-br from-violet-400 to-violet-600 text-sm font-black text-white`}>
      {initial}
    </span>
  );
}

/**
 * @param brand        { name, tagline, portal, href }
 * @param navGroups    [{ label, items: [{ href, label, icon, exact? }] }]
 * @param user         { name, email, roleLabel, avatar? }
 * @param menuLinks    [{ href, label, icon, external? }]   extra entries in the user menu
 * @param defaultOpen  sidebar expanded on first paint (read from the shadcn cookie by the layout)
 */
export default function PanelShell({ brand, navGroups, user, menuLinks = [], defaultOpen = true, footerText, contentClassName = "max-w-7xl", children }) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { isLight, toggleTheme } = usePanelTheme();
  const [logoutError, setLogoutError] = useState("");

  const isActive = (item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const activeItem = navGroups.flatMap((g) => g.items).find(isActive);
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    setLogoutError("");
    try {
      // POST, not a link: a GET could be prefetched and log the user out silently.
      const res = await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError("লগআউট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।");
      setTimeout(() => setLogoutError(""), 6000);
    }
  };

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className={`panel-root font-sans antialiased ${isLight ? "theme-light" : "theme-dark"}`}
    >
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="px-3 pt-4 pb-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild tooltip={brand.name} className="rounded-xl hover:bg-transparent active:bg-transparent">
                <Link href={brand.href}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/fajr-logo.png" alt="Fajr Academy" className="size-8 shrink-0 rounded-xl border border-violet-300/50 object-cover shadow-md shadow-violet-500/25" />
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="font-serif text-[15px] font-black tracking-tight">{brand.name}</span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-500">{brand.tagline}</span>
                  </div>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="px-1">
          {navGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/45">{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map((item) => {
                    const Icon = ICONS[item.icon] || LayoutDashboard;
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={isActive(item)} tooltip={item.label} className={NAV_BUTTON}>
                          <Link href={item.href}>
                            <Icon />
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="px-3 pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <UserMenu user={user} menuLinks={menuLinks} onLogout={handleLogout} isLight={isLight} toggleTheme={toggleTheme} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0">
        {/* Gradient top bar */}
        <header className="panel-header sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 px-4 sm:px-6">
          <SidebarTrigger className="panel-glass size-9 rounded-xl text-white hover:text-white" aria-label="সাইডবার খুলুন / বন্ধ করুন" />
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{brand.portal}</div>
            <div className="truncate text-sm font-black text-white sm:text-base">{activeItem?.label || brand.tagline}</div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            title={isLight ? "ডার্ক মোডে যান" : "লাইট মোডে যান"}
            aria-label={isLight ? "ডার্ক মোডে যান" : "লাইট মোডে যান"}
            className="panel-glass inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl"
          >
            {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          {user.roleLabel && (
            <span title="আপনার রোল" className="panel-glass hidden shrink-0 rounded-full px-3 py-1 text-[11px] font-black md:inline-flex">
              {user.roleLabel}
            </span>
          )}

          <div className="flex shrink-0 items-center gap-2.5">
            <div className="hidden text-right leading-tight lg:block">
              <div className="max-w-44 truncate text-xs font-black text-white">{user.name}</div>
              <div className="max-w-44 truncate font-mono text-[10px] text-white/70">{user.email}</div>
            </div>
            <UserAvatar user={user} initial={initial} className="size-9 rounded-xl border border-white/40 shadow-md" />
          </div>
        </header>

        <div className="panel-content flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className={`mx-auto w-full ${contentClassName}`}>{children}</div>
        </div>

        {footerText && (
          <footer className="border-t border-sidebar-border bg-sidebar px-6 py-4 text-center text-xs font-medium text-muted-foreground">{footerText}</footer>
        )}

        {logoutError && (
          <div role="alert" className="fixed bottom-6 right-6 z-80 max-w-sm rounded-2xl border border-rose-700 bg-rose-900 px-4 py-3 text-xs font-bold text-white shadow-2xl">
            {logoutError}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
