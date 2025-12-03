import React, { useState, useEffect } from 'react';
import { Button } from '../common/Button';
import { chatApi, projectApi } from '../../services/api';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  onSelectChat: (chatId: string | null, projectId?: string) => void;
  selectedChatId: string | null;
  refreshTrigger?: number; // Trigger to refresh chat list
}

interface Project {
  id: string;
  name: string;
  chats: any[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar, onSelectChat, selectedChatId, refreshTrigger }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectPrompt, setNewProjectPrompt] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadData();
    }
  }, [refreshTrigger]);

  const loadData = async () => {
    try {
      const [chatsRes, projectsRes] = await Promise.all([
        chatApi.getChats(),
        projectApi.getProjects()
      ]);
      setChats(chatsRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    }
  };

  const handleNewChat = () => {
    onSelectChat(null);
  };

  const handleCreateProjectChat = (projectId: string) => {
    onSelectChat(null, projectId);
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to delete all history? This cannot be undone.')) {
      try {
        await chatApi.clearHistory();
        loadData();
        onSelectChat(null);
      } catch (err) {
        console.error('Failed to clear history', err);
      }
    }
  };

  const toggleProject = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      await projectApi.createProject({ name: newProjectName, systemPrompt: newProjectPrompt });
      setIsCreatingProject(false);
      setNewProjectName('');
      setNewProjectPrompt('');
      loadData();
    } catch (err) {
      console.error('Failed to create project', err);
    }
  };

  const filteredChats = chats.filter(chat => 
    !chat.project && chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.chats.some((c: any) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div 
      className="flex-column"
      style={{
        width: isOpen ? 'var(--sidebar-width)' : '64px',
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        transition: 'width var(--transition-normal)',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <div className="flex-column full-height">
        {/* Header Actions */}
        <div className="p-4 border-b border-slate-200" style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isOpen ? (
            <>
              <Button fullWidth className="mb-2" onClick={handleNewChat}>
                + New Chat
              </Button>
              
              <div className="flex-between gap-2" style={{ gap: '0.5rem', display: 'flex', marginBottom: '0.5rem', width: '100%' }}>
                 <input 
                  type="text" 
                  placeholder="Search..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid #e2e8f0',
                    fontSize: '0.875rem'
                  }}
                />
              </div>
               <Button variant="secondary" fullWidth onClick={() => setIsCreatingProject(true)} style={{ fontSize: '0.75rem', padding: '0.5rem' }}>
                  Create Project
                </Button>
            </>
          ) : (
             <Button onClick={handleNewChat} style={{ padding: '0.5rem', minWidth: 'auto' }}>
                +
             </Button>
          )}
        </div>

        {/* Project Creation Modal (Inline) */}
        {isOpen && isCreatingProject && (
          <div style={{ padding: '1rem', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
            <input 
              placeholder="Project Name"
              value={newProjectName}
              onChange={e => setNewProjectName(e.target.value)}
              className="input-field mb-2"
              style={{ width: '100%', marginBottom: '0.5rem' }}
            />
            <textarea 
              placeholder="System Prompt"
              value={newProjectPrompt}
              onChange={e => setNewProjectPrompt(e.target.value)}
              className="input-field mb-2"
              style={{ width: '100%', marginBottom: '0.5rem', minHeight: '60px' }}
            />
            <div className="flex gap-2" style={{ gap: '0.5rem' }}>
              <Button onClick={handleCreateProject} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Save</Button>
              <Button variant="secondary" onClick={() => setIsCreatingProject(false)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Chat List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: isOpen ? 'stretch' : 'center' }}>
          {/* Projects */}
          <div className="mb-4" style={{ width: '100%' }}>
             {isOpen && (
              <h3 className="text-sm font-bold text-secondary mb-2 uppercase" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Projects
              </h3>
            )}
            {filteredProjects.map((project) => (
              <div key={project.id} className="mb-2">
                <div 
                  className="flex-between p-2 rounded hover:bg-slate-100 cursor-pointer"
                  style={{ padding: '0.5rem', fontWeight: 500, justifyContent: isOpen ? 'space-between' : 'center' }}
                >
                  <div onClick={() => toggleProject(project.id)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, justifyContent: isOpen ? 'flex-start' : 'center' }}>
                    <span>{expandedProjects.has(project.id) ? '📂' : '📁'}</span>
                    {isOpen && <span>{project.name}</span>}
                  </div>
                  {isOpen && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleCreateProjectChat(project.id); }}
                      className="hover:text-primary"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1 }}
                      title="New Project Chat"
                    >
                      +
                    </button>
                  )}
                </div>
                
                {isOpen && expandedProjects.has(project.id) && (
                  <div style={{ paddingLeft: '1.5rem', marginTop: '0.25rem' }}>
                    {project.chats && project.chats.map((chat: any) => (
                      <div 
                        key={chat.id} 
                        className={`p-2 rounded hover:bg-slate-100 cursor-pointer mb-1 ${selectedChatId === chat.id ? 'bg-slate-100' : ''}`}
                        style={{ 
                          padding: '0.4rem', 
                          fontSize: '0.85rem',
                          borderRadius: 'var(--radius-sm)', 
                          backgroundColor: selectedChatId === chat.id ? '#f1f5f9' : 'transparent'
                        }}
                        onClick={() => onSelectChat(chat.id)}
                      >
                        {chat.name}
                      </div>
                    ))}
                    {project.chats && project.chats.length === 0 && (
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', padding: '0.4rem' }}>No chats yet</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* General Chats */}
          <div className="mb-4" style={{ width: '100%' }}>
            {isOpen && (
              <h3 className="text-sm font-bold text-secondary mb-2 uppercase" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                Recent Chats
              </h3>
            )}
            {filteredChats.map((chat) => (
              <div 
                key={chat.id} 
                className={`flex-between p-2 rounded hover:bg-slate-100 cursor-pointer mb-1 ${selectedChatId === chat.id ? 'bg-slate-100' : ''}`}
                style={{ 
                  padding: '0.5rem', 
                  borderRadius: 'var(--radius-sm)', 
                  marginBottom: '0.25rem', 
                  backgroundColor: selectedChatId === chat.id ? '#f1f5f9' : 'transparent',
                  justifyContent: isOpen ? 'flex-start' : 'center'
                }}
                onClick={() => onSelectChat(chat.id)}
                title={!isOpen ? chat.name : ''}
              >
                <span className="text-sm truncate" style={{ fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isOpen ? (chat.name || 'New Chat') : '💬'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200" style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
          {isOpen ? (
            <Button variant="secondary" fullWidth onClick={handleClearHistory}>
              Clear History
            </Button>
          ) : (
             <Button variant="secondary" onClick={handleClearHistory} style={{ padding: '0.5rem', minWidth: 'auto' }} title="Clear History">
              🗑️
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
