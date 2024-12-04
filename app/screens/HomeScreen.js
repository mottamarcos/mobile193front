import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import colors from "../styles/colors"; 
import Button from '../components/button';
import {  useUser } from '../contexts/contextUser';
import * as Location from "expo-location";
import api from '../services/api';


export default function HomeScreen ({ navigation }) {
  const [loading, setLoading] = useState(true);
  const { user } = useUser(); // Obtendo o tipo de usuário do contexto
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
  }, []);


  const handleOpenCall = async () => {
    setLoading(true);
    try {
      // Consulta ao backend para verificar se há ocorrência em aberto
      const response = await api.get(`/occurrences/find/${user.user_id}`);
      const { occurrence } = response.data;
      if (occurrence && Object.keys(occurrence).length > 0) {
        // Se houver ocorrência aberta, redireciona para a tela Tracking
        navigation.navigate("vTracking");
      } else {
        // Caso contrário, redireciona para criar uma nova ocorrência
        navigation.navigate("Emergency");
      }
    } catch (error) {
          console.log(response.data);
    }
    setLoading(false);
    } 
  

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Bem-vindo ao 193 MOBILE!</Text>

      {/* Imagem (Opcional) */}
      <Image
        source={require("../../assets/images/icon.png")} // Substitua pelo caminho correto
        style={styles.image}
        resizeMode="contain"
      />

      {/* Botões de Navegação */}
      {user?.tipo_usuario === "Usuário" ? (
            <Button
            title={"Abrir Chamado"}
            style={styles.button}
            onPress={handleOpenCall}
            disabled={loading}
          />
        ) : user?.tipo_usuario  === "Admin" ?(
          <>
            <Button title="Chamados" style={styles.button} onPress={() => navigation.navigate("oTracking")} />
            <Button title="Viaturas" style={styles.button} onPress={() => navigation.navigate("carList")} />
            <Button title="Adicionar Usuário" style={styles.button} onPress={() => navigation.navigate('Register', { isCadastroNovo: true })} />
            <Button title="Registro de Ocorrências" style={styles.button} onPress={() => navigation.navigate('Hist', { isCadastroNovo: true })} />
          </> 
        ) : (
          <Button title="Chamados" style={styles.button} onPress={() => navigation.navigate("oTracking")} />
        )
      }
      <Button title="Perfil" style={styles.button} onPress={() => navigation.navigate("Register")} />
      <Button title="Configurações" style={styles.button} onPress={() => navigation.navigate("Settings")} />
    </View>
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
});