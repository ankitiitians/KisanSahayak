import { useState, useEffect, useRef } from 'react';
import { useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/context/LanguageContext';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageWithSenderInfo } from '@/types';
import { 
  MessageSquare, 
  Send, 
  User,
  Search
} from 'lucide-react';

type Conversation = {
  userId: number;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
};

export default function Messages() {
  const { t, language } = useLanguage();
  const { userId } = useParams<{ userId?: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeConversation, setActiveConversation] = useState<number | null>(
    userId ? parseInt(userId) : null
  );

  // Check if user is logged in
  const { data: currentUser } = useQuery<{ id: number; role: string; name: string } | null>({
    queryKey: ['/api/auth/me'],
  });

  // Fetch conversations
  const { data: conversations, isLoading: loadingConversations } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: !!currentUser,
  });

  // Fetch messages for active conversation
  const { data: messages, isLoading: loadingMessages } = useQuery<MessageWithSenderInfo[]>({
    queryKey: ['/api/messages/conversation', activeConversation],
    enabled: !!currentUser && !!activeConversation,
  });

  // Fetch active user details
  const { data: activeUser } = useQuery<{ id: number; name: string; role: string }>({
    queryKey: ['/api/users', activeConversation],
    enabled: !!currentUser && !!activeConversation,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!activeConversation) return null;
      return apiRequest('POST', '/api/messages', { 
        receiverId: activeConversation, 
        content 
      });
    },
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversation', activeConversation] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    },
    onError: (error: Error) => {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Scroll to bottom of messages when new messages arrive
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message submission
  const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  // Format date
  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today, show time
      return date.toLocaleTimeString(language === 'en' ? 'en-US' : 'hi-IN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      // Yesterday
      return language === 'en' ? 'Yesterday' : 'कल';
    } else if (diffDays < 7) {
      // Within a week
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
        weekday: 'short',
      });
    } else {
      // Older
      return date.toLocaleDateString(language === 'en' ? 'en-US' : 'hi-IN', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Filter conversations by search query
  const filteredConversations = conversations?.filter(conversation =>
    conversation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-poppins font-semibold text-2xl md:text-3xl flex items-center mb-6">
          <MessageSquare className="mr-2 h-6 w-6" />
          {t('messages')}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="md:col-span-1">
            <Card className="h-[70vh] flex flex-col">
              <CardHeader className="py-3">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <Input 
                      placeholder={language === 'en' ? "Search conversations..." : "वार्तालाप खोजें..."}
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  {loadingConversations ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-center p-3 rounded-lg">
                          <Skeleton className="h-10 w-10 rounded-full mr-3" />
                          <div className="flex-grow">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="h-5 w-10" />
                        </div>
                      ))}
                    </div>
                  ) : filteredConversations && filteredConversations.length > 0 ? (
                    <div className="space-y-1">
                      {filteredConversations.map((conversation) => (
                        <div 
                          key={conversation.userId}
                          className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                            activeConversation === conversation.userId 
                              ? 'bg-primary-light/10' 
                              : 'hover:bg-neutral-100'
                          }`}
                          onClick={() => setActiveConversation(conversation.userId)}
                        >
                          <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-neutral-600" />
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate">{conversation.name}</h3>
                              <span className="text-xs text-neutral-500 flex-shrink-0 ml-2">
                                {formatMessageTime(conversation.lastMessageTime)}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-600 truncate">{conversation.lastMessage}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <Badge className="ml-2 bg-primary text-white">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        {language === 'en' ? 'No messages yet' : 'अभी तक कोई संदेश नहीं'}
                      </h3>
                      <p className="text-neutral-500 mb-4 text-sm">
                        {language === 'en' 
                          ? 'Your conversations will appear here' 
                          : 'आपकी वार्तालाप यहां दिखाई देंगी'}
                      </p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
          
          {/* Messages */}
          <div className="md:col-span-2">
            <Card className="h-[70vh] flex flex-col">
              {activeConversation ? (
                <>
                  <CardHeader className="py-3 flex-shrink-0">
                    {loadingMessages || !activeUser ? (
                      <div className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <div>
                          <Skeleton className="h-5 w-32 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center mr-3">
                          <User className="h-5 w-5 text-neutral-600" />
                        </div>
                        <div>
                          <CardTitle>{activeUser.name}</CardTitle>
                          <CardDescription>
                            {activeUser.role === 'farmer' 
                              ? (language === 'en' ? 'Farmer' : 'किसान')
                              : (language === 'en' ? 'Customer' : 'ग्राहक')}
                          </CardDescription>
                        </div>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="flex-grow overflow-hidden flex flex-col">
                    <ScrollArea className="flex-grow pr-4" ref={messageContainerRef}>
                      {loadingMessages ? (
                        <div className="space-y-4 p-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : ''}`}>
                              <div className={`max-w-[80%] ${i % 2 === 0 ? 'bg-primary-light/10' : 'bg-neutral-100'} rounded-lg p-3`}>
                                <Skeleton className="h-4 w-40 mb-1" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : messages && messages.length > 0 ? (
                        <div className="space-y-4 p-2">
                          {messages.map((msg) => {
                            const isSentByMe = msg.senderId === currentUser?.id;
                            return (
                              <div key={msg.id} className={`flex ${isSentByMe ? 'justify-end' : ''}`}>
                                <div 
                                  className={`max-w-[80%] ${
                                    isSentByMe 
                                      ? 'bg-primary text-white' 
                                      : 'bg-neutral-100'
                                  } rounded-lg p-3`}
                                >
                                  <p>{msg.content}</p>
                                  <p className={`text-xs ${isSentByMe ? 'text-white/70' : 'text-neutral-500'} mt-1`}>
                                    {formatMessageTime(msg.createdAt)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center py-6">
                            <MessageSquare className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                              {language === 'en' ? 'No messages yet' : 'अभी तक कोई संदेश नहीं'}
                            </h3>
                            <p className="text-neutral-500 mb-4 text-sm">
                              {language === 'en' 
                                ? 'Send a message to start the conversation' 
                                : 'वार्तालाप शुरू करने के लिए एक संदेश भेजें'}
                            </p>
                          </div>
                        </div>
                      )}
                    </ScrollArea>
                    
                    <form onSubmit={handleSendMessage} className="mt-4 flex space-x-2">
                      <Input 
                        placeholder={t('typeMessage')}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="flex-grow"
                      />
                      <Button 
                        type="submit" 
                        className="bg-primary hover:bg-primary-dark"
                        disabled={!message.trim() || sendMessageMutation.isPending}
                      >
                        {sendMessageMutation.isPending ? '...' : t('send')}
                        <Send className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  </CardContent>
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center py-12">
                    <MessageSquare className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h2 className="text-xl font-medium mb-2">
                      {language === 'en' ? 'Your Messages' : 'आपके संदेश'}
                    </h2>
                    <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                      {language === 'en' 
                        ? 'Select a conversation from the list to view messages or start a new conversation from a product page.' 
                        : 'संदेश देखने के लिए सूची से एक वार्तालाप चुनें या उत्पाद पृष्ठ से एक नया वार्तालाप शुरू करें।'}
                    </p>
                    <Button 
                      variant="outline"
                      onClick={() => window.location.href = '/products'}
                    >
                      {language === 'en' ? 'Browse Products' : 'उत्पाद ब्राउज़ करें'}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
