import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface OnboardingState {
  completed: boolean;
  currentStep: number;
  smsOptIn: boolean;
  occupation: 'employed' | 'freelancer' | 'student' | 'other' | null;
  monthlyIncome: number | null;
}

const initialState: OnboardingState = {
  completed: false,
  currentStep: 0,
  smsOptIn: false,
  occupation: null,
  monthlyIncome: null,
};

const onboardingSlice = createSlice({
  name: 'onboarding',
  initialState,
  reducers: {
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    nextStep: (state) => {
      state.currentStep += 1;
    },
    setSmsOptIn: (state, action: PayloadAction<boolean>) => {
      state.smsOptIn = action.payload;
    },
    setOccupation: (state, action: PayloadAction<'employed' | 'freelancer' | 'student' | 'other'>) => {
      state.occupation = action.payload;
    },
    setMonthlyIncome: (state, action: PayloadAction<number>) => {
      state.monthlyIncome = action.payload;
    },
    completeOnboarding: (state) => {
      state.completed = true;
    },
    resetOnboarding: (state) => {
      state.completed = false;
      state.currentStep = 0;
      state.smsOptIn = false;
      state.occupation = null;
      state.monthlyIncome = null;
    },
  },
});

export const {
  setStep,
  nextStep,
  setSmsOptIn,
  setOccupation,
  setMonthlyIncome,
  completeOnboarding,
  resetOnboarding,
} = onboardingSlice.actions;

export default onboardingSlice.reducer;