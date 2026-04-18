import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * BackToHomeButton
 * 
 * Usage:
 *   import BackToHomeButton from '../../components/BackToHomeButton';
 *   <BackToHomeButton />                        // goes back one screen
 *   <BackToHomeButton goHome />                 // goes all the way to Home
 *   <BackToHomeButton label="‹ Back to Users" /> // custom label
 *   <BackToHomeButton adminHome />              // goes to AdminDashboard
 */
export default function BackToHomeButton({ goHome, adminHome, label }) {
  const navigation = useNavigation();

  const handlePress = () => {
    if (adminHome) {
      navigation.navigate('AdminDashboard');
    } else if (goHome) {
      navigation.navigate('Home');
    } else {
      navigation.goBack();
    }
  };

  const displayLabel = label || (goHome || adminHome ? '🏠  Home' : '‹  Back');
  const isHome = goHome || adminHome;

  return (
    <TouchableOpacity
      style={[styles.btn, isHome && styles.btnHome]}
      onPress={handlePress}
    >
      <Text style={[styles.text, isHome && styles.textHome]}>
        {displayLabel}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignSelf: 'flex-start',
  },
  btnHome: {
    backgroundColor: '#10B98120',
    borderColor: '#10B98140',
  },
  text: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  textHome: {
    color: '#10B981',
  },
});
