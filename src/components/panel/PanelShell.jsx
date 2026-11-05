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
  LayoutGrid,
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
import PushBell from "@/components/push/PushBell";
import { forgetPushOnThisDevice } from "@/components/push/usePushNotifications";

/**
 * One shell for the admin and the instructor panel, built to feel like a native app on phones:
 *
 *   ≥ 1024px  shadcn Sidebar (collapses to icons) + gradient top bar
 *   < 1024px  compact top bar, a floating bottom tab bar, and the full menu as a slide-in sheet
 *             (the "মেনু" tab). Safe-area insets keep it clear of notches and home bars.
 *
 * The 1024 breakpoint matches `useIsMobile` (src/hooks/use-mobile.ts) and the media queries in
 * panel-theme.css. Nav items name their icon by key because the layouts are server components
 * and cannot pass component functions.
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

// Sidebar entry: rounded pill (taller on touch); the active one gets the violet gradient from the theme.
const NAV_BUTTON =
  "h-11 gap-3 rounded-xl px-3 text-[13px] font-semibold lg:h-10 [&>svg]:size-[18px] " +
  "data-[active=true]:bg-[image:var(--panel-nav-active)] data-[active=true]:font-bold data-[active=true]:text-white " +
  "data-[active=true]:hover:text-white data-[active=true]:shadow-[0_10px_20px_-10px_rgba(109,74,232,0.85)]";

const MAX_TABS = 5; // tab bar slots, including "মেনু" when it is needed

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

/** Menu items shared by the sidebar footer (desktop) and the header avatar (phones). */
function UserMenuBody({ user, initial, menuLinks, onLogout, isLight, toggleTheme }) {
  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2.5 p-2">
        <UserAvatar user={user} initial={initial} className="size-9 rounded-lg" />
        <div className="grid min-w-0 text-left leading-tight">
          <span className="truncate text-sm font-bold">{user.name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
          {user.roleLabel && <span className="truncate text-[11px] font-semibold text-violet-500">{user.roleLabel}</span>}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      {menuLinks.map((l) => {
        const Icon = ICONS[l.icon] || ExternalLink;
        return (
          <DropdownMenuItem key={l.href} asChild className="cursor-pointer gap-2.5 rounded-lg py-2.5 text-[13px] font-medium">
            <Link href={l.href} target={l.external ? "_blank" : undefined} rel={l.external ? "noopener noreferrer" : undefined}>
              <Icon className="size-4" /> {l.label}
            </Link>
          </DropdownMenuItem>
        );
      })}
      <DropdownMenuItem onSelect={toggleTheme} className="cursor-pointer gap-2.5 rounded-lg py-2.5 text-[13px] font-medium">
        {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
        {isLight ? "ডার্ক মোডে যান" : "লাইট মোডে যান"}
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onSelect={onLogout}
        className="cursor-pointer gap-2.5 rounded-lg py-2.5 text-[13px] font-bold text-rose-600 focus:bg-rose-50 focus:text-rose-700"
      >
        <LogOut className="size-4" /> লগআউট
      </DropdownMenuItem>
    </>
  );
}

/** Desktop: the user card at the bottom of the sidebar. */
function SidebarUserMenu(props) {
  const { isMobile } = useSidebar();
  const { user, initial } = props;
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
        <UserMenuBody {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Phones: the avatar in the header opens the same menu. */
function HeaderUserMenu(props) {
  const { user, initial } = props;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="অ্যাকাউন্ট মেনু"
          className="panel-glass flex size-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-2xl p-0 active:scale-95 lg:hidden"
        >
          <UserAvatar user={user} initial={initial} className="size-full rounded-none bg-transparent" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" sideOffset={10} className="min-w-64 rounded-2xl">
        <UserMenuBody {...props} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Phones and tablets in portrait: a floating tab bar like a native app. With few items they all fit;
 * otherwise the items marked `primary` get a tab and the rest live behind the "মেনু" tab, which
 * opens the full slide-in menu.
 */
function MobileTabBar({ items, isActive }) {
  const { setOpenMobile } = useSidebar();
  const fitsAll = items.length <= MAX_TABS;
  const marked = items.filter((i) => i.primary);
  const tabs = fitsAll ? items : (marked.length >= 2 ? marked : items).slice(0, MAX_TABS - 1);
  const activeInTabs = tabs.some(isActive);

  const tabBase =
    "flex min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-[10px] font-bold leading-tight transition-all active:scale-95";
  const tabIdle = "text-sidebar-foreground/65 active:bg-sidebar-accent";
  const tabOn = "bg-[image:var(--panel-nav-active)] text-white shadow-[0_8px_18px_-8px_rgba(109,74,232,0.9)]";

  return (
    <nav
      aria-label="প্রধান মেনু"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))] pr-[max(0.75rem,env(safe-area-inset-right))] lg:hidden"
    >
      <div className="pointer-events-auto mx-auto flex max-w-lg items-stretch gap-1 rounded-[1.6rem] border border-sidebar-border bg-sidebar/90 p-1.5 shadow-[0_18px_40px_-14px_rgba(76,48,170,0.5)] backdrop-blur-xl">
        {tabs.map((item) => {
          const Icon = ICONS[item.icon] || LayoutDashboard;
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`${tabBase} ${active ? tabOn : tabIdle}`}>
              <Icon className="size-5" />
              <span className="max-w-full truncate">{item.short || item.label}</span>
            </Link>
          );
        })}
        {!fitsAll && (
          <button type="button" onClick={() => setOpenMobile(true)} aria-label="সম্পূর্ণ মেনু খুলুন" className={`${tabBase} ${activeInTabs ? tabIdle : tabOn}`}>
            <LayoutGrid className="size-5" />
            <span>মেনু</span>
          </button>
        )}
      </div>
    </nav>
  );
}

/**
 * @param brand        { name, tagline, portal, href }
 * @param navGroups    [{ label, items: [{ href, label, short?, icon, exact?, primary? }] }]
 *                       `short` = tab-bar label, `primary` = gets a tab on phones
 * @param user         { name, email, roleLabel, avatar? }
 * @param menuLinks    [{ href, label, icon, external? }]   extra entries in the user menu
 * @param defaultOpen  sidebar expanded on first paint (read from the shadcn cookie by the layout)
 * @param pushTopics   what this panel's push notifications are about (header bell text)
 * @param pushSetupHint show the bell even when the server has no VAPID keys yet (admins)
 */
export default function PanelShell({
  brand,
  navGroups,
  user,
  menuLinks = [],
  defaultOpen = true,
  footerText,
  contentClassName = "max-w-7xl",
  pushTopics,
  pushSetupHint = false,
  children,
}) {
  const pathname = usePathname() || "";
  const router = useRouter();
  const { isLight, toggleTheme } = usePanelTheme();
  const [logoutError, setLogoutError] = useState("");

  const isActive = (item) => (item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`));
  const allItems = navGroups.flatMap((g) => g.items);
  const activeItem = allItems.find(isActive);
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  const handleLogout = async () => {
    setLogoutError("");
    try {
      await forgetPushOnThisDevice(); // the next person on this device must not get this account's notifications
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

  const menuProps = { user, initial, menuLinks, onLogout: handleLogout, isLight, toggleTheme };

  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      className={`panel-root font-sans antialiased ${isLight ? "theme-light" : "theme-dark"}`}
    >
      <Sidebar collapsible="icon" variant="sidebar">
        <SidebarHeader className="px-3 pb-2 pt-[max(1rem,env(safe-area-inset-top))]">
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

        <SidebarFooter className="px-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarUserMenu {...menuProps} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="min-w-0 pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
        {/* Gradient top bar — compact on phones (logo · title · avatar), full on desktop */}
        <header className="panel-header sticky top-0 z-30 flex h-[calc(3.5rem_+_env(safe-area-inset-top))] shrink-0 items-center gap-3 px-4 pt-[env(safe-area-inset-top)] sm:px-6 lg:h-16 lg:pt-0">
          <SidebarTrigger className="panel-glass hidden size-9 rounded-xl text-white hover:text-white lg:inline-flex" aria-label="সাইডবার খুলুন / বন্ধ করুন" />
          <Link href={brand.href} aria-label={brand.name} className="shrink-0 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/fajr-logo.png" alt="" className="size-9 rounded-xl border border-white/40 object-cover shadow-md" />
          </Link>
          <div className="min-w-0 flex-1 leading-tight">
            <div className="truncate text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">{brand.portal}</div>
            <div className="truncate text-[15px] font-black text-white sm:text-base">{activeItem?.label || brand.tagline}</div>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            title={isLight ? "ডার্ক মোডে যান" : "লাইট মোডে যান"}
            aria-label={isLight ? "ডার্ক মোডে যান" : "লাইট মোডে যান"}
            className="panel-glass hidden size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl lg:inline-flex"
          >
            {isLight ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>

          {user.roleLabel && (
            <span title="আপনার রোল" className="panel-glass hidden shrink-0 rounded-full px-3 py-1 text-[11px] font-black md:inline-flex">
              {user.roleLabel}
            </span>
          )}

          {pushTopics && <PushBell variant="panel" topics={pushTopics} showWhenUnconfigured={pushSetupHint} />}

          <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
            <div className="text-right leading-tight">
              <div className="max-w-44 truncate text-xs font-black text-white">{user.name}</div>
              <div className="max-w-44 truncate font-mono text-[10px] text-white/70">{user.email}</div>
            </div>
            <UserAvatar user={user} initial={initial} className="size-9 rounded-xl border border-white/40 shadow-md" />
          </div>
          <HeaderUserMenu {...menuProps} />
        </header>

        {/* Page area. The bottom padding keeps content clear of the floating tab bar on phones. */}
        <div className="panel-content flex-1 px-4 pb-[calc(6.5rem_+_env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:pt-6 lg:px-8 lg:pb-8 lg:pt-8">
          <div key={pathname} className={`panel-page mx-auto w-full ${contentClassName}`}>
            {children}
          </div>
        </div>

        {footerText && (
          <footer className="hidden border-t border-sidebar-border bg-sidebar px-6 py-4 text-center text-xs font-medium text-muted-foreground lg:block">{footerText}</footer>
        )}

        <MobileTabBar items={allItems} isActive={isActive} />

        {logoutError && (
          <div
            role="alert"
            className="fixed inset-x-4 bottom-[calc(6rem_+_env(safe-area-inset-bottom))] z-80 rounded-2xl border border-rose-700 bg-rose-900 px-4 py-3 text-xs font-bold text-white shadow-2xl lg:inset-x-auto lg:bottom-6 lg:right-6 lg:max-w-sm"
          >
            {logoutError}
          </div>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
