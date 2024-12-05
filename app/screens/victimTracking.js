import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import MapView, { Marker } from "react-native-maps";
import CustomAlert from "../components/CustomAlert";
import Button from "../components/button";
import colors from '../styles/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '../contexts/contextUser';
import { useNavigation } from '@react-navigation/native';
import api from '../services/api';

export default function VictimTracking() {
  const [isAlertVisible, setIsAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const { user } = useUser();
  const navigation = useNavigation();
  const [region, setRegion] = useState(null);
  const [occurrence, setOccurrence] = useState({});

  const fetchOpenOccurrence = async () => {
    try {
      const response = await api.get(`/occurrences/find/${user.user_id}`);
      if (response.data.success && response.data.occurrence.length > 0) {
        const occurrenceData = response.data.occurrence[0];
        setOccurrence(occurrenceData);

        // Atualizar região do mapa
        if (occurrenceData.localizacao) {
          const [latitude, longitude] = occurrenceData.localizacao.split(',').map(Number);
          setRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      } else {
        showAlert('Nenhuma ocorrência encontrada', response.data.message || 'Sem dados disponíveis.');
      }
    } catch (error) {
      console.error('Erro ao buscar a ocorrência:', error);
      showAlert('Erro', 'Não foi possível buscar a ocorrência.');
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchOpenOccurrence();
    });

    return unsubscribe;
  }, [navigation]);

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setIsAlertVisible(true);
  };

  const hideAlert = () => {
    setIsAlertVisible(false);
  };

  const handleEmergencyCall = () => {
    showAlert("Contato rápido", "193");
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Aguardando Resgate":
        return <FontAwesome name="clock-o" size={24} color="orange" />;
      case "Equipe a Caminho":
        return <FontAwesome name="car" size={24} color="blue" />;
      case "Resgate em Progresso":
        return <FontAwesome name="ambulance" size={24} color="green" />;
      default:
        return <FontAwesome name="question-circle" size={24} color="gray" />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Ocorrência em Andamento</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Descrição:</Text>
        <Text style={styles.value}>{occurrence.descricao || "Não disponível"}</Text>

        {region && (
          <MapView
            style={styles.map}
            initialRegion={region}
          >
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title="Local da Ocorrência"
              description={occurrence.descricao || "Sem descrição"}
            />
          </MapView>
        )}

        <Text style={styles.label}>Status da Ocorrência:</Text>
        <View style={styles.statusContainer}>
          {getStatusIcon(occurrence.status)}
          <Text style={styles.statusText}>{occurrence.status || "Não disponível"}</Text>
        </View>
      </View>

      <Button
        title="Contato Rápido - Sala de Operações"
        style={styles.button}
        onPress={handleEmergencyCall}
      />

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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#730202',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderColor: colors.primaryLight,
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 10,
  },
  map: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#260101',
    marginVertical: 5,
  },
  value: {
    fontSize: 16,
    color: '#260101',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#260101',
  },
  button: {
    alignItems: 'center',
  },
});