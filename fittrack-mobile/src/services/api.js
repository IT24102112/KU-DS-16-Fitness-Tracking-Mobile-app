import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://10.28.174.68:5000/api';

const apiRequest = async (endpoint, method = 'GET', body = null, isFormData = false) => {
  try {
    console.log('=== API REQUEST ===');
    console.log('Endpoint:', endpoint);
    console.log('Method:', method);
    console.log('Body:', JSON.stringify(body));

    const token = await AsyncStorage.getItem('userToken');
    const headers = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) {
      config.body = isFormData ? body : JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    console.log('Response status:', response.status);

    const data = await response.json();
    console.log('Response data:', JSON.stringify(data));

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }
    return data;
  } catch (error) {
    console.log('=== API ERROR ===');
    console.log('Error message:', error.message);
    throw error;
  }
};

export default apiRequest;