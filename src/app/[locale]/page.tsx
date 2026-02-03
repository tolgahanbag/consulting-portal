import { useTranslations } from "next-intl";
import { ApplicationForm } from "@/components/application-form";

export default function HomePage() {
  const t = useTranslations();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto mb-8">
            {t("hero.subtitle")}
          </p>
          <a
            href="#apply"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition"
          >
            {t("hero.cta")}
          </a>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t("services.title")}
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            {t("services.subtitle")}
          </p>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            {[
              {
                key: "companyFormation",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                ),
              },
              {
                key: "taxConsulting",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                key: "legalConsulting",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                ),
              },
              {
                key: "accounting",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                key: "workPermit",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                ),
              },
            ].map((service) => (
              <div
                key={service.key}
                className="text-center p-6 rounded-xl border hover:shadow-lg transition bg-gray-50"
              >
                <div className="text-blue-700 mb-4 flex justify-center">
                  {service.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t(`services.${service.key}.title`)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(`services.${service.key}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t("howItWorks.title")}
          </h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            {t("howItWorks.subtitle")}
          </p>
          <div className="grid md:grid-cols-4 gap-8">
            {["step1", "step2", "step3", "step4"].map((step, idx) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-blue-700 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {t(`howItWorks.${step}.title`)}
                </h3>
                <p className="text-sm text-gray-600">
                  {t(`howItWorks.${step}.desc`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form Section */}
      <section id="apply" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            {t("applicationForm.title")}
          </h2>
          <p className="text-gray-600 text-center mb-8">
            {t("applicationForm.subtitle")}
          </p>
          <ApplicationForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-semibold mb-4">
                {t("footer.company")}
              </h3>
              <p className="text-sm">{t("footer.address")}</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">
                {t("footer.contact")}
              </h3>
              <p className="text-sm">info@estonturk.com</p>
              <p className="text-sm">+372 XXXX XXXX</p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">
                {t("footer.followUs")}
              </h3>
              <div className="flex gap-4">
                <span className="text-sm">LinkedIn</span>
                <span className="text-sm">Twitter</span>
                <span className="text-sm">Facebook</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} {t("footer.company")}. {t("footer.rights")}
          </div>
        </div>
      </footer>
    </div>
  );
}
