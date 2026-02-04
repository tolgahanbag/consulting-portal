"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Modal } from "@/components/admin/modal";
import type { AdminUser, UserStats } from "@/types/admin";

type SortKey = "name" | "email" | "role" | "createdAt";
type SortDir = "asc" | "desc";
const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, admins: 0, clients: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    role: "CLIENT",
  });

  // Edit form
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    role: "",
    password: "",
  });

  const currentUserId = (session?.user as { id?: string })?.id;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchUsers = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (roleFilter) params.set("role", roleFilter);

    const res = await fetch(`/api/admin/users?${params.toString()}`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
      setStats(data.stats || { total: 0, admins: 0, clients: 0 });
    }
    setLoading(false);
  }, [debouncedSearch, roleFilter]);

  useEffect(() => {
    if (status === "authenticated") {
      setLoading(true);
      fetchUsers();
    }
  }, [status, fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, sortKey, sortDir]);

  async function handleDelete() {
    if (!deleteId) return;
    const res = await fetch(`/api/admin/users/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast(t("adminUsers.deleteSuccess"), "success");
      setDeleteId(null);
      fetchUsers();
    } else {
      const data = await res.json();
      toast(data.error || t("adminUsers.deleteError"), "error");
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(createForm),
    });
    if (res.ok) {
      toast(t("adminUsers.createSuccess"), "success");
      setShowCreateModal(false);
      setCreateForm({ name: "", email: "", password: "", phone: "", role: "CLIENT" });
      fetchUsers();
    } else {
      const data = await res.json();
      toast(data.error || t("adminUsers.createError"), "error");
    }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    const payload: Record<string, string> = {};
    if (editForm.name !== editUser.name) payload.name = editForm.name;
    if (editForm.phone !== (editUser.phone || "")) payload.phone = editForm.phone;
    if (editForm.role !== editUser.role) payload.role = editForm.role;
    if (editForm.password) payload.password = editForm.password;

    if (Object.keys(payload).length === 0) {
      setEditUser(null);
      return;
    }

    const res = await fetch(`/api/admin/users/${editUser.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast(t("adminUsers.updateSuccess"), "success");
      setEditUser(null);
      fetchUsers();
    } else {
      const data = await res.json();
      toast(data.error || t("adminUsers.updateError"), "error");
    }
  }

  function openEdit(user: AdminUser) {
    setEditUser(user);
    setEditForm({
      name: user.name,
      phone: user.phone || "",
      role: user.role,
      password: "",
    });
  }

  const sorted = useMemo(() => {
    const arr = [...users];
    arr.sort((a, b) => {
      if (sortKey === "createdAt") {
        return sortDir === "asc"
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      const av = (a[sortKey] || "").toLowerCase();
      const bv = (b[sortKey] || "").toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [users, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <span className="text-notion-text-secondary/50 ml-1">&#8597;</span>;
    return <span className="text-notion-text ml-1">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-notion-border border-t-notion-text rounded-full animate-spin" />
          <p className="text-notion-text-secondary text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: t("adminUsers.totalUsers"), value: stats.total },
    { label: t("adminUsers.adminUsers"), value: stats.admins },
    { label: t("adminUsers.clientUsers"), value: stats.clients },
  ];

  return (
    <div>
      {/* Title + Create Button */}
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-notion-text">
          {t("adminUsers.title")}
        </h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
        >
          {t("adminUsers.createUser")}
        </button>
      </div>
      <p className="text-notion-text-secondary text-sm mb-8">{t("adminUsers.subtitle")}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="notion-card flex flex-col">
            <p className="text-xs text-notion-text-secondary uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-notion-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search + Role Filter */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-notion-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("adminUsers.searchPlaceholder")}
            className="notion-input pl-10"
          />
        </div>
        <div className="flex gap-1.5">
          {["", "ADMIN", "CLIENT"].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                roleFilter === r
                  ? "bg-notion-text text-white"
                  : "text-notion-text-secondary hover:bg-notion-bg-hover"
              }`}
            >
              {r === "" ? t("common.all") : t(`adminUsers.roles.${r}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="border border-notion-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-notion-border bg-notion-bg-secondary">
                <th
                  onClick={() => toggleSort("name")}
                  className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text"
                >
                  {t("common.name")}
                  <SortIcon col="name" />
                </th>
                <th
                  onClick={() => toggleSort("email")}
                  className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text"
                >
                  {t("common.email")}
                  <SortIcon col="email" />
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider hidden md:table-cell">
                  {t("common.phone")}
                </th>
                <th
                  onClick={() => toggleSort("role")}
                  className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text"
                >
                  {t("adminUsers.role")}
                  <SortIcon col="role" />
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider hidden lg:table-cell">
                  {t("adminUsers.applications")}
                </th>
                <th
                  onClick={() => toggleSort("createdAt")}
                  className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider cursor-pointer select-none hover:text-notion-text hidden sm:table-cell"
                >
                  {t("common.date")}
                  <SortIcon col="createdAt" />
                </th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-notion-text-secondary uppercase tracking-wider">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-notion-border">
              {paginated.map((user) => (
                <tr key={user.id} className="hover:bg-notion-bg-hover transition-colors">
                  <td className="px-3 py-2.5 text-sm font-medium text-notion-text">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="truncate max-w-[150px]">{user.name}</span>
                      {user.id === currentUserId && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">
                          {t("adminUsers.you")}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary">
                    {user.email}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden md:table-cell">
                    {user.phone || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {t(`adminUsers.roles.${user.role}`)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden lg:table-cell">
                    {user._count.applications}
                  </td>
                  <td className="px-3 py-2.5 text-sm text-notion-text-secondary hidden sm:table-cell">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(user)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
                      >
                        {t("common.edit")}
                      </button>
                      {user.id !== currentUserId && (
                        <button
                          onClick={() => setDeleteId(user.id)}
                          className="text-red-500 hover:text-red-600 text-sm font-medium transition-colors"
                        >
                          {t("common.delete")}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-notion-text-secondary text-sm">{t("common.noData")}</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-notion-text-secondary">
            {t("admin.table.showing")} {(page - 1) * PAGE_SIZE + 1}-{Math.min(page * PAGE_SIZE, sorted.length)}{" "}
            {t("admin.table.of")} {sorted.length} {t("admin.table.entries")}
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded-md text-sm border border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t("admin.table.previous")}
            </button>
            <span className="px-2.5 py-1 text-sm text-notion-text-secondary">
              {t("admin.table.page")} {page} {t("admin.table.of")} {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded-md text-sm border border-notion-border text-notion-text-secondary hover:bg-notion-bg-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {t("admin.table.next")}
            </button>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={t("adminUsers.createUser")}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("common.name")} *
            </label>
            <input
              type="text"
              required
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="notion-input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("common.email")} *
            </label>
            <input
              type="email"
              required
              value={createForm.email}
              onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              className="notion-input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("common.password")} *
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={createForm.password}
              onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              className="notion-input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("common.phone")}
            </label>
            <input
              type="text"
              value={createForm.phone}
              onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              className="notion-input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("adminUsers.role")}
            </label>
            <select
              value={createForm.role}
              onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}
              className="notion-input w-full"
            >
              <option value="CLIENT">{t("adminUsers.roles.CLIENT")}</option>
              <option value="ADMIN">{t("adminUsers.roles.ADMIN")}</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateModal(false)}
              className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
            >
              {t("adminUsers.createUser")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editUser !== null}
        onClose={() => setEditUser(null)}
        title={t("adminUsers.editUser")}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("common.email")}
            </label>
            <input
              type="email"
              disabled
              value={editUser?.email || ""}
              className="notion-input w-full bg-notion-bg-secondary cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("common.name")}
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="notion-input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("common.phone")}
            </label>
            <input
              type="text"
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="notion-input w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("adminUsers.role")}
            </label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="notion-input w-full"
              disabled={editUser?.id === currentUserId}
            >
              <option value="CLIENT">{t("adminUsers.roles.CLIENT")}</option>
              <option value="ADMIN">{t("adminUsers.roles.ADMIN")}</option>
            </select>
            {editUser?.id === currentUserId && (
              <p className="text-xs text-notion-text-secondary mt-1">
                {t("adminUsers.cannotChangeOwnRole")}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-medium text-notion-text-secondary mb-1">
              {t("adminUsers.newPassword")}
            </label>
            <input
              type="password"
              minLength={6}
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder={t("adminUsers.passwordPlaceholder")}
              className="notion-input w-full"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setEditUser(null)}
              className="px-3 py-1.5 rounded-md text-sm text-notion-text-secondary border border-notion-border hover:bg-notion-bg-hover transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-notion-text text-white hover:bg-notion-text/90 transition-colors"
            >
              {t("common.save")}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title={t("adminUsers.deleteUser")}
        message={t("adminUsers.deleteConfirm")}
        variant="danger"
      />
    </div>
  );
}
