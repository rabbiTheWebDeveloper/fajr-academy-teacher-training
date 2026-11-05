'use client';

import React, { createContext, useContext, useMemo } from "react";
import { hasPermission } from "@/lib/rbac";

/**
 * What the signed-in admin may do, for hiding buttons / menu items / dashboard cards.
 * The server decides each page (requireAdminPage) and each API call (requirePermission);
 * this is only the UI mirror of that, so a role never sees controls it cannot use.
 *
 *   const { can, isSuper, roleLabel } = useAdminAccess();
 *   can("payments", "update")   // module + action
 *   can(["tots", "courses"])    // "any of" these modules, action defaults to "read"
 *   isSuper                     // the only role that may delete, and manage users / roles
 */
const AdminAccessContext = createContext(null);

export function AdminAccessProvider({ access, children }) {
  const value = useMemo(
    () => ({
      ...access,
      can: (module, action = "read") => hasPermission(access, module, action),
    }),
    [access]
  );
  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}

export function useAdminAccess() {
  const value = useContext(AdminAccessContext);
  if (!value) throw new Error("useAdminAccess must be used inside <AdminAccessProvider>");
  return value;
}
