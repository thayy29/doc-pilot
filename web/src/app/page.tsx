'use client';

import { useState } from "react";
import Card from "@/components/Card";
import SectionHeader from "@/components/SectionHeader";
import Topbar from "@/components/Topbar";
import ProjectList from "@/components/ProjectList";
import NewProjectModal from "@/components/NewProjectModal";
import ChatDemo from "@/components/ChatDemo";
import DocsDemo from "@/components/DocsDemo";
import { useProjects } from "@/hooks/useProjects";

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { createProject, loading } = useProjects();

  const handleCreateProject = (name: string) => {
    createProject({ name });
    setIsModalOpen(false);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-sans">
      <main className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col gap-3 overflow-x-hidden px-3 py-3 sm:gap-4 sm:px-4 sm:py-4 md:gap-5 md:px-6 lg:px-10">
        <Topbar
          projectLabel="Projeto: Cliente X * Billing API"
          statusLabel="Indexado"
          anchors={[
            { key: "projects", label: "Projetos", active: true, href: "/projects" },
            { key: "chat", label: "Chat", href: "/chat" },
            { key: "docs", label: "Gerar Docs", href: "/docs" },
            { key: "sources", label: "Fontes", href: "/sources" },
          ]}
          newHref="#"
          onNewClick={() => setIsModalOpen(true)}
        />
        <Card variant="surface" className="w-full p-4">
          <SectionHeader
            title="Projetos"
            subtitle="Escolha o projeto e gerencie importações."
          />

          <div className="mt-3">
            <ProjectList />
          </div>
        </Card>
        <ChatDemo />
        <DocsDemo />
      </main>

      {/* Modal de Novo Projeto */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateProject}
        loading={loading}
      />
    </div>
  );
}