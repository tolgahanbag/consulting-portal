"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const passwordConfirm = formData.get("passwordConfirm") as string;

    if (password !== passwordConfirm) {
      toast("Şifreler eşleşmiyor", "error");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.get("email"),
          password,
          name: formData.get("name"),
          phone: formData.get("phone"),
        }),
      });

      if (res.ok) {
        toast(t("registerSuccess"), "success");
        router.push("/auth/login");
      } else {
        const data = await res.json();
        if (res.status === 409) {
          toast(t("emailExists"), "error");
        } else {
          toast(data.error || "Hata", "error");
        }
      }
    } catch {
      toast("Bir hata oluştu", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">{t("registerTitle")}</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("namePlaceholder")}
            </label>
            <input
              name="name"
              required
              placeholder={t("namePlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("emailPlaceholder")}
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("phonePlaceholder")}
            </label>
            <input
              name="phone"
              placeholder={t("phonePlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("passwordPlaceholder")}
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("passwordPlaceholder")}
            </label>
            <input
              name="passwordConfirm"
              type="password"
              required
              minLength={6}
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? "..." : t("registerButton")}
          </button>
          <p className="text-center text-sm text-gray-600">
            {t("hasAccount")}{" "}
            <Link href="/auth/login" className="text-blue-700 hover:underline">
              {t("loginButton")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
