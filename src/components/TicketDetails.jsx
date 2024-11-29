import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Image, TextInput, ScrollView } from 'react-native';
import * as FileSystem from 'expo-file-system';
import moment from 'moment';
import { BASE_URL, API_TOKEN } from '../api/config'



const TicketDetails = ({ route }) => {
    const { ticket } = route.params;
    const [updatedTicket, setUpdatedTicket] = useState(ticket);
    const [parkingMethod, setParkingMethod] = useState('');
    const [parkingSlot, setParkingSlot] = useState(ticket.parkingSlot);
    const [keySlot, setKeySlot] = useState(ticket.keySlot);

    useEffect(() => {
        setParkingSlot(ticket.parkingSlot || null);
        setKeySlot(ticket.keySlot || null);
        console.log(ticket.checkIn)
    }, [ticket]);

    const defaultImage = 'https://e7.pngegg.com/pngimages/499/151/png-clipart-silhouette-user-silhouette-animals-rectangle.png';
    const userImage = updatedTicket.credentials ? `data:image/png;base64,${updatedTicket.credentials}` : defaultImage;

    const updateTicketFile = useCallback(async (updated) => {
        const eventId = updated.event?.id;

        if (!eventId) {
            Alert.alert('Error', 'No se encontró el ID del evento');
            return;
        }

        const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;

        try {
            const fileContent = await FileSystem.readAsStringAsync(filePath);
            const tickets = JSON.parse(fileContent);

            const updatedTickets = tickets.map(t => t.id === updated.id ? updated : t);
            await FileSystem.writeAsStringAsync(filePath, JSON.stringify(updatedTickets));

            return true;
        } catch (error) {
            console.error('Error al actualizar el archivo de tickets:', error);
            Alert.alert('Error', 'No se pudo actualizar el archivo de tickets');
            return false;
        }
    }, []);

    useEffect(() => {
        let method = 'None';

        if (updatedTicket.parkingMethod === 'free') {
            method = 'Free';
        } else if (updatedTicket.parkingMethod === 'standard') {
            method = 'Standard';
        } else if (updatedTicket.parkingMethod === 'valet') {
            method = 'VIP';
        }

        const checkInTime = updatedTicket.checkIn
            ? `Check-in: ${moment(updatedTicket.checkIn).format('YYYY-MM-DD HH:mm:ss')}`
            : 'No Check-in';

        const checkOutTime = updatedTicket.checkOut
            ? `Check-out: ${moment(updatedTicket.checkOut).format('YYYY-MM-DD HH:mm:ss')}`
            : 'No Check-out';

        setParkingMethod(`${method}\n${checkInTime}\n${checkOutTime}`);
    }, [updatedTicket]);

    const handleSaveParkingDataLocally = async () => {
        const updated = { ...updatedTicket, parkingSlot, keySlot: updatedTicket.parkingMethod === 'valet' ? keySlot : null };
        const success = await updateTicketFile(updated);
        if (success) {
            setUpdatedTicket(updated);
            setParkingSlot(updated.parkingSlot || null);
            setKeySlot(updated.keySlot || null);
        }
    };

    const handleSaveParkingData = async () => {
        console.log('Parking data:', parkingSlot, keySlot);
        console.log('Ticket Id:', ticket.id);
        const payload = {
            id: ticket.id,
            parkingSlot,
            keySlot: updatedTicket.parkingMethod === 'valet' ? keySlot : null,
        };

        try {
            const response = await fetch(`${BASE_URL}/Ticket/Parking`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${API_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                Alert.alert('Éxito', 'Datos de parqueo guardados exitosamente');
                await handleSaveParkingDataLocally();
            } else if (response.status === 400) {
                Alert.alert('Conflicto', `Los datos de parqueo ya existen`);
            } else {
                Alert.alert('Error', `Los datos de parqueo no son válidos`);
            }
        } catch (error) {
            console.error('Error al guardar datos de parqueo:', error);
            Alert.alert('Error', 'No se pudo guardar los datos de parqueo');
        }
    };

    const handleCheckInFromServer = useCallback(async () => {
        if (!updatedTicket.checkIn) {
            try {
                // Generar la fecha de check-in en formato ISO 8601
                const newCheckInDate = moment().format('YYYY-MM-DDTHH:mm:ss');

                // Crear el payload con todos los campos requeridos
                const payload = {
                    id: ticket.id,
                    title: updatedTicket.title || "Default Title",
                    firstName: updatedTicket.firstName || "Default FirstName",
                    lastName: updatedTicket.lastName || "Default LastName",
                    email: updatedTicket.email || "default@example.com",
                    checkIn: newCheckInDate,
                    checkOut: updatedTicket.checkOut,
                };

                console.log('Payload:', JSON.stringify(payload));

                // Hacer la solicitud al servidor
                const response = await fetch(`${BASE_URL}/Ticket`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    // Actualizar ticket con el nuevo valor de checkIn
                    const updated = { ...updatedTicket, checkIn: newCheckInDate };

                    // Guardar en archivo local
                    const success = await updateTicketFile(updated);

                    if (success) {
                        // Actualizar el estado local
                        setUpdatedTicket(updated);
                        Alert.alert('Check-in exitoso', `Check-in realizado el ${newCheckInDate}`);
                    } else {
                        console.error('Error al guardar el ticket localmente.');
                        Alert.alert('Error', 'Check-in exitoso pero no se pudo guardar localmente.');
                    }
                } else {
                    // Manejar errores de servidor
                    const errorText = await response.text();
                    console.error('Error en el servidor:', errorText);
                    Alert.alert('Error', 'No se pudo realizar el check-in en el servidor');
                }
            } catch (error) {
                console.error('Error al realizar check-in en el servidor:', error);
                Alert.alert('Error', 'No se pudo realizar el check-in en el servidor');
            }
        } else {
            Alert.alert('Check-in ya realizado', `Check-in ya fue realizado el ${updatedTicket.checkIn}`);
        }
    }, [updatedTicket, updateTicketFile]);

    const handleCheckOut = useCallback(async () => {
        if (updatedTicket.parkingMethod === 'None' || updatedTicket.parkingMethod === '' || updatedTicket.parkingMethod === null || updatedTicket.parkingMethod === 'free') {
            Alert.alert('Operación no permitida', 'El check-out no está habilitado para este método de parqueo.');
            return;
        }

        if (updatedTicket.parkingMethod === 'valet') {
            if (!updatedTicket.parkingSlot || !updatedTicket.keySlot) {
                Alert.alert('Campos requeridos', 'Debes llenar el número de parqueo y llaves antes de realizar el check-out.');
                return;
            }
        }

        if (updatedTicket.parkingMethod === 'standard') {
            if (!updatedTicket.parkingSlot) {
                Alert.alert('Campos requeridos', 'Debes llenar el número de parqueo antes de realizar el check-out.');
                return;
            }
        }

        if (updatedTicket.checkIn && !updatedTicket.checkOut) {
            try {
                const newCheckOutDate = moment().format('YYYY-MM-DDTHH:mm:ss');
                const payload = {
                    id: updatedTicket.id,
                    title: updatedTicket.title || "Default Title",
                    firstName: updatedTicket.firstName || "Default FirstName",
                    lastName: updatedTicket.lastName || "Default LastName",
                    email: updatedTicket.email || "default@example.com",
                    checkIn: updatedTicket.checkIn,
                    checkOut: newCheckOutDate,
                };

                console.log('Payload:', JSON.stringify(payload));

                const response = await fetch(`${BASE_URL}/Ticket`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                if (response.ok) {
                    const updated = { ...updatedTicket, checkOut: newCheckOutDate };
                    const success = await updateTicketFile(updated);

                    if (success) {
                        setUpdatedTicket(updated);
                        Alert.alert('Check-out exitoso', `Check-out realizado el ${newCheckOutDate}`);
                    } else {
                        console.error('Error al guardar el ticket localmente.');
                        Alert.alert('Error', 'Check-out exitoso pero no se pudo guardar localmente.');
                    }
                } else {
                    const errorText = await response.text();
                    console.error('Error en el servidor:', errorText);
                    Alert.alert('Error', 'No se pudo realizar el check-out en el servidor');
                }
            } catch (error) {
                console.error('Error en check-out:', error);
                Alert.alert('Error', 'No se pudo realizar el check-out');
            }
        } else if (!updatedTicket.checkIn) {
            Alert.alert('Check-in requerido', 'Realiza el check-in antes de hacer check-out');
        } else {
            Alert.alert('Check-out ya realizado', `Check-out ya fue realizado el ${updatedTicket.checkOut}`);
        }
    }, [updatedTicket, updateTicketFile]);

    const handleFieldChange = (field, value) => {
        setUpdatedTicket(prevTicket => ({
            ...prevTicket,
            [field]: value,
        }));
    };

    return (
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.contentContainer}>
            <Image
                source={{ uri: userImage }}
                style={styles.profileImage}
                resizeMode="cover"
            />
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Event: {updatedTicket.title || 'N/A'}</Text>
                <Text style={styles.infoText}>Name: {updatedTicket.firstName || 'N/A'}</Text>
                <Text style={styles.infoText}>Last Name: {updatedTicket.lastName || 'N/A'}</Text>
                <Text style={styles.infoText}>Email: {updatedTicket.email || 'N/A'}</Text>
                <Text style={styles.infoText}>Rooms: {updatedTicket.rooms || 'N/A'}</Text>
                <Text style={styles.infoText}>Dates: {updatedTicket.dates || 'N/A'}</Text>
                <Text style={styles.infoText}>Pay with: {updatedTicket.paymentType || 'N/A'}</Text>
                <Text style={styles.infoText}>Table seat: {1}</Text>
                <Text style={styles.infoText}>Parking: {parkingMethod}</Text>
                {ticket.checkIn && updatedTicket.parkingMethod !== 'None' && updatedTicket.parkingMethod !== '' && (
                    <View>
                        <Text style={styles.infoText}>Datos de Parqueo:</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Celda de parqueo"
                            value={parkingSlot}
                            onChangeText={setParkingSlot}
                            readOnly={updatedTicket.checkOut}
                        />
                        {updatedTicket.parkingMethod === 'valet' && (
                            <TextInput
                                style={styles.input}
                                placeholder="Ubicación de la llave"
                                value={keySlot}
                                onChangeText={setKeySlot}
                                readOnly={updatedTicket.checkOut}
                            />
                        )}
                        {!updatedTicket.checkOut && (
                        <TouchableOpacity style={styles.button} onPress={handleSaveParkingData}>
                            <Text style={styles.buttonText}>Guardar Datos de Parqueo</Text>
                        </TouchableOpacity>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.button, updatedTicket.checkIn && styles.disabledButton]}
                    onPress={handleCheckInFromServer}
                    disabled={!!updatedTicket.checkIn}
                >
                    <Text style={styles.buttonText}>Check-In</Text>
                </TouchableOpacity>

                {updatedTicket.checkIn && (updatedTicket.parkingMethod === 'standard' || updatedTicket.parkingMethod === 'valet') && (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            (!updatedTicket.checkIn || updatedTicket.checkOut) && styles.disabledButton
                        ]}
                        onPress={handleCheckOut}
                        disabled={!updatedTicket.checkIn || !!updatedTicket.checkOut}
                    >

                        <Text style={styles.buttonText}>Check-Out</Text>
                    </TouchableOpacity>
                )}

            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flex: 1,
        backgroundColor: '#d4fafd8f',
    },
    contentContainer: {
        padding: 10,
    },
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#d4fafd8f',
    },
    infoContainer: {
        flex: 1,
        width: '100%',
        borderRadius: 15,
        borderWidth: 5,
        borderColor: '#ccc',
        backgroundColor: '#fff',
        paddingLeft: 10,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        borderWidth: 2,
        borderColor: '#007BFF',
    },
    infoText: {
        fontSize: 16,
        marginVertical: 8,
        color: '#333',
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#007BFF',
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 8,
        marginVertical: 10,
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    vipFieldsContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 10,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },

});

export default TicketDetails;