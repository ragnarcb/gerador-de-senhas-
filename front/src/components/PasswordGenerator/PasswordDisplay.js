import React from 'react';
import { View, Text, Platform, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles';
import { FontAwesome5 } from '@expo/vector-icons';

const PasswordDisplay = ({ password, setPassword, isVisible, setIsVisible }) => (
  <View style={[styles.passwordContainer, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }]}>
    <TouchableOpacity onPress={() => setIsVisible(!isVisible)} style={{ marginRight: 10 }}>
      <FontAwesome5 name={isVisible ? 'eye' : 'eye-slash'} size={22} color="#4A86E8" />
    </TouchableOpacity>
    <TextInput
      style={[styles.passwordText, { flex: 1, textAlign: 'center' }]}
      value={password}
      onChangeText={setPassword}
      secureTextEntry={!isVisible}
      editable={true}
      selectTextOnFocus={true}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

export default PasswordDisplay; 