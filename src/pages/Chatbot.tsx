
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MapPin, Bot, User, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/layouts/DashboardLayout';
import { sendChatMessage, ChatMessage } from '@/utils/chatbotService';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  ai_powered?: boolean;
};

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  distance: string;
  location: string;
  rating: number;
};

const sampleDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    specialty: 'Allergist & Immunologist',
    distance: '2.3 miles',
    location: '123 Medical Center Dr',
    rating: 4.8
  },
  {
    id: '2',
    name: 'Dr. Michael Rodriguez',
    specialty: 'Dermatologist',
    distance: '3.1 miles',
    location: '456 Health Parkway',
    rating: 4.6
  },
  {
    id: '3',
    name: 'Dr. Emily Johnson',
    specialty: 'Allergist & Immunologist',
    distance: '4.5 miles',
    location: '789 Wellness Blvd',
    rating: 4.9
  }
];

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm your AI-powered Allergen Assistant. I can help you find specialists near you, answer questions about managing your allergies, and provide personalized advice based on your allergy profile. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      ai_powered: true
    }
  ]);
  const [showDoctors, setShowDoctors] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getUserId = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.userId || null;
  };

  const getUserAllergies = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.symptoms || localStorage.getItem('allergies') || '';
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    try {
      // Prepare conversation history for AI
      const conversationHistory: ChatMessage[] = messages
        .slice(-6) // Last 6 messages for context
        .map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

      const userId = getUserId();
      const response = await sendChatMessage(input, userId, conversationHistory);

      let botResponse: Message;
      
      if (response.success && response.response) {
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          sender: 'bot',
          timestamp: new Date(),
          ai_powered: response.ai_powered
        };

        // Check if we should show doctors based on the response
        if (input.toLowerCase().includes('doctor') || 
            input.toLowerCase().includes('specialist') || 
            response.response.toLowerCase().includes('specialist')) {
          setShowDoctors(true);
        }
      } else {
        // Fallback response
        botResponse = {
          id: (Date.now() + 1).toString(),
          text: response.error || "I'm sorry, I'm having trouble responding right now. Please try again or contact support if the issue persists.",
          sender: 'bot',
          timestamp: new Date(),
          ai_powered: false
        };
      }
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm experiencing technical difficulties. Please try again in a moment.",
        sender: 'bot',
        timestamp: new Date(),
        ai_powered: false
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout title="AI Allergy Assistant">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="h-[calc(100vh-12rem)] max-h-[800px] flex flex-col"
      >
        <Card className="flex flex-col h-full shadow-lg border-none">
          <CardHeader className="pb-3 border-b bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Bot className="text-primary h-5 w-5" />
              AI Allergy Assistant
              <Badge variant="secondary" className="ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
            </CardTitle>
            <CardDescription>
              Get personalized advice about allergies, find specialists, and manage your condition with AI assistance
              {getUserAllergies() && (
                <div className="mt-2 text-sm">
                  <strong>Your allergies:</strong> {getUserAllergies()}
                </div>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[calc(100vh-20rem)] max-h-[600px]] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                          {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div
                        className={`rounded-lg p-3 text-sm ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary'
                        }`}
                      >
                        <p>{message.text}</p>
                        <div className={`flex items-center justify-between mt-1 ${
                          message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        }`}>
                          <div className="text-xs">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                          {message.sender === 'bot' && message.ai_powered && (
                            <Badge variant="outline" className="text-xs ml-2">
                              <Sparkles className="h-2 w-2 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="flex gap-2 max-w-[80%]">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="rounded-lg p-3 text-sm bg-secondary flex items-center space-x-1">
                        <div className="h-2 w-2 bg-foreground/30 rounded-full animate-pulse"></div>
                        <div className="h-2 w-2 bg-foreground/30 rounded-full animate-pulse delay-150"></div>
                        <div className="h-2 w-2 bg-foreground/30 rounded-full animate-pulse delay-300"></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {showDoctors && (
                  <div className="ml-10 space-y-3 my-4">
                    <h4 className="font-medium text-sm text-muted-foreground">Recommended Specialists:</h4>
                    {sampleDoctors.map((doctor) => (
                      <Card key={doctor.id} className="hover-lift">
                        <CardContent className="p-3 flex items-start gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                              {doctor.name.split(' ')[1][0]}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{doctor.name}</h4>
                            <p className="text-xs text-muted-foreground">{doctor.specialty}</p>
                            
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex items-center text-xs text-amber-500">
                                {Array(5).fill(0).map((_, i) => (
                                  <svg key={i} className={`h-3 w-3 ${i < Math.floor(doctor.rating) ? 'fill-current' : 'fill-muted stroke-muted'}`} viewBox="0 0 24 24">
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                                <span className="ml-1">{doctor.rating}</span>
                              </div>
                              <span className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="h-3 w-3 mr-1" /> {doctor.distance}
                              </span>
                            </div>
                            
                            <p className="text-xs mt-1">{doctor.location}</p>
                          </div>
                          
                          <Button size="sm" variant="outline">
                            Contact
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </CardContent>
          
          <CardFooter className="p-3 border-t">
            <form 
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                type="text"
                placeholder="Ask about allergies, symptoms, or finding specialists..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isTyping}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default Chatbot;
