import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../common/Button';
import { chatApi } from '../../services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatAreaProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  chatId: string | null;
  projectId?: string;
  onChatCreated?: (chatId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ isSidebarOpen, toggleSidebar, chatId, projectId, onChatCreated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatId) {
      loadMessages(chatId);
    } else {
      setMessages([]);
    }
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async (id: string) => {
    try {
      const response = await chatApi.getChat(id);
      if (response.data && response.data.messages) {
        setMessages(response.data.messages);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const tempId = Date.now().toString();
    const newMessage: Message = { id: tempId, role: 'user', content: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');

    try {
      let responseData: { response: string };
      
      if (!chatId) {
        // Lazy creation
        const res = await chatApi.startChat({ content: newMessage.content, projectId });
        responseData = { response: res.data.response };
        if (onChatCreated) {
          onChatCreated(res.data.chat.id);
        }
      } else {
        // Existing chat
        const res = await chatApi.sendMessage({ chatId, content: newMessage.content });
        responseData = { response: res.data.response };
      }
      
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: responseData.response 
      }]);
    } catch (err) {
      console.error('Failed to send message', err);
      // Show error in UI (maybe remove the optimistic message or show error state)
    }
  };

  return (
    <div className="flex-column full-height" style={{ flex: 1, position: 'relative' }}>
      {/* Header */}
      <div className="flex-between p-4 border-b border-slate-200" style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', height: 'var(--header-height)' }}>
        <div className="flex-center gap-2">
          {!isSidebarOpen && (
            <button onClick={toggleSidebar} className="btn-secondary" style={{ padding: '0.25rem 0.5rem' }}>
              ☰
            </button>
          )}
          <h2 className="text-lg font-bold">
            {chatId ? 'Chat' : (projectId ? 'New Project Chat' : 'New Chat')}
          </h2>
        </div>
        <div>
          {/* User Profile / Settings */}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '70%',
              backgroundColor: msg.role === 'user' ? 'var(--primary-color)' : 'white',
              color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
              padding: '1rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-sm)',
              border: msg.role === 'assistant' ? '1px solid #e2e8f0' : 'none'
            }}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200" style={{ padding: '2rem', borderTop: '1px solid #e2e8f0', backgroundColor: 'white' }}>
        <div className="container" style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSend} className="flex-column gap-2">
            <div style={{ 
              border: '1px solid #e2e8f0', 
              borderRadius: 'var(--radius-md)', 
              padding: '0.5rem',
              boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)'
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={projectId ? "Type your message (Project Context)..." : "Type your message..."}
                className="input-field"
                style={{ 
                  width: '100%', 
                  border: 'none', 
                  outline: 'none', 
                  padding: '0.5rem',
                  fontSize: '1rem'
                }}
              />
              
              <div className="flex-between" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                <select 
                  value={selectedModel} 
                  onChange={(e) => setSelectedModel(e.target.value)}
                  style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: 'var(--radius-sm)', 
                    border: 'none',
                    fontSize: '0.875rem',
                    backgroundColor: '#f8fafc',
                    color: '#64748b'
                  }}
                >
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
                <Button type="submit" disabled={!input.trim()}>Send</Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
