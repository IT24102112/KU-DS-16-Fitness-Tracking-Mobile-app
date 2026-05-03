import React from 'react';
import { View, Text, Image } from 'react-native';
import { useTheme } from '../../../services/ThemeContext';
import { API_BASE_URL } from '../../../services/api';

export default function ImagesTab({ data }) {
  const { theme } = useTheme();
  const getUrl = (path) => API_BASE_URL.replace('/api', '') + '/' + path;
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color: theme.textPrimary, fontSize: 18, fontWeight: '800', marginBottom: 12 }}>Images</Text>
      {data.beforeImage?.imageUrl ? (
        <>
          <Text style={{ color: theme.textSecondary }}>Before:</Text>
          <Image source={{ uri: getUrl(data.beforeImage.imageUrl) }} style={{ width: 150, height: 150, borderRadius: 8, marginBottom: 10 }} resizeMode="cover" />
        </>
      ) : null}
      {data.afterImage?.imageUrl && (
        <>
          <Text style={{ color: theme.textSecondary }}>After:</Text>
          <Image source={{ uri: getUrl(data.afterImage.imageUrl) }} style={{ width: 150, height: 150, borderRadius: 8 }} resizeMode="cover" />
        </>
      )}
    </View>
  );
}