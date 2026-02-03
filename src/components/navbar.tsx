"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { NotificationDropdown } from "./notification-dropdown";

export function Navbar() {
  const t = useTranslations("common");
  const session = useSession();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = session.data?.user as
    | { name?: string; email?: string; role?: string }
    | undefined;

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale as "tr" | "en" | "et" });
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-blue-700">
              {t("appName")}
            </Link>
            <div className="hidden md:flex ml-10 space-x-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium"
              >
                {t("home")}
              </Link>
              <a
                href="#services"
                className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium"
              >
                {t("services")}
              </a>
              <a
                href="#how-it-works"
                className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium"
              >
                {t("howItWorks")}
              </a>
              <a
                href="#apply"
                className="text-gray-600 hover:text-blue-700 px-3 py-2 text-sm font-medium"
              >
                {t("apply")}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center border rounded-md overflow-hidden text-sm">
              {["tr", "en", "et"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLocale(lang)}
                  className={`px-2 py-1 ${
                    locale === lang
                      ? "bg-blue-700 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {session.status === "authenticated" && user ? (
              <div className="flex items-center gap-3">
                <NotificationDropdown />
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-blue-700"
                  >
                    {t("admin")}
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-blue-700"
                >
                  {t("dashboard")}
                </Link>
                <span className="text-sm text-gray-500">{user.name}</span>
                <button
                  onClick={() => signOut()}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-blue-700"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
                >
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link
              href="/"
              className="block text-gray-600 hover:text-blue-700 px-3 py-2 text-sm"
            >
              {t("home")}
            </Link>
            <a
              href="#services"
              className="block text-gray-600 hover:text-blue-700 px-3 py-2 text-sm"
            >
              {t("services")}
            </a>
            <a
              href="#how-it-works"
              className="block text-gray-600 hover:text-blue-700 px-3 py-2 text-sm"
            >
              {t("howItWorks")}
            </a>
            <a
              href="#apply"
              className="block text-gray-600 hover:text-blue-700 px-3 py-2 text-sm"
            >
              {t("apply")}
            </a>
          </div>
        )}
      </div>
    </nav>
  );
}
