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
    <div className="min-h-screen flex items-center justify-center px-4 pt-[72px] pb-12 bg-[#f7f8fc]">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] rounded-full bg-gold-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-navy-500/[0.05] blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center shadow-gold-glow">
            <span className="text-navy-950 font-display font-bold text-lg">ET</span>
          </div>
        </div>

        <h1 className="font-display text-3xl font-bold text-center text-navy-900 mb-2">
          {t("registerTitle")}
        </h1>
        <p className="text-center text-navy-500 text-sm mb-8">
          {t("hasAccount")}{" "}
          <Link href="/auth/login" className="text-gold-600 hover:text-gold-700 font-medium transition-colors">
            {t("loginButton")}
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              {t("namePlaceholder")}
            </label>
            <input
              name="name"
              required
              placeholder={t("namePlaceholder")}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              {t("emailPlaceholder")}
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder={t("emailPlaceholder")}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              {t("phonePlaceholder")}
            </label>
            <input
              name="phone"
              placeholder={t("phonePlaceholder")}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              {t("passwordPlaceholder")}
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder={t("passwordPlaceholder")}
              className="input-premium"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-2">
              {t("passwordPlaceholder")}
            </label>
            <input
              name="passwordConfirm"
              type="password"
              required
              minLength={6}
              placeholder={t("passwordPlaceholder")}
              className="input-premium"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-navy-900/30 border-t-navy-900 rounded-full animate-spin" />
                <span>...</span>
              </div>
            ) : (
              t("registerButton")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
