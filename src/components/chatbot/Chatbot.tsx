import React, { useState, useRef, useEffect } from 'react';
import { getChatbotResponse } from '../../services/geminiService';
import type { AnalysisData, ChatMessage } from '../../types';
import FormattedText from '../ui/FormattedText';

// A clean, reliable SVG icon for the chatbot, embedded as a data URL to guarantee it loads.
const chatbotIconSvg = "data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' height='24px' viewBox='0 0 24 24' width='24px' fill='%23FFFFFF'%3e%3cpath d='M0 0h24v24H0V0z' fill='none'/%3e%3cpath d='M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1zm-4 6V4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z'/%3e%3c/svg%3e";

const ChatbotIcon = () => (
    <img
        src={chatbotIconSvg}
        alt="AI Assistant"
        className="w-8 h-8 object-contain group-hover:scale-110 transition-transform duration-300"
    />
);

interface ChatbotProps {
    analysisData: AnalysisData;
    locationName: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ analysisData, locationName }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const initialMessage = `Hi! I'm your climate AI assistant. Ask me anything about the analysis for ${locationName}. For example: "What's the typical high temperature?" or "Is it likely to rain?"`;
            setMessages([{
                role: 'model',
                content: initialMessage
            }]);
        }
    }, [isOpen, messages.length, locationName]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setUserInput('');
        setIsLoading(true);

        try {
            const response = await getChatbotResponse(userInput, analysisData);
            setMessages([...newMessages, { role: 'model', content: response }]);
        } catch (error) {
            setMessages([...newMessages, { role: 'model', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white w-16 h-16 flex items-center justify-center rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 z-30 group"
                aria-label="Open Climate AI Chat"
            >
                <ChatbotIcon />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[calc(100%-3rem)] max-w-md h-[70vh] max-h-[600px] bg-gray-800/80 backdrop-blur-md rounded-xl shadow-2xl flex flex-col z-30 border border-gray-700">
            <header className="flex items-center justify-between p-4 border-b border-gray-700">
                <h3 className="text-lg font-bold text-white">Climate AI Assistant</h3>
                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white" aria-label="Close chat">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-sm rounded-lg px-4 py-2 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            <div className="prose prose-invert prose-sm">
                                <FormattedText text={msg.content} />
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="bg-gray-700 rounded-lg px-4 py-2 flex items-center space-x-2">
                           <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                           <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                           <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask about the data..."
                        className="flex-1 p-2 border border-gray-600 rounded-md bg-gray-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-800"
                        aria-label="Chat input"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !userInput.trim()} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed transition-colors">
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Chatbot;