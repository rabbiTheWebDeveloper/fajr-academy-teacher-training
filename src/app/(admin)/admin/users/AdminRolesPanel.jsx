'use client';

import React, { useState } from "react";
import { Crown, Lock, Pencil, Plus, ShieldCheck, Trash2, Users, X } from "lucide-react";
import { useAdminTheme } from "../../AdminThemeContext";
import { callApi } from "../../_shared/admin-ui";
import {
  ACTION_LABEL,
  ASSIGNABLE_ACTIONS,
  PERMISSION_MODULES,
  normalizePermissions,
  permissionKey,
} from "@/lib/rbac";

const EMPTY_FORM = { id: null, name: "", description: "", permissions: [] };

/** "পেমেন্ট ভেরিফিকেশন: দেখা, সম্পাদনা" lines for one role card. */
function summarize(permissions) {
  return PERMISSION_MODULES.map((m) => {
    const actions = m.actions.filter((a) => permissions.includes(permissionKey(m.id, a)));
    return actions.length ? { id: m.id, label: m.label, actions } : null;
  }).filter(Boolean);
}

/**
 * Admin → অ্যাডমিন ইউজার → রোল ও পারমিশন (super-admin only; the page and API both enforce it).
 * A role is a named set of module permissions (দেখা / যোগ করা / সম্পাদনা). "মুছে ফেলা" is shown
 * locked on every row: deleting always stays with the super-admin.
 */
export default function AdminRolesPanel({ roles, setRoles, showToast, confirm, onChanged }) {
  const { isLight } = useAdminTheme();
  const [editor, setEditor] = useState(null); // form object while the modal is open
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const muted = isLight ? "text-slate-600" : "text-slate-400";
  const strong = isLight ? "text-slate-900" : "text-white";
  const card = isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-900 border-slate-800 shadow-2xl";
  const field = `w-full rounded-xl px-3 py-2 border outline-hidden font-medium ${
    isLight ? "bg-slate-50 border-slate-300 text-slate-900 focus:border-amber-500" : "bg-slate-950 border-slate-800 text-white placeholder-slate-600 focus:border-amber-500"
  }`;
  const label = `font-bold block mb-1 ${isLight ? "text-slate-700" : "text-slate-400"}`;
  const iconBtn = (tone) =>
    `p-1.5 rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
      tone === "danger"
        ? isLight ? "text-rose-600 hover:bg-rose-50" : "text-rose-400 hover:bg-rose-950/40"
        : isLight ? "text-amber-700 hover:bg-amber-50" : "text-amber-400 hover:bg-amber-950/40"
    }`;
  const chip = isLight ? "bg-slate-100 text-slate-700 border-slate-300" : "bg-slate-800 text-slate-300 border-slate-700";

  const openCreate = () => {
    setFormError("");
    setEditor({ ...EMPTY_FORM });
  };
  const openEdit = (role) => {
    setFormError("");
    setEditor({ id: role._id, name: role.name, description: role.description || "", permissions: [...role.permissions] });
  };
  const closeEditor = () => {
    setEditor(null);
    setFormError("");
  };

  // Ticking create/update ticks "দেখা" too; unticking "দেখা" clears the rest of that row.
  const toggle = (moduleId, action) => {
    setEditor((prev) => {
      const key = permissionKey(moduleId, action);
      const has = new Set(prev.permissions);
      if (has.has(key)) {
        has.delete(key);
        if (action === "read") for (const a of ASSIGNABLE_ACTIONS) has.delete(permissionKey(moduleId, a));
      } else {
        has.add(key);
      }
      return { ...prev, permissions: normalizePermissions([...has]) };
    });
  };
  const setAll = (mode) =>
    setEditor((prev) => ({
      ...prev,
      permissions:
        mode === "none"
          ? []
          : normalizePermissions(
              PERMISSION_MODULES.flatMap((m) => m.actions.filter((a) => mode === "all" || a === "read").map((a) => permissionKey(m.id, a)))
            ),
    }));

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const body = { name: editor.name, description: editor.description, permissions: editor.permissions };
    const { ok, data, message } = await callApi("/api/admin/roles", {
      method: editor.id ? "PATCH" : "POST",
      body: editor.id ? { id: editor.id, ...body } : body,
    });
    setSaving(false);
    if (!ok) return setFormError(message);
    setRoles((prev) => (editor.id ? prev.map((r) => (r._id === data.role._id ? data.role : r)) : [...prev, data.role]));
    showToast(message || "রোল সংরক্ষিত হয়েছে।");
    closeEditor();
    onChanged?.();
  };

  const remove = async (role) => {
    if (!(await confirm(`“${role.name}” রোলটি স্থায়ীভাবে মুছে ফেলবেন?`, { tone: "danger", title: "রোল মুছে ফেলবেন?" }))) return;
    setBusyId(role._id);
    const { ok, message } = await callApi(`/api/admin/roles?id=${encodeURIComponent(role._id)}`, { method: "DELETE" });
    setBusyId(null);
    if (!ok) return showToast(message, "error");
    setRoles((prev) => prev.filter((r) => r._id !== role._id));
    showToast(message || "রোল মুছে ফেলা হয়েছে।");
    onChanged?.();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className={`text-xs font-medium leading-relaxed max-w-2xl ${muted}`}>
          এখানে রোল তৈরি করে প্রতিটি মডিউলে <strong>দেখা / যোগ করা / সম্পাদনা</strong> আলাদাভাবে চালু-বন্ধ করা যায়। ইউজারের রোল বদলালে পরিবর্তন তার পরের রিকোয়েস্ট থেকেই
          কার্যকর হয়। <strong>মুছে ফেলার অনুমতি</strong> কোনো রোলকে দেওয়া যায় না — সেটি শুধু সুপার অ্যাডমিনের।
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" /> নতুন রোল
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Built-in roles (fixed in code) */}
        <div className={`rounded-3xl border p-5 space-y-2 ${card}`}>
          <div className={`flex items-center gap-2 font-black text-sm ${strong}`}>
            <Crown className="w-4 h-4 text-amber-500" /> সুপার অ্যাডমিন
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${chip}`}>সিস্টেম রোল</span>
          </div>
          <p className={`text-xs leading-relaxed ${muted}`}>
            সব মডিউলে পূর্ণ অ্যাক্সেস। একমাত্র এই রোলই নতুন ইউজার ও রোল যোগ করতে এবং যেকোনো কিছু মুছে ফেলতে পারে।
          </p>
        </div>
        <div className={`rounded-3xl border p-5 space-y-2 ${card}`}>
          <div className={`flex items-center gap-2 font-black text-sm ${strong}`}>
            <ShieldCheck className="w-4 h-4 text-amber-500" /> অ্যাডমিন (ডিফল্ট)
            <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border ${chip}`}>সিস্টেম রোল</span>
          </div>
          <p className={`text-xs leading-relaxed ${muted}`}>
            সব মডিউল দেখা, যোগ করা ও সম্পাদনা করতে পারে। কিছু মুছতে পারে না এবং ইউজার/রোল পরিচালনা করতে পারে না। কাস্টম রোল না দিলে অ্যাডমিন এই অনুমতিই পায়।
          </p>
        </div>
      </div>

      {roles.length === 0 ? (
        <div className={`rounded-3xl border p-8 text-center text-xs font-medium ${card} ${muted}`}>
          এখনো কোনো কাস্টম রোল নেই। যেমন শুধু পেমেন্ট দেখে যাচাই করবে এমন “একাউন্ট্যান্ট” রোল তৈরি করতে <strong>নতুন রোল</strong> চাপুন।
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roles.map((role) => {
            const lines = summarize(role.permissions);
            return (
              <div key={role._id} className={`rounded-3xl border p-5 space-y-3 ${card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className={`font-black text-sm wrap-break-word ${strong}`}>{role.name}</div>
                    {role.description && <div className={`text-[11px] mt-0.5 ${muted}`}>{role.description}</div>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button type="button" onClick={() => openEdit(role)} title="রোল সম্পাদনা" className={iconBtn("warn")}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(role)}
                      disabled={busyId === role._id || role.userCount > 0}
                      title={role.userCount > 0 ? `${role.userCount} জন অ্যাডমিনের এই রোল আছে — আগে তাদের রোল বদলান` : "রোল মুছে ফেলুন"}
                      className={iconBtn("danger")}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className={`flex items-center gap-1.5 text-[11px] font-bold ${muted}`}>
                  <Users className="w-3.5 h-3.5" /> {role.userCount} জন অ্যাডমিন
                </div>

                {lines.length === 0 ? (
                  <div className={`text-[11px] font-medium ${muted}`}>কোনো মডিউলের অনুমতি নেই — শুধু ড্যাশবোর্ড দেখতে পারে।</div>
                ) : (
                  <ul className="space-y-1.5">
                    {lines.map((l) => (
                      <li key={l.id} className="flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className={`font-bold ${isLight ? "text-slate-800" : "text-slate-200"}`}>{l.label}:</span>
                        {l.actions.map((a) => (
                          <span key={a} className={`px-2 py-0.5 rounded-full border font-bold ${chip}`}>
                            {ACTION_LABEL[a]}
                          </span>
                        ))}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editor && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className={`border rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 my-8 ${isLight ? "bg-white border-slate-200 text-slate-900" : "bg-slate-900 border-slate-800 text-white"}`}>
            <div className={`flex items-center justify-between border-b pb-3 ${isLight ? "border-slate-200" : "border-slate-800"}`}>
              <h3 className="text-base font-bold">{editor.id ? "রোল সম্পাদনা" : "নতুন রোল"}</h3>
              <button type="button" onClick={closeEditor} aria-label="বন্ধ করুন" className={`p-1 rounded-lg cursor-pointer ${isLight ? "text-slate-500 hover:bg-slate-100" : "text-slate-400 hover:text-white"}`}>
                <X className="w-5 h-5" />
              </button>
            </div>
            {formError && (
              <div role="alert" className={`p-3 rounded-xl border text-xs font-bold ${isLight ? "bg-rose-50 text-rose-800 border-rose-300" : "bg-rose-500/20 text-rose-300 border-rose-500/40"}`}>
                {formError}
              </div>
            )}
            <form onSubmit={save} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={label}>রোলের নাম *</label>
                  <input type="text" required minLength={2} maxLength={40} value={editor.name} onChange={(e) => setEditor({ ...editor, name: e.target.value })} placeholder="যেমন: একাউন্ট্যান্ট" className={field} />
                </div>
                <div>
                  <label className={label}>বিবরণ</label>
                  <input type="text" maxLength={200} value={editor.description} onChange={(e) => setEditor({ ...editor, description: e.target.value })} placeholder="এই রোল কী করে" className={field} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`font-bold ${isLight ? "text-slate-700" : "text-slate-300"}`}>মডিউল অনুযায়ী অনুমতি</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      ["read", "সব দেখা"],
                      ["all", "সব অনুমতি"],
                      ["none", "পরিষ্কার"],
                    ].map(([mode, text]) => (
                      <button key={mode} type="button" onClick={() => setAll(mode)} className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${chip}`}>
                        {text}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`rounded-2xl border overflow-x-auto ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                  <table className="w-full text-left min-w-[30rem]">
                    <thead className={`font-bold ${isLight ? "bg-slate-100 text-slate-700" : "bg-slate-950 text-slate-400"}`}>
                      <tr>
                        <th className="p-3">মডিউল</th>
                        {ASSIGNABLE_ACTIONS.map((a) => (
                          <th key={a} className="p-3 text-center whitespace-nowrap">{ACTION_LABEL[a]}</th>
                        ))}
                        <th className="p-3 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1" title="মুছে ফেলার অনুমতি শুধু সুপার অ্যাডমিনের">
                            <Lock className="w-3 h-3" /> {ACTION_LABEL.delete}
                          </span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isLight ? "divide-slate-200" : "divide-slate-800/70"}`}>
                      {PERMISSION_MODULES.map((m) => (
                        <tr key={m.id}>
                          <td className="p-3">
                            <div className={`font-bold ${strong}`}>{m.label}</div>
                            <div className={`text-[11px] ${muted}`}>{m.hint}</div>
                          </td>
                          {ASSIGNABLE_ACTIONS.map((a) => (
                            <td key={a} className="p-3 text-center">
                              {m.actions.includes(a) ? (
                                <input
                                  type="checkbox"
                                  checked={editor.permissions.includes(permissionKey(m.id, a))}
                                  onChange={() => toggle(m.id, a)}
                                  aria-label={`${m.label} — ${ACTION_LABEL[a]}`}
                                  className="w-4 h-4 cursor-pointer accent-amber-500"
                                />
                              ) : (
                                <span className={muted}>—</span>
                              )}
                            </td>
                          ))}
                          <td className="p-3 text-center">
                            <Lock className={`w-3.5 h-3.5 inline ${muted}`} aria-label="শুধু সুপার অ্যাডমিন" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className={`text-[11px] leading-relaxed ${muted}`}>
                  “যোগ করা” বা “সম্পাদনা” চালু করলে সেই মডিউলের “দেখা” নিজে থেকেই চালু হয়। কোনো মডিউল না বেছে নিলে রোলটি শুধু ড্যাশবোর্ড দেখতে পারবে।
                </p>
              </div>

              <div className={`flex items-center justify-end gap-2.5 pt-3 border-t ${isLight ? "border-slate-200" : "border-slate-800"}`}>
                <button type="button" onClick={closeEditor} className={`px-4 py-2 rounded-xl font-bold cursor-pointer ${isLight ? "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}>
                  বাতিল
                </button>
                <button type="submit" disabled={saving} className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-60">
                  {saving ? "সংরক্ষণ হচ্ছে..." : editor.id ? "পরিবর্তন সংরক্ষণ করুন" : "রোল তৈরি করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
