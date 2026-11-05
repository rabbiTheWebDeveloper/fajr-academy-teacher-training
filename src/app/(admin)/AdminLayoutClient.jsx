'use client';

import React from 'react';
import PanelShell from '@/components/panel/PanelShell';
import { useAdminAccess } from './AdminAccessContext';

/**
 * Admin panel chrome. The shell itself (shadcn sidebar, gradient header, user menu) is shared
 * with the instructor panel; this file only decides WHICH menu entries this admin sees:
 * each item names a permission module (src/lib/rbac.js) and is hidden without read access.
 */
const BRAND = { name: 'FAJR ACADEMY', tagline: 'Executive Admin', portal: 'Admin Portal', href: '/admin' };

const NAV = [
  {
    label: 'মেনু',
    items: [
      { href: '/admin', label: 'ড্যাশবোর্ড ওভারভিউ', short: 'হোম', icon: 'dashboard', exact: true, primary: true },
      { href: '/admin/tots', label: 'TOT ট্রেইনি (পেমেন্টকারী)', short: 'ট্রেইনি', icon: 'trainees', module: 'tots', primary: true },
      { href: '/admin/payments', label: 'পেমেন্ট ভেরিফিকেশন', short: 'পেমেন্ট', icon: 'payments', module: 'payments', primary: true },
      { href: '/admin/courses', label: 'কোর্স ও সেশন', short: 'কোর্স', icon: 'courses', module: 'courses', primary: true },
      { href: '/admin/instructors', label: 'ইনস্ট্রাক্টর', short: 'ইনস্ট্রাক্টর', icon: 'instructors', module: 'instructors' },
      { href: '/admin/evaluations', label: 'মূল্যায়ন ও ফলাফল', short: 'মূল্যায়ন', icon: 'evaluations', module: 'evaluations' },
    ],
  },
  {
    label: 'সিস্টেম',
    items: [
      { href: '/admin/users', label: 'অ্যাডমিন ইউজার ও রোল', short: 'ইউজার', icon: 'users', module: 'users' },
      { href: '/admin/settings', label: 'সিস্টেম সেটিংস', short: 'সেটিংস', icon: 'settings', module: 'settings' },
    ],
  },
];

// Admins have no trainee (TOT) record, so there is no /dashboard link — the public site instead.
const MENU_LINKS = [
  { href: '/instructor', label: 'ইনস্ট্রাক্টর পোর্টাল', icon: 'portal', external: true },
  { href: '/', label: 'পাবলিক ওয়েবসাইট', icon: 'website', external: true },
];

export default function AdminLayoutClient({ adminUser, defaultOpen, children }) {
  const { can } = useAdminAccess();

  const navGroups = NAV.map((group) => ({
    label: group.label,
    items: group.items.filter((item) => !item.module || can(item.module, 'read')),
  })).filter((group) => group.items.length > 0);

  return (
    <PanelShell
      brand={BRAND}
      navGroups={navGroups}
      user={{ name: adminUser.fullName, email: adminUser.email, roleLabel: adminUser.roleLabel }}
      menuLinks={MENU_LINKS}
      defaultOpen={defaultOpen}
      footerText="© 2026 Fajr Academy — TOT Enterprise Management System v2.0"
    >
      {children}
    </PanelShell>
  );
}
