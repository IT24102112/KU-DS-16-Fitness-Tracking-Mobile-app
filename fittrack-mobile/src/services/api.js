import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE_URL = 'http://192.168.1.3:5000/api';

const apiRequest = async (endpoint, method = 'GET', body = null) => {
  try {
    console.log('=== API REQUEST ===');
    console.log('Endpoint:', endpoint);
    console.log('Method:', method);
    console.log('Body:', JSON.stringify(body));

    const token = await AsyncStorage.getItem('userToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

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
    console.log('Error stack:', error.stack);
    throw error;
  }
};

export default apiRequest;