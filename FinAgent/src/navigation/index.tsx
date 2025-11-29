// import React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { Ionicons } from '@expo/vector-icons';
// import { useAppSelector } from '../app/store';
// import { theme } from '../constants/theme';

// // Auth screens
// import LoginScreen from '../screens/auth/LoginScreen';
// import RegisterScreen from '../screens/auth/RegisterScreen';
// import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// // Onboarding screens
// import OnboardingCarousel from '../screens/onboarding/OnboardingCarousel';
// import IncomeScreen from '../screens/onboarding/IncomeScreen';
// import SmsOptInScreen from '../screens/onboarding/SmsOptInScreen';
// import FinishScreen from '../screens/onboarding/FinishScreen';

// // Main screens
// import DashboardScreen from '../screens/main/DashboardScreen';
// import TransactionsScreen from '../screens/main/TransactionsScreen';
// import BudgetScreen from '../screens/main/BudgetScreen';
// import AdvisorScreen from '../screens/main/AdvisorScreen';
// import ProfileScreen from '../screens/main/ProfileScreen';

// // Modal screens
// import AddTransactionModal from '../screens/modals/AddTransactionModals';
// import CsvUploadScreen from '../screens/modals/CsvUploadScreen';
// import SmsMockScreen from '../screens/modals/SmsMockScreen';
// import TransactionDetailScreen from '../screens/modals/TransactionDetailsScreen';
// import SettingsScreen from '../screens/modals/SettingScreen';

// const Stack = createNativeStackNavigator();
// const Tab = createBottomTabNavigator();

// function AuthStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//         contentStyle: { backgroundColor: theme.colors.background },
//       }}
//     >
//       <Stack.Screen name="Login" component={LoginScreen} />
//       <Stack.Screen name="Register" component={RegisterScreen} />
//       <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
//     </Stack.Navigator>
//   );
// }

// function OnboardingStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//         contentStyle: { backgroundColor: theme.colors.background },
//       }}
//     >
//       <Stack.Screen name="OnboardingCarousel" component={OnboardingCarousel} />
//       <Stack.Screen name="Income" component={IncomeScreen} />
//       <Stack.Screen name="SmsOptIn" component={SmsOptInScreen} />
//       <Stack.Screen name="Finish" component={FinishScreen} />
//     </Stack.Navigator>
//   );
// }

// function MainTabs() {
//   return (
//     <Tab.Navigator
//       screenOptions={({ route }) => ({
//         headerShown: false,
//         tabBarStyle: {
//           backgroundColor: theme.colors.surface,
//           borderTopColor: theme.colors.border,
//           borderTopWidth: 1,
//           height: 60,
//           paddingBottom: 8,
//         },
//         tabBarActiveTintColor: theme.colors.primary,
//         tabBarInactiveTintColor: theme.colors.textSecondary,
//         tabBarIcon: ({ focused, color, size }) => {
//           let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

//           if (route.name === 'Dashboard') {
//             iconName = focused ? 'home' : 'home-outline';
//           } else if (route.name === 'Transactions') {
//             iconName = focused ? 'list' : 'list-outline';
//           } else if (route.name === 'Budget') {
//             iconName = focused ? 'wallet' : 'wallet-outline';
//           } else if (route.name === 'Advisor') {
//             iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
//           } else if (route.name === 'Profile') {
//             iconName = focused ? 'person' : 'person-outline';
//           }

//           return <Ionicons name={iconName} size={size} color={color} />;
//         },
//       })}
//     >
//       <Tab.Screen name="Dashboard" component={DashboardScreen} />
//       <Tab.Screen name="Transactions" component={TransactionsScreen} />
//       <Tab.Screen name="Budget" component={BudgetScreen} />
//       <Tab.Screen name="Advisor" component={AdvisorScreen} />
//       <Tab.Screen name="Profile" component={ProfileScreen} />
//     </Tab.Navigator>
//   );
// }

// function RootStack() {
//   return (
//     <Stack.Navigator
//       screenOptions={{
//         headerShown: false,
//         presentation: 'modal',
//       }}
//     >
//       <Stack.Screen name="MainTabs" component={MainTabs} />
//       <Stack.Screen name="AddTransaction" component={AddTransactionModal} />
//       <Stack.Screen name="CsvUpload" component={CsvUploadScreen} />
//       <Stack.Screen name="SmsMock" component={SmsMockScreen} />
//       <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
//       <Stack.Screen name="Settings" component={SettingsScreen} />
//     </Stack.Navigator>
//   );
// }

// export default function Navigation() {
//   const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
//   const onboardingCompleted = useAppSelector((state) => state.onboarding.completed);

//   return (
//     <NavigationContainer>
//       {!isAuthenticated ? (
//         <AuthStack />
//       ) : !onboardingCompleted ? (
//         <OnboardingStack />
//       ) : (
//         <RootStack />
//       )}
//     </NavigationContainer>
//   );
// }

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '../app/store';
import { theme } from '../constants/theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Onboarding screens
import OnboardingCarousel from '../screens/onboarding/OnboardingCarousel';
import IncomeScreen from '../screens/onboarding/IncomeScreen';
import SmsOptInScreen from '../screens/onboarding/SmsOptInScreen';
import FinishScreen from '../screens/onboarding/FinishScreen';

// Main screens
import DashboardScreen from '../screens/main/DashboardScreen';
import TransactionsScreen from '../screens/main/TransactionsScreen';
import BudgetScreen from '../screens/main/BudgetScreen';
import AdvisorScreen from '../screens/main/AdvisorScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

// Modal screens
import AddTransactionModal from '../screens/modals/AddTransactionModals';
import CsvUploadScreen from '../screens/modals/CsvUploadScreen';
import SmsMockScreen from '../screens/modals/SmsMockScreen';
import TransactionDetailScreen from '../screens/modals/TransactionDetailsScreen';
import PremiumSelectionScreen from '../screens/onboarding/PremiumSelectionScreen';
import SettingsScreen from '../screens/modals/SettingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function OnboardingStack() {
  const user = useAppSelector((state) => state.auth.user);
  const onboarding = useAppSelector((state) => state.onboarding);

  // Check if user has already set occupation and income
  const hasCompletedIncomeSetup = user?.occupation && user?.monthlyIncome;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
      initialRouteName={hasCompletedIncomeSetup ? 'SmsOptIn' : 'OnboardingCarousel'}
    >
      {!hasCompletedIncomeSetup && (
        <>
          <Stack.Screen name="OnboardingCarousel" component={OnboardingCarousel} />
          <Stack.Screen name="Income" component={IncomeScreen} />
        </>
      )}
      <Stack.Screen name="SmsOptIn" component={SmsOptInScreen} />
      <Stack.Screen name="Finish" component={FinishScreen} />
      <Stack.Screen name="PremiumSelection" component={PremiumSelectionScreen} />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Budget') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Advisor') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Budget" component={BudgetScreen} />
      <Tab.Screen name="Advisor" component={AdvisorScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="AddTransaction" component={AddTransactionModal} />
      <Stack.Screen name="CsvUpload" component={CsvUploadScreen} />
      <Stack.Screen name="SmsMock" component={SmsMockScreen} />
      <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const onboardingCompleted = useAppSelector((state) => state.onboarding.completed);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : !onboardingCompleted ? (
        <OnboardingStack />
      ) : (
        <RootStack />
      )}
    </NavigationContainer>
  );
}