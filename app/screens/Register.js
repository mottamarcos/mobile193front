import React, { useContext, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, StyleSheet } from "react-native";
import CustomAlert from "../components/CustomAlert";
import Input from "../components/input";
import Button from "../components/button";
import colors from "../styles/colors";
import { useUser } from '../contexts/contextUser';
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from '@react-navigation/native';
import api from "../services/api";

export default function RegisterScreen({ navigation, route }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { user } = useUser();
  const [userType, setUserType] = useState(""); // Substituir por variável que vem do banco
  const navigationUse = useNavigation();
  const isAddNew = route?.params?.isCadastroNovo ?? false;
  const { login } = useUser();
  let isAdmin = user?.tipo_usuario === "Admin"; // Ajustado para ser booleano

  useFocusEffect(
    React.useCallback(() => {
      if (user && !isAddNew) {
        setName(user.nome || "");
        setEmail(user.email || "");
        setPhone(user.telefone || "");
        setUserType(user.tipo_usuario || "");
        setPassword("********"); // Exibe asteriscos ao invés da senha real
        setConfirmPassword("********");
      } else{
        setName("");
        setEmail("");
        setPhone("");
        setUserType("");
        setPassword(""); // Exibe asteriscos ao invés da senha real
        setConfirmPassword("");
        isAdmin = user?.tipo_usuario === "Admin";
      }
    }, [ navigation, route ])
  );

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const hideAlert = () => {
    setIsAlertVisible(false);
  };

  const handleRegisterOrAdd = async () => {
    try {
      if (isAddNew || (isAdmin && isAddNew)) {
        // Função para adicionar um novo usuário
        await api.post("user/registerUser", {
          nome: name,
          email,
          telefone: phone,
          senha: password,
          tipo_usuario: userType,
        });
        showAlert("Sucesso", "Usuário adicionado com sucesso!");
        if(!isAdmin){
          navigation.navigate("Login");
        }
      } else {
        //Função para alterar o próprio usuário
          await api.put("user/updateUser", {
            nome: name,
            email,
            telefone: phone,
            tipo_usuario: userType,
            user_id: user.user_id ,
          });
          const response = await api.get(`user/getUser/${user.user_id}`);
          login(response.data);
          showAlert("Sucesso", "Usuário alterado com sucesso!");
      }
    } catch (error) {
      showAlert("Erro", error.response?.data?.message || "Ocorreu um erro ao salvar.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isAdmin ? "Adicionar Usuário" : "Registrar"}</Text>

      {/* Input: Nome */}
      <Input
        value={name}
        onChangeText={setName}
        placeholder="Nome"
        autoCapitalize="words"
        style={styles.input}
      />

      {/* Input: Email */}
      <Input
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* Input: Telefone */}
      <Input
        value={phone}
        onChangeText={setPhone}
        placeholder="Telefone"
        style={styles.input}
      />

      {/* Input: Senha */}
      {/* Input: Senha */}
      <Input
        value={password}
        onChangeText={setPassword}
        placeholder="Senha"
        secureTextEntry={!isAdmin && user == null} // Apenas mostra se não for admin ou não estiver logado
        style={styles.input}
        editable={isAddNew || (isAdmin && isAddNew)} // Desabilita para usuários logados
      />

      {/* Input: Confirmar Senha */}
      <Input
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="Confirmar Senha"
        secureTextEntry={!isAdmin && user == null}
        style={styles.input}
        editable={isAddNew || (isAdmin && isAddNew)}
      />

      {/* Picker: Tipo de Usuário */}
      <View style={styles.pickerContainer}>
        <Text style={styles.label}>Tipo de Usuário</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={userType}
            onValueChange={(itemValue) => isAdmin && setUserType(itemValue)} // Apenas admin pode alterar
            enabled={isAdmin}
          >
            <Picker.Item label="Usuário" value="Usuário" />
            <Picker.Item label="Operador" value="Operador" />
            <Picker.Item label="Militar" value="Militar" />
            <Picker.Item label="Admin" value="Admin" />
          </Picker>
        </View>
      </View>

      {/* Botão: Registrar ou Adicionar */}
      <Button
        title={isAdmin && isAddNew ? "Adicionar" : "Registrar"}
        onPress={handleRegisterOrAdd}
        style={styles.button}
      />

      {/* Link para Login */}
      {user == null && (
        <Text style={styles.linkText} onPress={() => navigationUse.reset({ index: 0, routes: [{ name: "Login" }] }) && navigation.navigate("Login")}>
          Já possui uma conta? Faça login
        </Text>
      )}

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
  pickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: colors.primaryDark,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.primaryLight,
    borderRadius: 8,
    backgroundColor: "#f9f9f9",
    overflow: "hidden",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: colors.secondary,
  },
  input: {
    marginBottom: 10,
    height: 50,
  },
  button: {
    marginTop: 10,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  linkText: {
    marginTop: 15,
    textAlign: "center",
    color: colors.secondary,
    textDecorationLine: "underline",
  },
});
