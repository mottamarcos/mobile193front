import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, Modal, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import api from "../services/api";
import colors from "../styles/colors";
import Button from "../components/button";

export default function AttendedOccurrences() {
  const [occurrences, setOccurrences] = useState([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [markerCoordinate, setMarkerCoordinate] = useState(null);

  const openModal = (occurrence) => {
    setSelectedOccurrence(occurrence);
    const [latitude, longitude] = occurrence.localizacao.split(",").map(coord => parseFloat(coord.trim()));
    setMarkerCoordinate({ latitude, longitude });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedOccurrence(null);
  };

  useFocusEffect(
    React.useCallback(() => {
      api
        .get("/occurrences/getOccAttended") // Endpoint para ocorrências atendidas
        .then((response) => {
          setOccurrences(response.data.occurrences);
        })
        .catch((error) => {
          console.error("Erro ao buscar ocorrências atendidas:", error);
        });
    }, [])
  );

  const renderOccurrenceItem = ({ item }) => (
    <Button style={styles.occurrenceItem} onPress={() => openModal(item)}>
      <View style={styles.occurrenceInfo}>
        <Ionicons name="checkmark-circle" size={24} color="green" />
        <View style={styles.occurrenceText}>
          <Text style={styles.occurrenceType}>{item.tipo_ocorrencia}</Text>
          <Text style={styles.occurrenceStatus}>{item.status}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#888" />
    </Button>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ocorrências Atendidas</Text>
      <FlatList
        data={occurrences}
        keyExtractor={(item) => item.ocorrencia_id.toString()}
        renderItem={renderOccurrenceItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma ocorrência atendida encontrada.</Text>}
      />
      <Modal visible={modalVisible} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={30} color="#fff" style={styles.icon} />
            </TouchableOpacity>

            {selectedOccurrence && (
              <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <Text style={styles.modalTitle}>Detalhes da Ocorrência</Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Ocorrência: </Text>
                  {selectedOccurrence.ocorrencia_id}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Tipo: </Text>
                  {selectedOccurrence.tipo_ocorrencia}
                </Text>
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Status: </Text>
                  {selectedOccurrence.status}
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
                      description="Toque aqui para abrir no aplicativo de mapas"
                      onCalloutPress={() => {
                        const lat = markerCoordinate.latitude;
                        const lng = markerCoordinate.longitude;
                        const label = "Local da Ocorrência";

                        const url = `geo:${lat},${lng}?q=${lat},${lng}(${label})`;

                        Linking.openURL(url).catch((err) =>
                          console.error("Erro ao abrir o mapa:", err)
                        );
                      }}
                    />
                  </MapView>
                ) : (
                  <Text>Carregando localização...</Text>
                )}
                <Text style={styles.detailText}>
                  <Text style={styles.detailLabel}>Descrição: </Text>
                  {selectedOccurrence.descricao}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginVertical: 15,
    textAlign: "center",
  },
  listContainer: {
    paddingHorizontal: 10,
  },
  occurrenceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  occurrenceInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  occurrenceText: {
    marginLeft: 10,
  },
  occurrenceType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  occurrenceStatus: {
    fontSize: 14,
    color: "#666",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#aaa",
    marginTop: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    maxHeight: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#333",
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
  },
  detailLabel: {
    fontWeight: "bold",
  },
  map: {
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
  },
});
