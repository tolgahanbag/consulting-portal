import { useTranslations } from "next-intl";
import { ApplicationForm } from "@/components/application-form";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-navy-950">
        {/* Background layers */}
        <div className="absolute inset-0 bg-hero-mesh" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gold-500/[0.04] blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-navy-500/20 blur-[100px]" />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(212,160,50,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,160,50,0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
          <div className="max-w-3xl">
            {/* Overline */}
            <div className="flex items-center gap-3 mb-8 opacity-0 animate-fade-up">
              <div className="gold-line" />
              <span className="text-gold-400 text-sm font-medium tracking-[0.2em] uppercase">
                Estonia & Turkey
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-8 opacity-0 animate-fade-up animate-delay-100">
              {t("hero.title")}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-navy-300 max-w-2xl leading-relaxed mb-12 opacity-0 animate-fade-up animate-delay-200">
              {t("hero.subtitle")}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 opacity-0 animate-fade-up animate-delay-300">
              <a href="#apply" className="btn-primary">
                {t("hero.cta")}
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#services" className="btn-secondary">
                {t("services.title")}
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center gap-8 mt-16 pt-8 border-t border-white/10 opacity-0 animate-fade-up animate-delay-500">
              <div>
                <p className="text-3xl font-display font-bold text-gradient-gold">500+</p>
                <p className="text-sm text-navy-400 mt-1">{t("services.companyFormation.title")}</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-3xl font-display font-bold text-gradient-gold">3</p>
                <p className="text-sm text-navy-400 mt-1">{t("footer.followUs")}</p>
              </div>
              <div className="w-px h-12 bg-white/10" />
              <div>
                <p className="text-3xl font-display font-bold text-gradient-gold">98%</p>
                <p className="text-sm text-navy-400 mt-1">{t("services.legalConsulting.title")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in animate-delay-700">
          <span className="text-navy-500 text-xs tracking-[0.15em] uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-500/50 to-transparent animate-float" />
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="flex justify-center mb-4">
              <div className="gold-line" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-6">
              {t("services.title")}
            </h2>
            <p className="text-navy-500 max-w-2xl mx-auto text-lg leading-relaxed">
              {t("services.subtitle")}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              {
                key: "companyFormation",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
              {
                key: "taxConsulting",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                key: "legalConsulting",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                ),
              },
              {
                key: "accounting",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                key: "workPermit",
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                ),
              },
            ].map((service) => (
              <div
                key={service.key}
                className="group relative p-8 rounded-2xl border border-navy-100/60 bg-white hover:border-gold-300/50 transition-all duration-500 hover:shadow-card-hover hover:-translate-y-1"
              >
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-navy-50 flex items-center justify-center text-navy-700 mb-6 group-hover:bg-gold-50 group-hover:text-gold-600 transition-all duration-500">
                    {service.icon}
                  </div>
                  <h3 className="font-display font-semibold text-navy-900 mb-3 text-lg">
                    {t(`services.${service.key}.title`)}
                  </h3>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    {t(`services.${service.key}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="relative py-28 bg-navy-950 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-hero-mesh opacity-50" />
        <div className="absolute inset-0 noise-overlay" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="flex justify-center mb-4">
              <div className="gold-line" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">
              {t("howItWorks.title")}
            </h2>
            <p className="text-navy-400 max-w-2xl mx-auto text-lg leading-relaxed">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-4 gap-8">
            {["step1", "step2", "step3", "step4"].map((step, idx) => (
              <div key={step} className="relative group">
                {/* Connector line */}
                {idx < 3 && (
                  <div className="hidden md:block absolute top-10 left-[60%] w-full h-px bg-gradient-to-r from-gold-500/30 to-transparent" />
                )}
                <div className="text-center">
                  {/* Step number */}
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-gold-500/30 group-hover:bg-gold-500/[0.06] transition-all duration-500">
                      <span className="font-display text-3xl font-bold text-gradient-gold">
                        {idx + 1}
                      </span>
                    </div>
                  </div>
                  <h3 className="font-display font-semibold text-white mb-3 text-lg">
                    {t(`howItWorks.${step}.title`)}
                  </h3>
                  <p className="text-sm text-navy-400 leading-relaxed">
                    {t(`howItWorks.${step}.desc`)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="relative py-28 bg-[#f7f8fc]">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #0d1221 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="gold-line" />
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-navy-900 mb-6">
              {t("applicationForm.title")}
            </h2>
            <p className="text-navy-500 text-lg leading-relaxed">
              {t("applicationForm.subtitle")}
            </p>
          </div>
          <ApplicationForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-navy-950 text-navy-400 py-16 overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-500/20 to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-500 to-gold-400 flex items-center justify-center">
                  <span className="text-navy-950 font-display font-bold text-xs">ET</span>
                </div>
                <span className="font-display font-bold text-white text-lg">{t("footer.company")}</span>
              </div>
              <p className="text-sm leading-relaxed">{t("footer.address")}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 text-sm tracking-wide uppercase">
                {t("footer.contact")}
              </h3>
              <div className="space-y-3">
                <p className="text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@estonturk.com
                </p>
                <p className="text-sm flex items-center gap-2">
                  <svg className="w-4 h-4 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +372 XXXX XXXX
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-6 text-sm tracking-wide uppercase">
                {t("footer.followUs")}
              </h3>
              <div className="flex gap-3">
                {["LinkedIn", "Twitter", "Facebook"].map((social) => (
                  <span
                    key={social}
                    className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs text-navy-400 hover:border-gold-500/30 hover:text-gold-400 hover:bg-gold-500/[0.06] transition-all duration-300 cursor-pointer"
                  >
                    {social[0]}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-navy-500">
              &copy; {new Date().getFullYear()} {t("footer.company")}. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-1 text-xs text-navy-600">
              <span>Crafted with precision</span>
              <span className="text-gold-500">&#9830;</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
