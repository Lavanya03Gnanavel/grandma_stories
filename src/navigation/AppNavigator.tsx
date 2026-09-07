import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import HomeScreen from '../screens/HomeScreen';
import AddStoryScreen from '../screens/AddStoryScreen';
import StoryReaderScreen from '../screens/StoryReaderScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from '../types';
import { colors } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { t } = useTranslation();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddStory"
          component={AddStoryScreen}
          options={{ title: t('addStory.title') }}
        />
        <Stack.Screen
          name="StoryReader"
          component={StoryReaderScreen}
          options={{ title: t('reader.narratedBy') }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: t('settings.title') }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
