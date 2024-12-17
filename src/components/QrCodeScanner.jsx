import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useNavigation } from '@react-navigation/native';
import { CameraView, Camera } from 'expo-camera';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const QrCodeScanner = ({ route }) => {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const navigation = useNavigation();
  const { eventId, tablesAndChairs } = route.params || {};

  useEffect(() => {
 
    const getCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
       
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error al solicitar permisos:', error);
        Alert.alert('Error', 'No se pudieron obtener los permisos de la cámara');
      }
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ data }) => {
    setScanned(true);
    try {
      const ticketId = data.split('/').pop();
      findTicketById(ticketId);
    } catch (error) {
      console.error('Error procesando código QR:', error);
      Alert.alert('Error', 'El código QR no tiene el formato esperado');
      setScanned(false);
    }
  };

  const findTicketById = async (scannedTicketId) => {
    try {
      const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
  
      const fileExists = await FileSystem.getInfoAsync(filePath);
  
      if (!fileExists.exists) {
        throw new Error('Archivo de tickets no encontrado');
      }
  
      let jsonTickets;
      try {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
  
        jsonTickets = JSON.parse(fileContent);
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        throw new Error('El archivo de tickets está dañado');
      }
  
      // Extraer eventTickets
      const tickets = jsonTickets.eventTickets || [];
  
      const normalizedScannedId = scannedTicketId.replace(/-/g, '');
      const ticket = tickets.find(t => t.id.replace(/-/g, '') === normalizedScannedId);
      
  
      if (ticket) {
        navigation.navigate('TicketDetails', { 
          ticket: { ...ticket, event: { id: eventId } }, tablesAndChairs
        });
      } else {
        Alert.alert('Ticket no encontrado', `No se encontró un ticket con el ID: ${scannedTicketId}`);
        setScanned(false);
      }
    } catch (error) {
      console.error('Error en findTicketById:', error);
      Alert.alert('Error', 'Error al procesar el ticket: ' + error.message);
      setScanned(false);
    }
  };

  if (hasPermission === null) {
    return <Text style={styles.text}>Solicitando permiso para usar la cámara...</Text>;
  }

  if (hasPermission === false) {
    return <Text style={styles.text}>No hay acceso a la cámara. Por favor, habilita los permisos.</Text>;
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {scanned && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setScanned(false);
          }}
        >
          <Text style={styles.buttonText}>Escanear de nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );

};	


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    margin: 20,
    color: 'white',
  },
  button: {
    position: 'absolute',
    bottom: 50,
    left: SCREEN_WIDTH / 2 - 75,
    backgroundColor: '#007AFF',
    borderRadius: 25,
    padding: 15,
    width: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QrCodeScanner;