import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated, Platform, StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { LinearGradient } from 'expo-linear-gradient';

// Importación de pantallas
import EventsScreen from './src/components/EventsScreen';
import EventDetailsScreen from './src/components/EventDetailsScreen';
import TicketsScreen from './src/components/TicketsScreen';
import DownloadedTicketsScreen from './src/components/DownloadedTicketsScreen';
import QrCodeScanner from './src/components/QrCodeScanner';
import TicketDetails from './src/components/TicketDetails';
import AssignSeatScreen from './src/components/AssignSeatScreen';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Calcular la altura del header para diferentes plataformas
const HEADER_HEIGHT = Platform.OS === 'ios' ? 90 : 60;
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 40 : StatusBar.currentHeight;

export default function App() {
  // Animación para el gradiente
  const gradientPosition = new Animated.Value(0);
  
  // Configurar la animación del gradiente
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(gradientPosition, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: false,
        }),
        Animated.timing(gradientPosition, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const [fontsLoaded] = useFonts({
    SpaceMono: require('./assets/fonts/SpaceMono-Regular.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Fondo base */}
      <LinearGradient
        colors={['#002b36', '#073642', '#0d5057']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Gradiente animado */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            opacity: 0.8,
            transform: [{
              translateX: gradientPosition.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200]
              })
            }]
          }
        ]}
      >
        <LinearGradient
          colors={['rgba(0, 255, 136, 0.65)', 'rgba(0, 149, 255, 0.65)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <NavigationContainer>
        <Stack.Navigator 
          initialRouteName="EventsScreen"
          screenOptions={{
            headerStyle: {
              backgroundColor: 'transparent',
              height: HEADER_HEIGHT,
            },
            headerTransparent: true,
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
            contentStyle: {
              backgroundColor: 'transparent',
              paddingTop: HEADER_HEIGHT + STATUS_BAR_HEIGHT, // Agregar padding para el contenido
            }
          }}
        >
          <Stack.Screen 
            name="EventsScreen" 
            component={EventsScreen} 
            options={{ 
              title: 'Events',
            }} 
          />
          <Stack.Screen name="EventDetailsScreen" component={EventDetailsScreen} options={{ title: 'Event Details' }} />
          <Stack.Screen name="TicketsScreen" component={TicketsScreen} options={{ title: 'Tickets' }} />
          <Stack.Screen name="DownloadedTicketsScreen" component={DownloadedTicketsScreen} options={{ title: 'Downloaded Tickets' }} />
          <Stack.Screen name="QrCodeScanner" component={QrCodeScanner} options={{ title: 'Scan QR Code' }} />
          <Stack.Screen name="TicketDetails" component={TicketDetails} options={{ title: 'Ticket Details' }} />
          <Stack.Screen name="AssignSeatScreen" component={AssignSeatScreen} options={{ title: 'Assign Seat' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});