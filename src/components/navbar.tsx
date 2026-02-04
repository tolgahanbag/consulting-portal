"use client";

import { useTranslations } from "next-intl";
import { useSession, signOut } from "next-auth/react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useState, useEffect } from "react";
import { NotificationDropdown } from "./notification-dropdown";

export function Navbar() {
  const t = useTranslations("common");
  const session = useSession();
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isHomePage = pathname === "/" || pathname === "";
  const [scrolled, setScrolled] = useState(!isHomePage);

  useEffect(() => {
    if (!isHomePage) {
      setScrolled(true);
      return;
    }
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const user = session.data?.user as
    | { name?: string; email?: string; role?: string }
    | undefined;
  const isInAdmin = pathname.startsWith("/admin");

  function switchLocale(newLocale: string) {
    router.replace(pathname, { locale: newLocale as "tr" | "en" | "et" });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-glass border-b border-navy-100/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-[72px]">
          {/* Logo & Nav */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <span className="text-navy-950 font-display font-bold text-sm">ET</span>
              </div>
              <span className={`font-display font-bold text-lg tracking-tight transition-colors duration-300 ${
                scrolled ? "text-navy-900" : "text-white"
              }`}>
                {t("appName")}
              </span>
            </Link>
            <div className="hidden md:flex ml-10 items-center">
              {[
                { href: "/", label: t("home"), isLink: true },
                { href: "#services", label: t("services"), isLink: false },
                { href: "#how-it-works", label: t("howItWorks"), isLink: false },
                { href: "#apply", label: t("apply"), isLink: false },
              ].map((item) =>
                item.isLink ? (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                      scrolled
                        ? "text-navy-600 hover:text-navy-900"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </Link>
                ) : (
                  <a
                    key={item.href}
                    href={item.href}
                    className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 group ${
                      scrolled
                        ? "text-navy-600 hover:text-navy-900"
                        : "text-white/80 hover:text-white"
                    }`}
                  >
                    {item.label}
                    <span className="absolute bottom-0 left-4 right-4 h-[2px] bg-gold-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  </a>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className={`flex items-center rounded-full p-0.5 text-xs font-medium transition-all duration-300 ${
              scrolled
                ? "bg-navy-50 border border-navy-100"
                : "bg-white/10 border border-white/20"
            }`}>
              {["tr", "en", "et"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => switchLocale(lang)}
                  className={`px-2.5 py-1 rounded-full transition-all duration-300 ${
                    locale === lang
                      ? "bg-gold-500 text-navy-950 shadow-sm"
                      : scrolled
                      ? "text-navy-500 hover:text-navy-800"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>

            {session.status === "authenticated" && user ? (
              <div className="flex items-center gap-2">
                <NotificationDropdown />
                {!isInAdmin && (
                  <>
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-300 ${
                          scrolled
                            ? "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                            : "text-white/80 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {t("admin")}
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-300 ${
                        scrolled
                          ? "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                          : "text-white/80 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {t("dashboard")}
                    </Link>
                  </>
                )}
                <div className={`hidden sm:flex items-center gap-2 ml-1 pl-3 border-l ${
                  scrolled ? "border-navy-200" : "border-white/20"
                }`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                    <span className="text-navy-950 text-xs font-bold">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${scrolled ? "text-navy-700" : "text-white/90"}`}>
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => signOut()}
                  className={`text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-300 ${
                    scrolled
                      ? "text-red-500 hover:bg-red-50"
                      : "text-red-300 hover:bg-red-500/10"
                  }`}
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-all duration-300 ${
                    scrolled
                      ? "text-navy-700 hover:bg-navy-50"
                      : "text-white/90 hover:bg-white/10"
                  }`}
                >
                  {t("login")}
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary !py-2 !px-5 !text-xs"
                >
                  {t("register")}
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled ? "text-navy-700 hover:bg-navy-50" : "text-white hover:bg-white/10"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className={`md:hidden pb-4 space-y-1 animate-fade-in ${
            scrolled ? "" : "bg-navy-900/90 backdrop-blur-xl -mx-4 px-4 rounded-b-2xl"
          }`}>
            {[
              { href: "/", label: t("home"), isLink: true },
              { href: "#services", label: t("services"), isLink: false },
              { href: "#how-it-works", label: t("howItWorks"), isLink: false },
              { href: "#apply", label: t("apply"), isLink: false },
            ].map((item) =>
              item.isLink ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    scrolled
                      ? "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className={`block px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    scrolled
                      ? "text-navy-600 hover:bg-navy-50 hover:text-navy-900"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {item.label}
                </a>
              )
            )}
            {session.status !== "authenticated" && (
              <div className="flex gap-2 pt-2">
                <Link href="/auth/login" className={`flex-1 text-center text-sm py-2.5 rounded-lg font-medium ${
                  scrolled ? "text-navy-700 bg-navy-50" : "text-white bg-white/10"
                }`}>
                  {t("login")}
                </Link>
                <Link href="/auth/register" className="flex-1 btn-primary !py-2.5 text-center !text-xs">
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
