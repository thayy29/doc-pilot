"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { projectApiService } from "@/services/projectApiService";
import type { Project } from "@/services/projectApiService";
import AuthUserMenu from "@/components/AuthUserMenu";
import Topbar from "@/components/Topbar";
import DocumentList from "@/components/DocumentList";
import ChatWindow from "@/components/ChatWindow";
import DocGenerator from "@/components/DocGenerator";

type Tab = "documents" | "chat" | "generate";

type Props = {
  params: Promise<{ id: string }>;
};

export default function ProjectPage({ params }: Props) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("documents");
  const [projectId, setProjectId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setProjectId(id);
      projectApiService
        .getById(id)
        .then(setProject)
        .catch(() => router.push("/projects"))
        .finally(() => setLoading(false));
    });
  }, [params, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-sm font-semibold text-foreground-muted">
          Carregando projeto...
        </p>
      </div>
    );
  }

  if (!project) return null;

  const tabs: { key: Tab; label: string }[] = [
    { key: "documents", label: "Documentos" },
    { key: "chat", label: "Chat" },
    { key: "generate", label: "Gerar Docs" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden px-3 py-3 sm:px-4 sm:py-4 md:px-6 lg:px-10">
        <Topbar
          projectLabel={project.name}
          statusLabel=""
          anchors={[
            {
              key: "projects",
              label: "← Projetos",
              href: "/projects",
            },
          ]}
          rightSlot={<AuthUserMenu />}
        />

        {/* Tabs */}
        <div className="mt-4 flex shrink-0 items-center gap-1 border-b border-border pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                "rounded-t-lg px-4 py-2 text-xs font-black transition-all",
                activeTab === tab.key
                  ? "border border-b-background border-border bg-background text-foreground -mb-px"
                  : "text-foreground-muted hover:text-foreground",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conteúdo da aba ativa */}
        <main className="mt-4 min-h-0 flex-1 overflow-y-auto">
          {activeTab === "documents" && (
            <DocumentList projectId={projectId} />
          )}

          {activeTab === "chat" && (
            <div className="flex min-h-full flex-col">
              <ChatWindow projectId={projectId} />
            </div>
          )}

          {activeTab === "generate" && (
            <div className="flex min-h-full flex-col">
              <DocGenerator projectId={projectId} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
