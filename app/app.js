import React, { useEffect } from "react";
import { registerRootComponent } from "expo"; 
import { UserProvider } from "./contexts/contextUser"; // Ajuste o caminho do contexto
import RootLayout from "./_layout";  // Ajuste o caminho do RootLayout
import * as Location from "expo-location";

export default function App() {
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

  return (
    <UserProvider>
      <RootLayout />
    </UserProvider>
  );
}
registerRootComponent(App);