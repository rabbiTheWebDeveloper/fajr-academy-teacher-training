'use client';

import React from 'react';
import PanelShell from '@/components/panel/PanelShell';

/**
 * Instructor panel chrome — the same shell as the admin panel (src/components/panel/PanelShell.jsx),
 * with the instructor menu. An admin may also open this panel, so they get a way back.
 */
const BRAND = { name: 'FAJR ACADEMY', tagline: 'TOT Instructor', portal: 'Instructor Portal', href: '/instructor' };

const NAV_GROUPS = [
  {
    label: 'মেনু',
    items: [
      { href: '/instructor', label: 'ওভারভিউ', short: 'হোম', icon: 'dashboard', exact: true, primary: true },
      { href: '/instructor/trainees', label: 'ট্রেইনি', short: 'ট্রেইনি', icon: 'trainees', primary: true },
      { href: '/instructor/evaluations', label: 'মূল্যায়ন', short: 'মূল্যায়ন', icon: 'evaluations', primary: true },
    ],
  },
  {
    label: 'শিক্ষা উপকরণ',
    items: [
      { href: '/instructor/curriculum', label: 'কারিকুলাম', short: 'কারিকুলাম', icon: 'courses' },
      { href: '/instructor/resources', label: 'রিসোর্স', short: 'রিসোর্স', icon: 'resources' },
      { href: '/instructor/live', label: 'লাইভ ক্লাস', short: 'লাইভ', icon: 'live', primary: true },
    ],
  },
];

export default function InstructorLayoutClient({ user, isAdmin, defaultOpen, children }) {
  const menuLinks = [
    ...(isAdmin ? [{ href: '/admin', label: 'অ্যাডমিন প্যানেল', icon: 'users' }] : []),
    { href: '/', label: 'পাবলিক ওয়েবসাইট', icon: 'website', external: true },
  ];

  return (
    <PanelShell
      brand={BRAND}
      navGroups={NAV_GROUPS}
      user={user}
      menuLinks={menuLinks}
      defaultOpen={defaultOpen}
      footerText="© 2026 Fajr Academy"
      contentClassName="max-w-6xl"
      // An admin visiting this panel manages notifications from the admin panel instead.
      pushTopics={isAdmin ? undefined : "অ্যাডমিনের নতুন নোটিশ"}
    >
      {children}
    </PanelShell>
  );
}
