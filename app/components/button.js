import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors'; 

const Button = ({ title, onPress, style , children}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.2}>
      {children || <Text style={styles.text}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 10,
    justifyContent:"center",
  },
  text: {
    color: colors.primaryLight,
    fontWeight:"bold",
    fontSize: 20,
    textAlign: 'center',
  },
});

export default Button;