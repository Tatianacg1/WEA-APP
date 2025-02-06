import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    Image, 
    ScrollView, 
    TouchableOpacity, 
    Alert, 
    TextInput, 
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import styles from '../styles/eventStyles';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { fetchEventDetails } from '../api/eventService';
import { API_TOKEN, BASE_URL } from '../api/config';

const EventDetailsScreen = ({ route, navigation }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [passCode, setPassCode] = useState('');
    const [name, setName] = useState('');

    useEffect(() => {
        const getEventDetails = async () => {
            try {
                const data = await fetchEventDetails(eventId);
                setEvent(data);
            } catch (error) {
                console.error('Error fetching event details:', error);
                Alert.alert('Error', 'Failed to fetch event details');
            }
        };

        getEventDetails();
    }, [eventId]);

    const fetchAndSaveTickets = async () => {
        if (!passCode || !name) {
            Alert.alert('Error', 'Please enter both name and pass code.');
            return;
        }
        
        setIsLoading(true);
        const ticketUrl = `https://new-api.worldeventaccess.com/api/PublicEvents/PassCode`;
        const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;
        const filePathNameInCharge = `${FileSystem.documentDirectory}nameInCharge_${eventId}.json`;
    
        try {
            const response = await axios.post(
                ticketUrl,
                { passCode, eventId, name },
                {
                    headers: {
                        'Authorization': `Bearer ${API_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            if (response.status !== 200 || !response.data || !response.data.eventTickets) {
                throw new Error('Failed to fetch tickets');
            }
    
            const ticketsData = response.data;
            const jsonString = JSON.stringify(ticketsData, null, 2);
    
            // Guardar tickets
            await FileSystem.writeAsStringAsync(filePath, jsonString);
    
            // Guardar nombre localmente
            const nameData = JSON.stringify({ name }, null, 2);
            await FileSystem.writeAsStringAsync(filePathNameInCharge, nameData);
    
            // Verificar que los archivos existen
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            const nameFileInfo = await FileSystem.getInfoAsync(filePathNameInCharge);
    
            if (!fileInfo.exists || fileInfo.size === 0 || !nameFileInfo.exists || nameFileInfo.size === 0) {
                throw new Error('Failed to save data');
            }
    
            Alert.alert("Success", "Tickets downloaded successfully!");
            navigation.navigate('TicketsScreen', { 
                eventId,
                ticketsData,
            });
    
        } catch (error) {
            Alert.alert("Error", `Failed to download tickets: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!event) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Loading event details...</Text>
            </View>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <View style={styles.section}>
                    <Image
                        source={{ uri: `${BASE_URL}/PublicEventLogo/${event.id}` }}
                        style={styles.logo}
                        resizeMode="contain"
                    />
                    <Text style={styles.title}>{event.name}</Text>
                    <Text style={styles.subtitle}>Organizer: {event.organizer}</Text>
                    <Text style={styles.subtitle}>Email: {event.organizerEmail}</Text>
                    <Text style={styles.description}>{event.description}</Text>
                    <Text style={styles.date}>Starts: {formatDate(event.eventStartDate)}</Text>
                    <Text style={styles.date}>Ends: {formatDate(event.eventEndDate)}</Text>
                    <Text style={styles.location}>Location: {event.address}</Text>
                </View>

                <View style={styles.section}>
                    {isLoading && (
                        <ActivityIndicator 
                            size="large" 
                            color="#0000ff" 
                            style={styles.progressIndicator}
                        />
                    )}
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your name"
                        value={name}
                        onChangeText={setName}
                        placeholderTextColor="#888"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Enter pass code"
                        value={passCode}
                        onChangeText={setPassCode}
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity 
                        style={[styles.downloadButton, isLoading && styles.disabledButton]}
                        onPress={fetchAndSaveTickets}
                        disabled={isLoading}
                    >
                        <Text style={styles.downloadButtonText}>
                            {isLoading ? "Loading..." : "Download Tickets"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

export default EventDetailsScreen;
