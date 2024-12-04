import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import Button from "../components/button";
import api from "../services/api";
import CustomAlert from "../components/CustomAlert";

export default function ResetPassword({ route, navigation }) {
  const { email } = route.params;
  const [recoveryCode, setRecoveryCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const hideAlert = () => {
    setIsAlertVisible(false);
  };

  const handleResetPassword = () => {
    api
      .post("/auth/reset", { email, recoveryCode, newPassword })
      .then(() => {
        showAlert("Sucesso", "Senha alterada com sucesso!");
        navigation.navigate("Login");
      })
      .catch((error) => {
        console.error(error);
        showAlert("Erro", "Não foi possível redefinir a senha.");
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Redefinir Senha</Text>
      <Text style={styles.label}>Digite o código de recuperação:</Text>
      <TextInput
        style={styles.input}
        placeholder="Código de recuperação"
        value={recoveryCode}
        onChangeText={setRecoveryCode}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Digite sua nova senha:</Text>
      <TextInput
        style={styles.input}
        placeholder="Nova senha"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />
      <Button title="Redefinir Senha" onPress={handleResetPassword} />

      <CustomAlert
        visible={isAlertVisible}
        title={alertTitle}
        message={alertMessage}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});
