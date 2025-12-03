import React, { useState } from 'react';
import { Sidebar } from '../../components/layout/Sidebar';
import { ChatArea } from '../../components/chat/ChatArea';

export const Home: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleSelectChat = (chatId: string | null, projectId?: string) => {
    setSelectedChatId(chatId);
    setSelectedProjectId(projectId);
  };

  const handleChatCreated = (newChatId: string) => {
    setSelectedChatId(newChatId);
    // Trigger sidebar refresh by changing state
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="flex-row full-height full-width" style={{ height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        onSelectChat={handleSelectChat}
        selectedChatId={selectedChatId}
        refreshTrigger={refreshTrigger}
      />
      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        <ChatArea 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          chatId={selectedChatId}
          projectId={selectedProjectId}
          onChatCreated={handleChatCreated}
        />
      </div>
    </div>
  );
};
