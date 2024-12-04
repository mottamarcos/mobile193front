import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Modal, Linking, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import api from "../services/api";
import Button from "../components/button";
import Input from "../components/input";
import colors from "../styles/colors";
import CustomAlert from "../components/CustomAlert";
import { useUser } from "../contexts/contextUser";

const handleWhatsApp = (userPhone, selectedCall) => {
  const message = `Quero falar sobre a ocorrência ${selectedCall.ocorrencia_id}`;
  const whatsappUrl = `https://wa.me/55${userPhone}?text=${encodeURIComponent(message)}`;
  Linking.openURL(whatsappUrl);
};

const handleCall = (userPhone) => {
  const phoneUrl = `tel:+55${userPhone}`;
  Linking.openURL(phoneUrl);
};

export default function Tracking() {
  const [occurrences, setOccurrences] = useState([]);
  const [selectedCall, setSelectedCall] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [description, setDescription] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [userPhone, setUserPhone] = useState(null);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);
  const {user} = useUser();

  const getButtonTitle = () => {
    if (!selectedCall) return "Carregando...";
    console.log(selectedCall.status); 
    switch (selectedCall.status) {
      case "Aguardando Resgate":
        return "Saída da base";
      case "Equipe a Caminho":
        return "Chegada na ocorrência";
      case "Resgate em Progresso":
        return "Concluir Ocorrência";
      default:
        return "Status Desconhecido";
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await api.get("vehicles/getVehicles");
      setVehicles(response.data);
    } catch (error) {
      console.error("Erro ao buscar viaturas:", error);
    }
  };

  const fetchUserPhone = async (usuario_id) => {
    try {
      const response = await api.get(`/user/getUser/${usuario_id}`);
      setUserPhone(response.data.telefone);
    } catch (error) {
      console.error("Erro ao obter número do usuário:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchVehicles();
      api
        .get("/occurrences/findOp")
        .then((response) => {
          setOccurrences(response.data.occurrences);
        })
        .catch((error) => {
          console.error("Erro ao buscar ocorrências:", error);
        });
    }, [])
  );

  const handleStatus = async (ocorrencia_id) => {
    let statusToChange = "";

    switch (selectedCall.status) {
      case "Aguardando Resgate":
        statusToChange = "Equipe a Caminho";
        break; // Adicionado o break para interromper o fluxo após cada case
      case "Equipe a Caminho":
        statusToChange = "Resgate em Progresso";
        break;
      case "Resgate em Progresso":
        statusToChange = "Concluída";
        break;
      default:
        return "Status Desconhecido"; // Se o status não for reconhecido, retorna uma mensagem
    }

    await api.put("/occurrences/status", {
      ocorrencia_id: ocorrencia_id,
      status: statusToChange
    });
    closeModal();
  }

  const openModal = (call) => {
    setSelectedCall(call);
    fetchUserPhone(call.usuario_id);
    setModalVisible(true);
    if (call.localizacao) {
      const [latitude, longitude] = call.localizacao.split(",").map(Number);
      if (!isNaN(latitude) && !isNaN(longitude)) {
        setMarkerCoordinate({ latitude, longitude });
      } else {
        console.warn("Coordenadas inválidas:", call.localizacao);
        setMarkerCoordinate(null);
      }
    } else {
      setMarkerCoordinate(null);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedCall(null); 
    fetchOccurrences();
  };

  const sendOccurrence = () => {
    if (!selectedVehicle) {
      CustomAlert("Selecione uma viatura antes de enviar a ocorrência.");
      return;
    }
  
    const payload = {
      ocorrencia_id: selectedCall?.ocorrencia_id,
      viatura_id: selectedVehicle.viatura_id,
      detalhes: description,
      status: "Aguardando Resgate",
    };
    console.log(payload);  
    api
      .put("/occurrences/status", {
        ocorrencia_id: payload.ocorrencia_id,
        status: payload.status
      })
      .then(() =>
        api.post("/rescue/createRescue", {
          ocorrencia_id: payload.ocorrencia_id,
          viatura_id: payload.viatura_id,
          detalhes: payload.detalhes,
        })
      )
      .then(() => {
        CustomAlert("Ocorrência enviada com sucesso!");
        closeModal();
      })
      .catch((error) => {
        console.error("Erro ao enviar ocorrência:", error);
        CustomAlert("Erro ao enviar ocorrência.");
      });
  };

  const fetchOccurrences = async () => {
    try {
      const response = await api.get("/occurrences/findOp");
      setOccurrences(response.data.occurrences);
    } catch (error) {
      console.error("Erro ao buscar ocorrências:", error);
    }
  };

  const renderCallItem = ({ item }) => (
    <Button style={styles.callItem} onPress={() => openModal(item)}>
      <View style={styles.callInfo}>
        <Ionicons name="alert-circle" size={24} color="#FF5733" />
        <View style={styles.callText}>
          <Text style={styles.callType}>{item.tipo_ocorrencia}</Text>
          <Text style={styles.callStatus}>{item.status}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </Button>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Acompanhamento de Chamados</Text>
      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.ocorrencia_id.toString()}
        renderItem={renderCallItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum chamado encontrado.</Text>}
      />
      <Modal visible={modalVisible} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={30} color="#fff" style={styles.icon} />
            </TouchableOpacity>

            {selectedCall && (
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Text style={styles.modalTitle}>Detalhes do Chamado</Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Ocorrência: </Text>
                  {selectedCall.ocorrencia_id}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Tipo: </Text>
                  {selectedCall.tipo_ocorrencia}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Status: </Text>
                  {selectedCall.status}
                </Text>
                {markerCoordinate ? (
                  <MapView
                  style={styles.map}
                  initialRegion={{
                    latitude: markerCoordinate.latitude,
                    longitude: markerCoordinate.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  >
                  <Marker
                    coordinate={markerCoordinate}
                    title="Local da ocorrência"
                    description="Clique para abrir no aplicativo de mapas"
                    onCalloutPress={() => {
                      const { latitude, longitude } = markerCoordinate;
                      const label = "Local da Ocorrência";
                      const url = `geo:${latitude},${longitude}?q=${latitude},${longitude}(${label})`;
                      Linking.openURL(url).catch((err) => console.error("Erro ao abrir o mapa:", err));
                    }}
                  />
                </MapView>
                ) : (
                  <Text>Carregando localização...</Text>
                )}
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Descrição: </Text>
                  {selectedCall.descricao}
                </Text>
                {selectedCall.status === "Aberta" && (
                  <>
                    <View style={styles.pickerContainer}>
                      <Text style={styles.title}>Selecione a Viatura</Text>
                      <Picker
                        selectedValue={selectedVehicle}
                        onValueChange={(itemValue) => setSelectedVehicle(itemValue)}
                        style={styles.pickerWrapper}
                      >
                        <Picker.Item label="Selecione uma viatura" value={null} />
                        {vehicles.map((vehicle) => (
                          <Picker.Item
                            key={vehicle.viatura_id}
                            label={`${vehicle.tipo_viatura} - Placa: ${vehicle.placa}`}
                            value={vehicle}
                          />
                        ))}
                      </Picker>
                    </View>
                    <Input
                      value={description}
                      onChangeText={(text) => setDescription(text)}
                      placeholder="Observações"
                      style={[styles.input]}
                      autoCapitalize="sentences"
                    />
                    <Button
                      style={styles.sendButton}
                      onPress={sendOccurrence}
                      title="Enviar Ocorrência"
                    />
                  </>
                )}
                {selectedCall.status !== "Concluída" &&  (
                  <>
                    <View style={{ flexDirection: 'row', marginTop: 5, justifyContent: 'center' }}>
                    <TouchableOpacity onPress={() => handleWhatsApp(userPhone, selectedCall)} style={styles.iconButton}>
                      <Ionicons name="logo-whatsapp" size={50} color="green" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleCall(userPhone)} style={styles.iconButton}>
                      <Ionicons name="call" size={50} color="blue" />
                    </TouchableOpacity>
                  </View>
                  <View style={{marginTop: 10}}>
                    {selectedCall.status !== "Aberta" && user.tipo_usuario === "Militar" && (
                      <>
                        <Button
                        title={getButtonTitle()}
                        onPress={() => handleStatus(selectedCall.ocorrencia_id)}
                        />
                      </>
                    )}
                  </View>
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  sendButton: {
    marginTop: 20,
  },
  input: {
    height: 100,
    textAlignVertical: "top", 
    textAlign: "left", 
    paddingTop: 15,
  },
  map: {
    width: "100%",
    height: 300,
    marginBottom: 15,
  },
  pickerWrapper: {
    marginBottom: 20,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  callStatus: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
  },
  callType: {
    fontSize: 16,
    fontWeight: "600",
    color: "black",
  },
  callItem: {
    flexDirection: "row",
    padding: 15,
    borderWidth: 1,
    borderColor: colors.primaryLight,
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor:"#fff",
  },
  callInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  callText: {
    marginLeft: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: colors.background,
  },
  listContainer: {
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: 18,
    color: "black",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalBox: {
    width: "90%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text,
    marginBottom: 15,
  },
  detailText: {
    fontSize: 18,
    color: "#555",
    marginBottom: 10,
  },
  detailLabel: {
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
    position: "absolute",
    zIndex:8,
    top: 10,
    right: 10,
  },
  iconButton: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 50,
    margin:5,
  },
});
