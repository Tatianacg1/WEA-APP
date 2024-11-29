import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, TextInput, Button } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { fetchEventsDetails } from '../api/eventsService';
import styles from '../styles/eventsStyles';
import { Ionicons } from '@expo/vector-icons';

// Definición del componente EventsScreen, recibe route y navigation como props para la navegación
const EventsScreen = ({ navigation }) => {
    // Declaración de estados para los eventos, el término de búsqueda y la visibilidad del selector de fecha
    const [events, setEvents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

    console.log("Entrando a EventsScreen")

    // Hook useEffect para obtener los detalles de eventos al cargar el componente
    useEffect(() => {
        const getEventsDetails = async () => {
            try {
                console.log("Entrando a useEffect")
                const data = await fetchEventsDetails(); 
                console.log(data) // Llama a la API para obtener datos
                setEvents(data);  // Almacena los datos en el estado
            } catch (error) {
                console.error('Error fetching event details:', error);  // Muestra error en la consola si falla la llamada
            }
        };
        getEventsDetails();  // Ejecuta la función al cargar el componente
    }, []);

    // Función para formatear la fecha a una cadena legible
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // Función para verificar si una fecha coincide con el término de búsqueda
    const isDateMatch = (eventDate, term) => {
        const formattedDate = formatDate(eventDate).toLowerCase();
        return formattedDate.includes(term.toLowerCase());
    };

    // Filtra los eventos en función del término de búsqueda en nombre o fechas de inicio/fin
    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        isDateMatch(event.eventStartDate, searchTerm) ||
        isDateMatch(event.eventEndDate, searchTerm)
    );

    // Funciones para manejar el selector de fecha
    const showDatePicker = () => {
        setDatePickerVisibility(true);  // Muestra el selector de fecha
    };

    const hideDatePicker = () => {
        setDatePickerVisibility(false);  // Oculta el selector de fecha
    };

    const handleConfirm = (date) => {
        setSearchTerm(formatDate(date));  // Establece el término de búsqueda a la fecha seleccionada
        hideDatePicker();  // Oculta el selector de fecha después de seleccionar
    };

    return (
        <View style={styles.container}>
            {/* Barra de búsqueda */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search events by name or date..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
                {/* Botón para abrir el selector de fecha */}
                <TouchableOpacity onPress={showDatePicker}>
                    <Ionicons name="calendar-outline" size={24} color="gray" style={styles.calendarIcon} />
                </TouchableOpacity>
            </View>

            {/* Modal del selector de fecha */}
            <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
            />

            <Button
                title="Tickets Descargados"
                onPress={() => navigation.navigate('DownloadedTicketsScreen')}
            />

            {/* Lista de eventos filtrados */}
            <ScrollView>
                {filteredEvents.map(event => (
                    <View key={event.id} style={styles.card}>
                        <View style={styles.cardCont}>
                            {/* Navega a los detalles del evento al presionar */}
                            <TouchableOpacity onPress={() => navigation.navigate('EventDetailsScreen', { eventId: event.id })}>
                                <Image
                                    source={{ uri: `https://new-api.worldeventaccess.com/api/PublicEventLogo/${event.id}` }}
                                    style={styles.logo}
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
                            <Text style={styles.date}>Starts:  {formatDate(event.eventStartDate)}</Text>
                            <Text style={styles.date}>Ends:    {formatDate(event.eventEndDate)}</Text>
                            <Text style={styles.location}>Location: {event.address}</Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Pie de página */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>© 2024 Events Management System</Text>
            </View>
        </View>
    );
};

export default EventsScreen;