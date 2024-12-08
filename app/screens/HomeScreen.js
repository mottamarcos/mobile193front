import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Modal, ScrollView, TouchableOpacity } from 'react-native';
import colors from "../styles/colors"; 
import { Ionicons } from '@expo/vector-icons';
import Button from '../components/button';
import { useUser } from '../contexts/contextUser';
import * as Location from "expo-location";
import api from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const checkLocationPermission = async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        let { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        if (newStatus !== "granted") {
          Alert.alert(
            "Permissão Necessária",
            "O app precisa de acesso à localização para emergências."
          );
        }
      }
    };
    checkLocationPermission();

    const loadNotifications = async () => {
      try {
        const response = await api.get(`notify/getNotifications/${user.user_id}`);
        setNotifications(response.data);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    };

    loadNotifications();
  }, []);

  const markNotificationAsRead = async (id) => {
    try {
      const response = await api.put(`notify/read/${id}`);
    } catch (error) {
      if (error.response) {
        // Erro de resposta do servidor (status diferente de 2xx)
        console.error('Erro de resposta:', error.response);
      } else if (error.request) {
        // Erro na requisição (não recebeu resposta do servidor)
        console.error('Erro de requisição:', error.request);
      } else {
        // Outros erros (erro no código)
        console.error('Erro inesperado:', error.message);
      }
    }
  
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.notificacao_id === id
          ? { ...notification, lida: true }
          : notification
      )
    );
  };
  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao 193 MOBILE!</Text>

      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.image}
        resizeMode="contain"
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notificações</Text>
            <ScrollView>
              {notifications.length === 0 ? (
                <Text style={styles.noNotifications}>Sem novas notificações</Text>
              ) : (
                notifications.map(notification => (
                  <TouchableOpacity
                    key={notification.notificacao_id}
                    style={[
                      styles.notificationItem,
                      notification.lida && styles.notificationRead
                    ]}
                    onPress={() => {
                      if (!notification.lida) {
                        markNotificationAsRead(notification.notificacao_id);
                      }
                    }}
                  >
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>{notification.titulo}</Text>
                      <View style={styles.notificationDateTime}>
                        <Text style={styles.notificationDate}>{new Date(notification.data_hora).toLocaleDateString()}</Text>
                        <Text style={styles.notificationTime}>{new Date(notification.data_hora).toLocaleTimeString()}</Text>
                      </View>
                    </View>
                    <Text style={styles.notificationMessage}>{notification.mensagem}</Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <View style={styles.buttonMd}>
              <Button title="Fechar" style={styles.button} onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.notificationIcon}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons
          name="notifications"
          size={30}
          color={colors.primary}
        />
        {notifications.some(notification => !notification.lida) && (
          <View style={styles.notificationBadge} />
        )}
      </TouchableOpacity>

      {user?.tipo_usuario === "Usuário" ? (
        <Button
          title={"Abrir Chamado"}
          style={styles.button}
          onPress={() => navigation.navigate("Emergency")}
          disabled={loading}
        />
      ) : user?.tipo_usuario === "Admin" ? (
        <>
          <Button title="Chamados" style={styles.button} onPress={() => navigation.navigate("oTracking")} />
          <Button title="Viaturas" style={styles.button} onPress={() => navigation.navigate("carList")} />
          <Button title="Adicionar Usuário" style={styles.button} onPress={() => navigation.navigate('Register', { isCadastroNovo: true })} />
          <Button title="Registro de Ocorrências" style={styles.button} onPress={() => navigation.navigate('Hist', { isCadastroNovo: true })} />
        </>
      ) : (
        <Button title="Chamados" style={styles.button} onPress={() => navigation.navigate("oTracking")} />
      )}
      <Button title="Perfil" style={styles.button} onPress={() => navigation.navigate("Register")} />
      <Button title="Configurações" style={styles.button} onPress={() => navigation.navigate("Settings")} />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  button: {
    width: "90%",
    alignItems: "center",
    marginBottom: 15,
  },  
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonMd: {
    width: "100%",
    marginTop: 20,  // Espaço adicional entre a lista de notificações e o botão "Fechar"
    justifyContent: "center",
    alignItems: "center",
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationDateTime: {
    alignItems: 'flex-end',
  },
  notificationIcon: {
    position: 'absolute',
    top: 40, // Ajustei a posição para garantir que não saia da tela
    right: 20,
    zIndex: 1, // Garantir que o ícone fique acima dos outros elementos
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    width: '90%',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  notificationItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  notificationRead: {
    backgroundColor: '#f0f0f0',    // (opcional) Riscar o texto para indicar leitura
  },
  notificationUnreadText: {
    fontWeight: 'bold',  // Aplica negrito nas notificações não lidas
  },
  notificationText: {
    fontSize: 16,
  },
  notificationDate: {
    fontSize: 12,
    color: '#555',
  },
  notificationTime: {
    fontSize: 12,
    color: '#555',
  },
  notificationMessage: {
    marginTop: 5,
    fontSize: 14,
    color: '#333',
  },
  noNotifications: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
});