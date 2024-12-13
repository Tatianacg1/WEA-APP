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
    console.log('=== Información de Depuración ===');
    console.log('Solicitando permisos de la cámara...');
    
    const getCameraPermissions = async () => {
      try {
        const { status } = await Camera.requestCameraPermissionsAsync();
        console.log('Estado de permisos:', status);
        setHasPermission(status === 'granted');
      } catch (error) {
        console.error('Error al solicitar permisos:', error);
        Alert.alert('Error', 'No se pudieron obtener los permisos de la cámara');
      }
    };

    getCameraPermissions();
  }, []);

  const handleBarcodeScanned = ({ type, data }) => {
    console.log('Código escaneado - Tipo:', type, 'Data:', data);
    if (scanned) {
      console.log('Escaneo ignorado - ya se escaneó previamente');
      return;
    }
    
    setScanned(true);
    try {
      const ticketId = data.split('/').pop();
      console.log('Ticket ID extraído:', ticketId);
      findTicketById(ticketId);
    } catch (error) {
      console.error('Error procesando código QR:', error);
      Alert.alert('Error', 'El código QR no tiene el formato esperado');
      setScanned(false);
    }
  };

  const findTicketById = async (scannedTicketId) => {
    console.log('=== Iniciando búsqueda de ticket ===');
    try {
      const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
      console.log('Buscando archivo en:', filePath);
  
      const fileExists = await FileSystem.getInfoAsync(filePath);
      console.log('¿Archivo existe?:', fileExists.exists);
  
      if (!fileExists.exists) {
        throw new Error('Archivo de tickets no encontrado');
      }
  
      let jsonTickets;
      try {
        const fileContent = await FileSystem.readAsStringAsync(filePath);
        console.log('Contenido del archivo:', fileContent.substring(0, 2000) + '...');
        jsonTickets = JSON.parse(fileContent);
      } catch (parseError) {
        console.error('Error al parsear JSON:', parseError);
        throw new Error('El archivo de tickets está dañado');
      }
  
      // Extraer eventTickets
      const tickets = jsonTickets.eventTickets || [];
      console.log('Número de tickets encontrados:', tickets.length);
  
      const normalizedScannedId = scannedTicketId.replace(/-/g, '');
      const ticket = tickets.find(t => t.id.replace(/-/g, '') === normalizedScannedId);
      
      console.log('Resultado de búsqueda:', ticket ? 'Ticket encontrado' : 'Ticket no encontrado');
      console.log("TablesAndChairs in QRCodeScanner: ", tablesAndChairs);
  
      if (ticket) {
        console.log('CheckIn Date:', ticket.checkIn);
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
            console.log('Reiniciando escaneo...');
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