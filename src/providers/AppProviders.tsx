import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";
import * as Font from "expo-font";
import { theme } from "../design-system/theme";

// Keep splash screen visible until initial fonts & state are ready
SplashScreen.preventAutoHideAsync().catch(() => {});

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error: any) => {
        // Do not retry 40x error or deliberate test errors repeatedly
        if (failureCount >= 2) return false;
        return true;
      },
    },
    mutations: {
      retry: false, // Never automatically retry financial or state mutations
    },
  },
});

interface AppProvidersProps {
  children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("LIIT Application Error Boundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Application Error</Text>
          <Text style={styles.errorMessage}>{this.state.error?.message}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load typography fonts or fallbacks
        await Font.loadAsync({
          // Add font assets when available, otherwise system fallbacks are used
        });
      } catch (e) {
        console.warn("Font loading notice:", e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null; // Keep splash screen visible
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ErrorBoundary>{children}</ErrorBoundary>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: theme.colors.canvas,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  errorTitle: {
    color: theme.colors.statusDanger,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  errorMessage: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
  },
});
