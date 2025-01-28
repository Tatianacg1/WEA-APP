import axios from 'axios';

export const fetchSignIn = async (email, password) => {
    try {
      const response = await axios.post('https://api.worldeventaccess.com/api/token', {
        userName: email,
        password: password
      });
      return response;
    } catch (error) {
      if (error.response) {
        Alert.alert('Error', 'Incorrect email or password');
      } else {
        Alert.alert('Error', 'Try again later');
      }
    }
  };