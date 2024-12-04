import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useUser } from "../contexts/contextUser";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen({ navigation }) {
  const { logout } = useUser(); 
  const { user } = useUser();

  // Função para logout
  const handleLogout = () => {
    Alert.alert("Logout", "Você tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", onPress: () => {
        logout();
        navigation.navigate("Login")
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Configurações</Text>

      {/* Alterar Senha */}
      <TouchableOpacity
        style={styles.option}
        onPress={() => navigation.navigate("Recovery", { email: user.email })} // Passando o email para a próxima tela
        >
        <Text style={styles.optionText}>Alterar Senha</Text>
      </TouchableOpacity>

      {/* Logout */}
      <TouchableOpacity style={styles.option} onPress={handleLogout}>
        <Text style={[styles.optionText, styles.logoutText]}>Sair da Conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
  option: {
    marginTop: 20,
    paddingVertical: 15,
    borderRadius: 5,
    backgroundColor: "#007BFF",
    alignItems: "center",
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutText: {
    color: "#FF3B30",
  },
});
