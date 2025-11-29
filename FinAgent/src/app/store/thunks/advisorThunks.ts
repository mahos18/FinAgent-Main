import { createAsyncThunk } from '@reduxjs/toolkit';
import { advisorAPI } from '../../../services/api';
import { addMessage, setTyping, setLoading, setError ,setMessages} from '../slices/advisorSlice';
import { Message } from '../../../types';

export const sendMessageToAdvisor = createAsyncThunk(
  'advisor/sendMessage',
  async (messageText: string, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      dispatch(setTyping(true));

      // Add user message to UI immediately
      const userMessage: Message = {
        id: Date.now(), // Temporary ID
        sender: 'user',
        text: messageText,
        timestamp: new Date().toISOString(),
      };
      dispatch(addMessage(userMessage));

      // Send message to backend
      const response = await advisorAPI.sendMessage(messageText);

      // Update user message with real ID from backend
      const updatedUserMessage: Message = {
        id: response.data.id,
        sender: 'user',
        text: response.data.text,
        timestamp: new Date().toISOString(),
      };

      // TODO: Get AI response from backend
      // For now, simulate AI response
      setTimeout(() => {
        const aiMessage: Message = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: 'Thank you for your message. I\'m analyzing your financial data and will provide insights shortly.',
          timestamp: new Date().toISOString(),
        };
        dispatch(addMessage(aiMessage));
        dispatch(setTyping(false));
        dispatch(setLoading(false));
      }, 1500);

      return updatedUserMessage;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to send message';
      dispatch(setError(message));
      dispatch(setTyping(false));
      dispatch(setLoading(false));
      return rejectWithValue(message);
    }
  }
);

export const loadConversationHistory = createAsyncThunk(
  'advisor/loadHistory',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(setLoading(true));
      const history = await advisorAPI.getConversationHistory();
      
      // Convert backend format to frontend format
      const messages: Message[] = history.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.message,
        timestamp: msg.created_at,
      }));

      dispatch(setMessages(messages));
      dispatch(setLoading(false));
      return messages;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to load conversation history';
      dispatch(setError(message));
      dispatch(setLoading(false));
      return rejectWithValue(message);
    }
  }
);