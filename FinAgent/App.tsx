import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import Navigation from './src/navigation';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { checkAuthStatus } from './src/app/store/thunks/authThunks';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <Text style={styles.errorDetail}>{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuth = async () => {
      
      try {
        console.log('Checking auth status...');
        const result = await store.dispatch(checkAuthStatus());
        console.log('Auth check result:', result);
      } catch (error) {
        console.log('Auth check error:', error);
        // Error is expected if no token or token is invalid
      }
       finally {
        console.log('Auth check complete, setting isCheckingAuth to false');
        setIsCheckingAuth(false);
       }
    };

    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth check timeout, forcing navigation');
      setIsCheckingAuth(false);
    }, 3000); // 3 second timeout

    checkAuth().finally(() => {
      clearTimeout(timeout);
    });

    return () => clearTimeout(timeout);
  }, []);

  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5B2DD3" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Navigation />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b0f19',
    padding: 20,
  },
  errorText: {
    color: '#E6EEF6',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    color: '#9AA6B2',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0b0f19',
  },
  loadingText: {
    color: '#E6EEF6',
    fontSize: 16,
    marginTop: 10,
  },
});