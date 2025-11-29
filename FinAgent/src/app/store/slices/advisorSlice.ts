import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Message } from '../../../types';

interface AdvisorState {
  messages: Message[];
  loading: boolean;
  typing: boolean;
  error: string | null;
}

const initialState: AdvisorState = {
  messages: [],
  loading: false,
  typing: false,
  error: null,
};

const advisorSlice = createSlice({
  name: 'advisor',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    setMessages: (state, action: PayloadAction<Message[]>) => {
      state.messages = action.payload;
    },
    setTyping: (state, action: PayloadAction<boolean>) => {
      state.typing = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const { addMessage, setMessages, setTyping, setLoading, setError, clearMessages } = advisorSlice.actions;
export default advisorSlice.reducer;