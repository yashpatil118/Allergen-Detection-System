
import { supabase } from '@/integrations/supabase/client';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatResponse {
  success: boolean;
  response?: string;
  ai_powered?: boolean;
  error?: string;
}

/**
 * Send message to AI chatbot
 */
export const sendChatMessage = async (
  message: string,
  userId?: string,
  conversationHistory: ChatMessage[] = []
): Promise<ChatResponse> => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-chatbot', {
      body: {
        message,
        user_id: userId,
        conversation_history: conversationHistory
      }
    });

    if (error) {
      console.error('Error calling ai-chatbot function:', error);
      return {
        success: false,
        error: error.message || 'Failed to get response'
      };
    }

    return data;
  } catch (error) {
    console.error('Exception in sendChatMessage:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
