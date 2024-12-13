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
    StyleSheet,
    Platform
} from 'react-native';
import styles from '../styles/eventStyles';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { fetchEventDetails } from '../api/eventService';
import { API_TOKEN, BASE_URL } from '../api/config';

const EventDetailsScreen = ({ route, navigation }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passCode, setPassCode] = useState('');

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
        if (isLoading || !passCode) {
            Alert.alert('Error', 'Please enter a pass code.');
            return;
        }
        
        setIsLoading(true);
        const ticketUrl = `https://new-api.worldeventaccess.com/api/PublicEvents/PassCode`;
        const filePath = `${FileSystem.documentDirectory}tickets_${eventId}.json`;

        try {
            const response = await axios.post(
                ticketUrl,
                { passCode, eventId },
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
            await FileSystem.writeAsStringAsync(filePath, jsonString);

            const fileInfo = await FileSystem.getInfoAsync(filePath);
            if (!fileInfo.exists || fileInfo.size === 0) {
                throw new Error('Failed to save tickets data');
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
                    <Text style={styles.sectionTitle}>Event Information</Text>
                    <Text style={styles.info}>Visitors Price: ${event.visitorsPrice || 'N/A'}</Text>
                    <Text style={styles.info}>Exhibitor Price: ${event.exhibitorPrice || 'N/A'}</Text>
                    <Text style={styles.info}>Capacity: {event.capacity || 'N/A'} people</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Parking Services</Text>
                    <Text style={styles.info}>
                        Free Parking: {event.hasFreeParking ? 'Available' : 'Not Available'}
                    </Text>
                    <Text style={styles.info}>
                        Standard Parking: {event.hasStandardParking ? `$${event.standardParkingPrice}` : 'Not Available'}
                    </Text>
                    <Text style={styles.info}>
                        VIP Parking: {event.hasVIPParking ? `$${event.vipParkingPrice}` : 'Not Available'}
                    </Text>
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
                        placeholder="Enter pass code"
                        value={passCode}
                        onChangeText={setPassCode}
                        placeholderTextColor="#888"
                    />
                    <TouchableOpacity 
                        style={[
                            styles.downloadButton, 
                            isLoading && styles.disabledButton
                        ]}
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