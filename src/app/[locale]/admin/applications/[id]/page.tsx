"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "@/components/ui/toaster";
import type { Application, TabId } from "@/types/admin";
import { ApplicationHeader } from "@/components/admin/application-header";
import { ApplicationTabs } from "@/components/admin/application-tabs";
import { TabOverview } from "@/components/admin/tab-overview";
import { TabQuotes } from "@/components/admin/tab-quotes";
import { TabWorkflow } from "@/components/admin/tab-workflow";
import { TabDocuments } from "@/components/admin/tab-documents";
import { TabNotes } from "@/components/admin/tab-notes";
import { TabCompany } from "@/components/admin/tab-company";

export default function AdminApplicationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const { data: session, status } = useSession();
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const activeTab = (searchParams.get("tab") as TabId) || "overview";

  const setActiveTab = useCallback(
    (tab: TabId) => {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      window.history.replaceState({}, "", url.toString());
    },
    []
  );

  useEffect(() => {
    if (status === "authenticated") {
      const user = session?.user as { role?: string } | undefined;
      if (user?.role !== "ADMIN") {
        router.push("/dashboard");
        return;
      }
      fetchApp();
    } else if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, session, router]);

  const fetchApp = useCallback(async () => {
    const res = await fetch(`/api/applications/${id}`);
    if (res.ok) {
      const data = await res.json();
      setApp(data.application);
    }
    setLoading(false);
  }, [id]);

  async function updateStatus(newStatus: string) {
    const res = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      toast(t("admin.toast.statusUpdated"), "success");
      fetchApp();
    }
  }

  if (loading || !app) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-navy-200 border-t-gold-500 rounded-full animate-spin" />
          <p className="text-navy-400 text-sm">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview" as TabId },
    { id: "quotes" as TabId, count: app.quotes.length },
    { id: "workflow" as TabId, count: app.workflows.length },
    { id: "documents" as TabId, count: app.documents.length },
    { id: "notes" as TabId, count: app.notes.length },
    { id: "company" as TabId, count: app.companyRecord ? 1 : 0 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ApplicationHeader app={app} onStatusChange={updateStatus} />
      <ApplicationTabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" && <TabOverview app={app} />}
      {activeTab === "quotes" && (
        <TabQuotes quotes={app.quotes} applicationId={id} onRefresh={fetchApp} />
      )}
      {activeTab === "workflow" && (
        <TabWorkflow workflows={app.workflows} applicationId={id} onRefresh={fetchApp} />
      )}
      {activeTab === "documents" && (
        <TabDocuments documents={app.documents} applicationId={id} onRefresh={fetchApp} />
      )}
      {activeTab === "notes" && (
        <TabNotes notes={app.notes} applicationId={id} onRefresh={fetchApp} />
      )}
      {activeTab === "company" && (
        <TabCompany
          companyRecord={app.companyRecord}
          applicationId={id}
          companyName={app.companyName}
          onRefresh={fetchApp}
        />
      )}
    </div>
  );
}
