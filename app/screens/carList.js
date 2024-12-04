import React, { useState, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, Modal } from "react-native";
import Input from "../components/input";
import Button from "../components/button";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VehicleScreen() {
  const [vehicles, setVehicles] = useState([]); // Lista de viaturas
  const [filteredVehicles, setFilteredVehicles] = useState([]); // Lista filtrada
  const [searchTerm, setSearchTerm] = useState(""); // Termo de busca
  const [isModalVisible, setIsModalVisible] = useState(false); // Controle do modal
  const [editingVehicle, setEditingVehicle] = useState(null); // Veículo em edição
  const [formData, setFormData] = useState({ model: "", plate: "", suffix: "", year: "" }); // Dados do formulário

  useEffect(() => {
    const loadVehicles = async () => {
      // Substituir pelo fetch de API real
      const mockData = [
        { id: "1", model: "Caminhão", plate: "ABC1234", suffix: "01", year: "2020" },
        { id: "2", model: "Carro", plate: "DEF5678", suffix: "02", year: "2021" },
      ];
      setVehicles(mockData);
      setFilteredVehicles(mockData);
    };
    loadVehicles();
  }, []);

  // Atualiza a lista filtrada quando o termo de busca muda
  useEffect(() => {
    if (searchTerm) {
      const filtered = vehicles.filter(
        (vehicle) =>
          vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
          vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredVehicles(filtered);
    } else {
      setFilteredVehicles(vehicles);
    }
  }, [searchTerm, vehicles]);

  // Abrir modal para edição ou cadastro
  const openModal = (vehicle = null) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData(vehicle);
    } else {
      setEditingVehicle(null);
      setFormData({ model: "", plate: "", suffix: "", year: "" });
    }
    setIsModalVisible(true);
  };

  // Salva ou atualiza a viatura
  const saveVehicle = () => {
    if (editingVehicle) {
      // Atualiza a viatura existente
      const updatedVehicles = vehicles.map((v) =>
        v.id === editingVehicle.id ? { ...formData, id: v.id } : v
      );
      setVehicles(updatedVehicles);
    } else {
      // Adiciona uma nova viatura
      const newVehicle = { ...formData, id: Date.now().toString() };
      setVehicles([...vehicles, newVehicle]);
    }
    setIsModalVisible(false);
  };

  // Excluir uma viatura
  const deleteVehicle = (id) => {
    const updatedVehicles = vehicles.filter((v) => v.id !== id);
    setVehicles(updatedVehicles);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Campo de Busca */}
      <Input
        style={styles.searchInput}
        placeholder="Buscar por modelo ou placa"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Lista de Viaturas */}
      <FlatList
        data={filteredVehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.vehicleItem}>
            <Text style={styles.vehicleText}>{`${item.model} - ${item.plate}`}</Text>
            <View style={styles.actions}>
              <Button onPress={() => openModal(item)} style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#FF5733"/>
              </Button>
              <Button onPress={() => deleteVehicle(item.id)} style={styles.deleteButton}>
                <Ionicons name="trash" size={16} color="#FF5733"/>
              </Button>
            </View>
          </View>
        )}
      />

      {/* Botão de Adicionar */}
      <Button title="Adicionar Viatura" onPress={() => openModal()} style={styles.addButton}>
      </Button>

      {/* Modal de Cadastro/Edição */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingVehicle ? "Editar Viatura" : "Cadastrar Viatura"}
            </Text>

            <Input
              style={styles.input}
              placeholder="Modelo"
              value={formData.model}
              onChangeText={(text) => setFormData({ ...formData, model: text })}
            />
            <Input
              style={styles.input}
              placeholder="Placa"
              value={formData.plate}
              onChangeText={(text) => setFormData({ ...formData, plate: text })}
            />
            <Input
              style={styles.input}
              placeholder="Sufixo"
              value={formData.suffix}
              onChangeText={(text) => setFormData({ ...formData, suffix: text })}
            />
            <Input
              style={styles.input}
              placeholder="Ano"
              value={formData.year}
              onChangeText={(text) => setFormData({ ...formData, year: text })}
              keyboardType="numeric"
            />

            <Button title="Salvar" onPress={saveVehicle} style={styles.modalButton} />
            <Button title="Cancelar" color="red" onPress={() => setIsModalVisible(false)} style={styles.modalButton} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f8f8" },
  searchInput: { height: 40, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, marginBottom: 16, paddingHorizontal: 8 },
  vehicleItem: { padding: 6, backgroundColor: "#fff", borderRadius: 8, marginBottom: 8, flexDirection: "row", justifyContent: "space-between" },
  vehicleText: { justifyContent:"center", fontSize: 16, fontWeight: "bold" },
  actions: { flexDirection: "row" },
  modalButton:{ marginTop:10,},
  editButton: { backgroundColor: "transparent", elevation:0, padding: 4, borderRadius: 4, paddingHorizontal: 14,},
  deleteButton: { backgroundColor: "transparent",elevation:0, padding:4, borderRadius: 4, paddingHorizontal: 14,},
  buttonText: { color: "#fff", fontWeight: "bold" },
  addButton: { padding: 16, borderRadius: 8, alignItems: "center", marginTop: 16 },
  modalContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 8, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16 },
  input: { height: 40 },
});
