import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert } from "react-native";
import Button from "../components/button";
import api from "../services/api";
import CustomAlert from "../components/CustomAlert";

export default function ForgotPassword({ route, navigation }) {
  const [email, setEmail] = useState(route?.params?.email || "");
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const handleSendCode = () => {
    api
      .post("/auth/recovery", { email })
      .then(() => {
        showAlert("Sucesso", "Código de recuperação enviado para o seu e-mail.");
        navigation.navigate("Reset", { email });
      })
      .catch((error) => {
        showAlert("Erro", "Não foi possível enviar o código de recuperação.");
      });
  };

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const hideAlert = () => {
    setIsAlertVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recuperar Senha</Text>
      <Text style={styles.label}>Digite seu e-mail cadastrado:</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Enviar Código" onPress={handleSendCode} />


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
