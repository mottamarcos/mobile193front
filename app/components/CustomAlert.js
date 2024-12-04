import React from 'react';
import { View, Text, Modal,  StyleSheet } from 'react-native';
import colors from '../styles/colors';
import Button from './button';

export default function CustomAlert({ visible, title, message, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <Button title="Fechar" onPress={onClose}></Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo semitransparente
  },
  modalBox: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 10, // Sombra para Android
    shadowColor: '#000', // Sombra para iOS
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: colors.darkest,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    color: colors.darkest,
  },
  modalButton: {
    backgroundColor: colors.secondary, // Cor de fundo do botão
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  modalButtonText: {
    color: colors.primaryLight,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
