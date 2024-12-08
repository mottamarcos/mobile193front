import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import colors from "../styles/colors";
import CustomAlert from "../components/CustomAlert";
import Button from "../components/button";
import Input from "../components/input";
import Icon from 'react-native-vector-icons/Feather';
import api from "../services/api";
import { useUser } from "../contexts/contextUser";

export default function LoginScreen({ navigation }) {
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { login } = useUser();

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const hideAlert = () => {
    setIsAlertVisible(false);
  };

  const handleLogin = async () => {
    if (!email || !senha) {
      showAlert("Erro", "Preencha todos os campos!");
      return;
    }

    try {
      const response = await api.post('/auth/login', { email, senha });
    
      const { usuario } = response.data;
    
      if (!usuario) {
        throw new Error("Usuário não encontrado na resposta da API");
      }
    
      // Dados retornados corretamente
      login(usuario);      
      navigation.reset({
        index: 0,
        routes: [{ name: "HomeScreen" }],  
      });
    } catch (error) {
      showAlert("Erro", error.response?.data?.message || error.message);
    };
  };

  const handlePasswordRecovery = () => {
    navigation.navigate("Recovery");
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logoImage}
        resizeMode="contain"
      />
      <Text style={styles.logo}>193 Mobile</Text>

      <Input
        value={email}
        onChangeText={(text) => setEmail(text)}
        placeholder="E-mail"
        style={[styles.input]}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <View style={styles.passwordContainer}>
        <Input
          value={senha}
          onChangeText={(text) => setPassword(text)}
          placeholder="Senha"
          style={[styles.input]}
          secureTextEntry={!isPasswordVisible}
        />
        <TouchableOpacity onPress={togglePasswordVisibility} style={styles.icon}>
          <Icon
            name={isPasswordVisible ? "eye-off" : "eye"}
            size={24}
            color={colors.secondary}
          />
        </TouchableOpacity>
      </View>

      <Button title="Entrar" style={styles.button} onPress={handleLogin} />

      <TouchableOpacity onPress={() => navigation.navigate("Register", { isCadastroNovo: true })} style={styles.link}>
        <Text style={styles.linkText}>Criar conta</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handlePasswordRecovery} style={styles.link}>
        <Text style={styles.linkText}>Esqueci minha senha</Text>
      </TouchableOpacity>

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
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  logoImage: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginBottom: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: colors.secondary,
  },
  input: {
    width: "100%",
    marginBottom: 10,
    height: 50,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  icon: {
    position: "absolute",
    right: 10,
  },
  button: {
    marginTop: 20,
  },
  link: {
    marginTop: 10,
  },
  linkText: {
    color: colors.secondary,
    textDecorationLine: "underline",
    textAlign: "center",
  },
});
