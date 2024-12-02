import React, { useEffect, useState } from 'react';
import { 
    View, 
    Text, 
    Image, 
    ScrollView, 
    TouchableOpacity, 
    TextInput, 
    StyleSheet, 
    Alert 
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import styles from '../styles/eventsStyles';
import { Ionicons } from '@expo/vector-icons';
import { fetchEventsDetails } from '../api/eventsService';

const EventsScreen = ({ navigation }) => {
    // State declarations
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Fetch events on component mount
    useEffect(() => {
        const getEventsDetails = async () => {
            try {
                const data = await fetchEventsDetails(); 
                
                if (data && data.length > 0) {
                    setEvents(data);
                } else {
                    Alert.alert(
                        'No Events',
                        'No events are currently available.',
                        [{ text: 'OK' }]
                    );
                }
            } catch (error) {
                console.error('Error fetching event details:', error);
                Alert.alert(
                    'Error',
                    'Could not load events. Please try again.',
                    [{ text: 'OK' }]
                );
            }
        };
        getEventsDetails();
    }, []);

    // Date formatting function
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Date matching function
    const isDateMatch = (eventDate, term) => {
        const formattedDate = formatDate(eventDate).toLowerCase();
        return formattedDate.includes(term.toLowerCase());
    };

    // Filter events based on search term
    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        isDateMatch(event.eventStartDate, searchTerm) ||
        isDateMatch(event.eventEndDate, searchTerm)
    );

    // Date picker change handler
    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(false);
        setDate(currentDate);
        setSearchTerm(formatDate(currentDate));
    };

    return (
        <View style={styles.container}>
            {/* Search Container */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search events by name or date..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {/* Date Picker Trigger */}
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Ionicons name="calendar-outline" size={24} color="gray" style={styles.calendarIcon} />
                </TouchableOpacity>
            </View>

            {/* Native Date Picker */}
            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={date}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={onDateChange}
                />
            )}

            {/* Downloaded Tickets Button */}
            <TouchableOpacity 
                style={styles.ticketButton}
                onPress={() => navigation.navigate('DownloadedTicketsScreen')}
            >
                <Text style={styles.ticketButtonText}>Tickets Descargados</Text>
            </TouchableOpacity>

            {/* Events List */}
            <ScrollView>
                {filteredEvents.map(event => (
                    <View key={event.id} style={styles.card}>
                        <View style={styles.cardCont}>
                            {/* Event Details Navigation */}
                            <TouchableOpacity onPress={() => navigation.navigate('EventDetailsScreen', { eventId: event.id })}>
                                <Image
                                    source={{ 
                                        uri: `https://new-api.worldeventaccess.com/api/PublicEventLogo/${event.id}` 
                                    }}
                                    style={styles.logo}
                                    defaultSource={require('../../assets/WEA.png')} 
                                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('EventDetailsScreen', { eventId: event.id })}>
                                <View style={styles.textContainer}>
                                    <Text style={styles.title}>{event.name}</Text>
                                    <Text style={styles.subtitle}>{event.organizer}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.description}>{event.description}</Text>
                            <Text style={styles.date}>Starts: {formatDate(event.eventStartDate)}</Text>
                            <Text style={styles.date}>Ends: {formatDate(event.eventEndDate)}</Text>
                            <Text style={styles.location}>Location: {event.address}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2024 Events Management System</Text>
            </View>
        </View>
    );
};

export default EventsScreen;