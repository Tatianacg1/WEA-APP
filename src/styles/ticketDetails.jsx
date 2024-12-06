import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  card: {
    maxWidth: 500,
    marginVertical: 20, // Equivalente a 2rem (rem se convierte a px para móviles)
    marginHorizontal: 'auto', // No es exacto, pero React Native no soporta "auto" en márgenes, se usa porcentaje para centrar
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Solo en Android para sombras
  },
  
  cardHeader: {
    backgroundColor: '#007bff',
    color: '#fff',
    padding: 16,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center', // Centra el texto
  },
  
  cardTitle: {
    fontSize: 24, // 1.5rem en px
    margin: 0,
    color: '#fff', // Asegura que el texto sea blanco
  },
  
  cardContent: {
    padding: 24, // Equivalente a 1.5rem
  },
  
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16, // 1rem en px
  },
  
  userImage: {
    backgroundColor: '#525252',
    borderRadius: 50,
    marginRight: 16,
    height: 100,
    width: 100,
    borderWidth: 2,
    borderColor: '#28a745',
  },

  checkInOutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24, // 1.5rem
  },

  checkIn: {
    backgroundColor: '#28a745',
    borderColor: '#343a40',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    marginRight: 8,
    fontWeight: 'bold',
    color: '#1b1d1f',
  },

  checkOut: {
    backgroundColor: '#df2e2e',
    borderColor: '#343a40',
    borderWidth: 1,
    borderRadius: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 8,
    marginRight: 8,
    fontWeight: 'bold',
    color: '#1b1d1f',
  },

  greenText: {
    color: '#28a745',
  },

  redText: {
    color: '#dc3545',
  },

  detailText: {
    color: '#6c757d',
  },

  detailTextParking: {
    color: '#6c757d',
    fontSize: 14, // 0.8rem
  },

  detailParkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, // 0.6rem
  },

  userName: {
    fontSize: 20, // 1.2rem
    fontWeight: 'bold',
    marginBottom: 8, // 0.5rem
  },

  userEmail: {
    color: '#6c757d',
    marginBottom: 8, // 0.5rem
  },

  ticketDetails: {
    marginTop: 16, // 1rem
  },

  detailItem: {
    marginBottom: 8, // 0.5rem
    fontWeight: 'bold',
    color: '#343a40',
  },

  detailItemParking: {
    marginBottom: 5, // 0.3rem
    fontWeight: 'bold',
    fontSize: 15, // 0.9rem
    color: '#343a40',
  },

  comboDescription: {
    fontSize: 14, // 0.9rem
    color: '#6c757d',
    marginBottom: 16, // 1rem
  },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    fontSize: 14, // 0.85rem
    fontWeight: '600',
    marginBottom: 16, // 1rem
  },

  active: {
    backgroundColor: '#28a745',
    color: '#fff',
  },

  inactive: {
    backgroundColor: '#dc3545',
    color: '#fff',
  },

  loading: {
    textAlign: 'center',
    marginTop: 32, // 2rem
    color: '#007bff',
  },

  error: {
    textAlign: 'center',
    marginTop: 32, // 2rem
    color: '#dc3545',
  },
});
