import React, { useState, useEffect } from "react"; 
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, FlatList } from "react-native";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons"; 
import MapView, { Marker } from "react-native-maps"; 
import CustomAlert from "../components/CustomAlert";
import Button from "../components/button";
import { SafeAreaView } from "react-native-safe-area-context";
import colors from "../styles/colors";
import { useFocusEffect } from '@react-navigation/native';
import { useUser } from "../contexts/contextUser";
import api from "../services/api";


const occurrenceOptions = [
  { id: "1", name: "Salvamento, Busca ou Resgate", icon: "search", color: "#FF5733" },
  { id: "2", name: "Incêndio", icon: "flame", color: "#FF6347" },
  { id: "3", name: "Atendimento Pré-hospitalar", icon: "medkit", color: "#28A745" },
  { id: "4", name: "Produtos Perigosos", icon: "warning", color: "#FFC107" },
];

export default function EmergencyScreen({ navigation }) {
  const { user } = useUser();
  const [location, setLocation] = useState(null); 
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [occurrenceType, setOccurrenceType] = useState("");
  const [description, setDescription] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const hideAlert = () => {
    setIsAlertVisible(false);
  };
  
  const handleCreateOccurrence = async () => {
    if (!occurrenceType || !location) {
      showAlert("Erro", "Preencha o tipo de ocorrência e ative sua localização.");
      return;
    }
    try {
      // Dados da ocorrência
      const occurrenceData = {
        tipo_ocorrencia: occurrenceType,  // Exemplo de tipo
        descricao: description || "Sem descrição adicional.",
        localizacao: `${location.latitude},${location.longitude}`, // Exemplo de localização
        usuario_id: user.user_id, // ID do usuário autenticado
      };
      console.log(occurrenceData);
      await api.post(`/occurrences/`, occurrenceData);
      navigation.navigate("vTracking");
    } catch (error) {
      console.error("Erro ao criar ocorrência:", error);
      Alert.alert("Erro", "Não foi possível enviar o chamado.");
    }
  };
  


const [isLoading, setIsLoading] = useState(false);

const fetchLocation = async () => {
  setIsLoading(true); // Ativa o estado de carregamento
  let { status } = await Location.getForegroundPermissionsAsync();

  
  if (status !== "granted") {
    let { status: newStatus } = await Location.requestForegroundPermissionsAsync();
    if (newStatus !== "granted") {
      setPermissionError(true);
      setIsLoading(false); // Desativa o estado de carregamento
      showAlert("Permissão Negada", "Permissões de localização são necessárias para continuar.");
      return;
    }
  }

  try {
    const locationServicesEnabled = await Location.hasServicesEnabledAsync();
    if (!locationServicesEnabled) {
      setPermissionError(true);
      setIsLoading(false);
      showAlert("Erro", "Os serviços de localização estão desativados no dispositivo.");
      return;
    }

    let currentLocation = await Location.getCurrentPositionAsync({});
    setLocation(currentLocation.coords);
    setPermissionError(false); // Reseta o erro quando a localização é obtida
  } catch (error) {
    setPermissionError(true);
    showAlert("Erro", "Não foi possível obter a localização.");
  } finally {
    setIsLoading(false); // Garante que o estado de carregamento será desativado
  }
};


  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setLocation(null); // Limpa a localização quando a tela for desmontada
      };
    }, [])
  );
  
    useEffect(() => {
      fetchLocation();
    }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Chamar Emergência</Text>

      {/* Input de Tipo de Ocorrência com ícone "+" */}
      <View style={styles.inputWithIcon}>
        <TextInput
          style={styles.inputField}
          placeholder="Tipo de Ocorrência"
          value={occurrenceType}
          editable={false} 
        />
        <TouchableOpacity onPress={openModal} style={styles.iconButton}>
          <Ionicons name="add-circle" size={28} color="#007BFF" />
        </TouchableOpacity>
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        {location ? (
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: location.latitude,
              longitude: location.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}
            showsUserLocation={true}
          >
            <Marker coordinate={{ latitude: location.latitude, longitude: location.longitude }} />
          </MapView>
        ) : (
          <View style={styles.errorContainer}>
            <Text style={styles.errorMessage}>Não foi possível acessar a localização.</Text>
            {/* Botão para tentar recarregar */}
            <Button
              style={styles.iconButton}
              onPress={fetchLocation}
            >
            {isLoading ? (
              <Ionicons name="hourglass" size={24} color="#fff" />
            ) : (
              <Ionicons name="reload" size={24} color="#fff" />
            )}
            </Button>
          </View>
        )}
      </View>

      {/* Descrição Adicional */}
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Descrição Adicional"
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />

      {/* Botão Enviar */}
      <View style={styles.bottomContainer}>
        <Button title="Enviar Chamado" style={styles.sendButton} onPress={handleCreateOccurrence} />
      </View>

      {/* Modal de Tipo de Ocorrência */}
      <Modal visible={modalVisible} animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
            <FlatList
              data={occurrenceOptions}
              keyExtractor={(item) => item.id}
              numColumns={2}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionButton, { backgroundColor: item.color }]}
                  onPress={() => {
                    setOccurrenceType(item.name);
                    closeModal();
                  }}
                >
                  <Ionicons name={item.icon} size={40} color="#fff" style={styles.icon} />
                  <Text style={styles.optionText}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={hideAlert}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  reloadButton: {
    backgroundColor: colors.secondary,
    marginTop: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",  // Fundo suave
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    textAlign: "center",
    color: colors.secondary,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    marginBottom: 15,
    elevation: 10,
  },
  inputField: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  iconButton: {
    marginLeft: 10,
  },
  input: {
    width: "100%",
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  bottomContainer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  sendButton: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  mapContainer: {
    height: 250,
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  errorMessage: {
    color: "red",
    fontSize: 16,
    marginBottom: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 40,
    elevation: 10,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    padding: 5,
    borderRadius: 50,
    zIndex: 1,
  },
  optionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    margin: 10,
    borderRadius: 8,
    height: 120,
    width: "45%",
    overflow: "hidden",
    elevation: 5,
  },
  optionText: {
    color: "#fff",
    fontSize: 12,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 18,
  },
});
