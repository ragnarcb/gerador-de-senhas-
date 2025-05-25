import React from 'react';
import { View, Text } from 'react-native';
import styles from './styles';

const StrengthIndicator = ({ strength }) => {
  const getStrengthColor = () => {
    if (strength < 30) return '#FF6B6B';
    if (strength < 60) return '#FFD166';
    if (strength < 80) return '#06D6A0';
    return '#1A936F';
  };

  const getStrengthText = () => {
    if (strength < 30) return 'Fraca';
    if (strength < 60) return 'Média';
    if (strength < 80) return 'Boa';
    return 'Forte';
  };

  if (!strength) return null;

  return (
    <View style={styles.strengthContainer}>
      <View style={styles.strengthBarContainer}>
        <View 
          style={[
            styles.strengthBar, 
            { 
              width: `${strength}%`,
              backgroundColor: getStrengthColor()
            }
          ]} 
        />
      </View>
      <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
        {getStrengthText()} ({strength}%)
      </Text>
    </View>
  );
};

export default StrengthIndicator; 