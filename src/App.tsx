import React, { useState, useMemo, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from "./components/layout/Sidebar";
import { Header } from './components/layout/Header';
import { Toaster } from '@/components/ui/sonner';
import { useGlobalFiltersStore } from './stores/useGlobalFiltersStore';
import { ChatInterface } from './components/ChatInterface';
import { GenerateReportModal } from './components/GenerateReportModal';
import { cn } from './lib/utils';
import { useChangelog } from './hooks/useChangelog';
import { WhatIsNewModal } from './components/WhatIsNewModal';
import { HeaderConfig, OutletContextType } from './types/header';
const defaultHeaderConfig: HeaderConfig = {
  title: 'BuyersLens Prototype',
  breadcrumbs: [{ label: 'Home' }],
  showFilters: false,
};
export function App() {
  const showChatUI = useGlobalFiltersStore((state) => state.showChatUI);
  const { modalConfig, closeReportModal } = useGlobalFiltersStore();
  const { isModalOpen, closeModal, changelogItems } = useChangelog();
  const [headerConfig, setHeaderConfig] = useState<HeaderConfig>(defaultHeaderConfig);
  const stableSetHeaderConfig = useCallback((config: Partial<HeaderConfig>) => {
    setHeaderConfig(prevConfig => ({ ...prevConfig, ...config }));
  }, []);
  const outletContext: OutletContextType = useMemo(() => ({
    setHeaderConfig: stableSetHeaderConfig,
  }), [stableSetHeaderConfig]);
  return (
    <div className={cn(
      "grid h-screen w-full",
      showChatUI
        ? "md:grid-cols-[220px_1fr_350px] lg:grid-cols-[280px_1fr_400px]"
        : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
    )}>
      <Sidebar />
      <div className="flex flex-col h-screen overflow-hidden">
        <Header {...headerConfig} />
        <main className="flex-1 overflow-y-auto bg-muted/40 p-4 sm:p-6 lg:p-8">
          <Outlet context={outletContext} />
        </main>
      </div>
      {showChatUI && <ChatInterface />}
      <Toaster richColors />
      <GenerateReportModal
        isOpen={modalConfig.isOpen}
        onOpenChange={(isOpen) => !isOpen && closeReportModal()}
        initialPromptId={modalConfig.initialPromptId}
        initialOutcomeFilter={modalConfig.initialOutcomeFilter} />
      <WhatIsNewModal
        isOpen={isModalOpen}
        onClose={closeModal}
        items={changelogItems}
      />
    </div>);
}