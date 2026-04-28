import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

import WelcomeScreen from '../screens/WelcomeScreen';
import CaptureScreen from '../screens/CaptureScreen';
import GoalScreen from '../screens/GoalScreen';
import StyleScreen from '../screens/StyleScreen';
import AnalyzingScreen from '../screens/AnalyzingScreen';
import ResultsScreen from '../screens/ResultsScreen';
import RescanScreen from '../screens/RescanScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Capture" component={CaptureScreen} />
        <Stack.Screen name="Goal" component={GoalScreen} />
        <Stack.Screen name="Style" component={StyleScreen} />
        <Stack.Screen
          name="Analyzing"
          component={AnalyzingScreen}
          options={{ animation: 'fade', gestureEnabled: false }}
        />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Rescan" component={RescanScreen} />
        <Stack.Screen
          name="Paywall"
          component={PaywallScreen}
          options={{ animation: 'slide_from_bottom', presentation: 'modal' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
