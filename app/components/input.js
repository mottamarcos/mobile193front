import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import colors from '../styles/colors';

const Input = ({ value, onChangeText, placeholder, style, keyboardType, autoCapitalize, secureTextEntry, editable}) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      style={[styles.input, style]}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      secureTextEntry={secureTextEntry}
      editable={editable}
    />
  );
};

const styles = StyleSheet.create({
  input: {
    height: 40,
    backgroundColor:"#fff",
    borderColor: colors.primaryLight,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginVertical: 8,
    elevation:10,
  },
});

export default Input;