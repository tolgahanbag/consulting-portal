"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { toast } from "@/components/ui/toaster";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });

    if (result?.error) {
      toast(t("invalidCredentials"), "error");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-8">{t("loginTitle")}</h1>
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl border shadow-sm space-y-6">
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
              {t("passwordPlaceholder")}
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder={t("passwordPlaceholder")}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition disabled:opacity-50"
          >
            {loading ? "..." : t("loginButton")}
          </button>
          <p className="text-center text-sm text-gray-600">
            {t("noAccount")}{" "}
            <Link href="/auth/register" className="text-blue-700 hover:underline">
              {t("registerButton")}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
