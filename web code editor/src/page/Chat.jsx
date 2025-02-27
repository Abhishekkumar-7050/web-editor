import { useState, useRef, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import '../styles/chat.css';
import axios from 'axios';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatContainerRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');

    try {
      // Show loading state
      setMessages([...newMessages, { role: 'assistant', content: '...' }]);

      const response = await axios.post('http://localhost:5000/api/chat/generate', {
        prompt: input
      });

      // Update with actual response
      setMessages([...newMessages, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([...newMessages, { 
        role: 'assistant', 
        content: 'Sorry, there was an error generating the response.' 
      }]);
    }
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      // You could add a toast notification here
      alert('Code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const clearChat = () => {
    if (window.confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
    }
  };

  const retryLastMessage = () => {
    if (messages.length >= 2) {
      const lastUserMessage = messages[messages.length - 2];
      if (lastUserMessage.role === 'user') {
        // Remove the last AI response
        const newMessages = messages.slice(0, -1);
        setMessages(newMessages);
        // Here you would make a new API call with the last user message
        const mockResponse = "Here's a new response:\n```javascript\nconsole.log('Retried response');\n```";
        setMessages([...newMessages, { role: 'assistant', content: mockResponse }]);
      }
    }
  };

  const renderMessage = (content) => {
    const parts = content.split(/(```[\s\S]*?```)/);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const code = part.slice(3, -3);
        const language = code.split('\n')[0];
        const actualCode = code.split('\n').slice(1).join('\n');
        
        return (
          <div key={index} className="code-block">
            <div className="code-header">
              <span>{language}</span>
              <div className="code-actions">
                <button 
                  onClick={() => copyCode(actualCode)}
                  className="action-button"
                >
                  📋 Copy
                </button>
              </div>
            </div>
            <Editor
              height="200px"
              theme="vs-dark"
              language={language}
              value={actualCode}
              options={{ readOnly: true, minimap: { enabled: false } }}
            />
          </div>
        );
      }
      return <p key={index}>{part}</p>;
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>AI Chat</h2>
        <div className="chat-actions">
          <button 
            onClick={retryLastMessage} 
            className="action-button"
            disabled={messages.length < 2}
          >
            🔄 Retry
          </button>
          <button 
            onClick={clearChat} 
            className="action-button"
            disabled={messages.length === 0}
          >
            🗑️ Clear
          </button>
        </div>
      </div>
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {renderMessage(message.content)}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="chat-input"
        />
      </form>
    </div>
  );
};

export default Chat; 