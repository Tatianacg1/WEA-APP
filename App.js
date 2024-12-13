import React, { useEffect, useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Importación de pantallas
import EventsScreen from './src/components/EventsScreen';
import EventDetailsScreen from './src/components/EventDetailsScreen';
import TicketsScreen from './src/components/TicketsScreen';
import DownloadedTicketsScreen from './src/components/DownloadedTicketsScreen';
import QrCodeScanner from './src/components/QrCodeScanner';
import TicketDetails from './src/components/TicketDetails';
import AssignSeatScreen from './src/components/AssignSeatScreen';

// Prevenir que la pantalla de splash desaparezca automáticamente
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
  // Cargar fuentes personalizadas
  const [fontsLoaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Ocultar la pantalla de splash cuando las fuentes están cargadas
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Renderizar una pantalla vacía mientras se cargan las fuentes
  if (!fontsLoaded) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="EventsScreen">
        <Stack.Screen name="EventsScreen" component={EventsScreen} options={{ title: 'Events' }} />
        <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
        <Stack.Screen name="TicketsScreen" component={TicketsScreen} options={{ title: 'Tickets' }} />
        <Stack.Screen name="DownloadedTicketsScreen" component={DownloadedTicketsScreen} options={{ title: 'Downloaded Tickets' }} />
        <Stack.Screen name="QrCodeScanner" component={QrCodeScanner} options={{ title: 'Scan QR Code' }} />
        <Stack.Screen name="TicketDetails" component={TicketDetails} options={{ title: 'Ticket Details' }} />
        <Stack.Screen name="AssignSeatScreen" component={AssignSeatScreen} options={{ title: 'Assign Seat' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}