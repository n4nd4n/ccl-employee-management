import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  HelpCircle,
  FileText,
  Upload,
  Shield,
  Clock,
  CheckCircle,
  X
} from 'lucide-react';

const faqs = [
  {
    id: 1,
    question: "How do I upload documents?",
    answer: "To upload documents, go to the 'Upload Documents' tab in your dashboard. Select the document category, choose your file (PDF, JPEG, or PNG), add an optional description, and click 'Upload Document'. Your document will be sent for HR review.",
    keywords: ["upload", "document", "file", "how"]
  },
  {
    id: 2,
    question: "Which documents are required?",
    answer: "All employees must submit the following documents: 1) ID Proof, 2) Medical Certificate, 3) Training Certificate, and 4) Safety Training Certificate. These are mandatory for compliance.",
    keywords: ["required", "documents", "mandatory", "which", "what"]
  },
  {
    id: 3,
    question: "What file formats are supported?",
    answer: "We accept PDF, JPEG, and PNG files. The maximum file size is 10MB. Please ensure your documents are clear and readable.",
    keywords: ["format", "file", "type", "pdf", "jpeg", "png", "size"]
  },
  {
    id: 4,
    question: "How long does document review take?",
    answer: "Document review typically takes 2-3 business days. You'll see the status change from 'Pending' to 'Approved' or 'Rejected' in your dashboard. You'll also receive notifications about status changes.",
    keywords: ["review", "time", "long", "approval", "pending"]
  },
  {
    id: 5,
    question: "What if my document is rejected?",
    answer: "If your document is rejected, you can upload a new version. Check the rejection reason and ensure your new document meets all requirements. Common reasons include poor image quality, expired documents, or incorrect document type.",
    keywords: ["rejected", "rejection", "reupload", "denied"]
  },
  {
    id: 6,
    question: "How do I check my compliance status?",
    answer: "Your compliance status is displayed on your dashboard. You can see which documents are approved, pending, or rejected. The compliance percentage shows your overall progress.",
    keywords: ["status", "compliance", "check", "progress"]
  },
  {
    id: 7,
    question: "Can I update my profile information?",
    answer: "Currently, profile updates need to be requested through HR. Contact your HR representative to update your name, email, or role information.",
    keywords: ["profile", "update", "change", "information"]
  },
  {
    id: 8,
    question: "Who can I contact for help?",
    answer: "For technical issues, contact IT support. For document-related questions or compliance issues, contact your HR representative. Emergency contacts are available in the company directory.",
    keywords: ["help", "contact", "support", "assistance"]
  }
];

const quickActions = [
  { text: "How to upload documents?", icon: Upload },
  { text: "Required documents", icon: FileText },
  { text: "File formats", icon: HelpCircle },
  { text: "Review time", icon: Clock }
];

export default function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: "Hello! I'm here to help you with document uploads and compliance questions. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findBestAnswer = (userInput) => {
    const input = userInput.toLowerCase();
    let bestMatch = null;
    let maxScore = 0;

    faqs.forEach(faq => {
      let score = 0;
      faq.keywords.forEach(keyword => {
        if (input.includes(keyword)) {
          score += 1;
        }
      });
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = faq;
      }
    });

    if (maxScore > 0) {
      return bestMatch.answer;
    }

    return "I'm sorry, I don't have a specific answer for that question. Here are some common topics I can help with:\n\n• Document upload process\n• Required documents\n• File formats and requirements\n• Review timelines\n• Compliance status\n\nYou can also contact HR for personalized assistance.";
  };

  const handleSendMessage = async (message = inputValue) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: findBestAnswer(message),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleQuickAction = (actionText) => {
    handleSendMessage(actionText);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md h-[600px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">CCL Assistant</CardTitle>
              <CardDescription className="text-sm">
                Here to help with compliance questions
              </CardDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.type === 'bot' && (
                        <Bot className="h-4 w-4 mt-0.5 text-blue-600" />
                      )}
                      {message.type === 'user' && (
                        <User className="h-4 w-4 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="text-sm whitespace-pre-line">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-blue-600" />
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="p-4 border-t">
              <p className="text-sm text-gray-600 mb-3">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="h-auto p-2 text-xs"
                      onClick={() => handleQuickAction(action.text)}
                    >
                      <Icon className="h-3 w-3 mr-1" />
                      {action.text}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your question..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isTyping}
                size="sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

