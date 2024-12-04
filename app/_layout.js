import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useUser } from "./contexts/contextUser"; // Importando o hook useUser
import Login from "./screens/Login";
import Register from "./screens/Register";
import HomeScreen from "./screens/HomeScreen";
import Settings from "./screens/Settings";
import OTracking from "./screens/operationTracking";
import VTracking from "./screens/victimTracking";
import Emergency from "./screens/Emergency";
import CarList from "./screens/carList";
import Hist from "./screens/Hist";
import Recovery from "./screens/ForgotPassword";
import Reset from "./screens/ResetPassword";

const getRoutesForRole = (role) => {
  switch (role) {
    case "Admin":
      return [
        { name: "HomeScreen", component: HomeScreen },
        { name: "oTracking", component: OTracking },
        { name: "carList", component: CarList },
        { name: "Hist", component: Hist },
        { name: "Register", component: Register },
        { name: "Settings", component: Settings },
        { name: "Login", component: Login },
        { name: "Recovery", component: Recovery },
        { name: "Reset", component: Reset },
      ];
    case "Operador":
      return [
        { name: "HomeScreen", component: HomeScreen },
        { name: "oTracking", component: OTracking },
        { name: "Settings", component: Settings },
        { name: "Login", component: Login },
        { name: "Recovery", component: Recovery },
        { name: "Reset", component: Reset },
      ];
      case "Militar":
        return [
          { name: "HomeScreen", component: HomeScreen },
          { name: "oTracking", component: OTracking },
          { name: "Settings", component: Settings },
          { name: "Login", component: Login },
          { name: "Recovery", component: Recovery },
          { name: "Reset", component: Reset },
        ];
    case "Usuário":
      return [
        { name: "HomeScreen", component: HomeScreen },
        { name: "vTracking", component: VTracking },
        { name: "Emergency", component: Emergency },
        { name: "Register", component: Register },
        { name: "Settings", component: Settings },
        { name: "Login", component: Login },
        { name: "Recovery", component: Recovery },
        { name: "Reset", component: Reset },
      ];
    default:
      return [
        { name: "Login", component: Login },
        { name: "HomeScreen", component: HomeScreen },
        { name: "Register", component: Register },
        { name: "Recovery", component: Recovery },
        { name: "Reset", component: Reset },
      ];
  }
};

const Stack = createStackNavigator();

export default function RootLayout() {
  
  const { user } = useUser(); // Obtendo o usuário do contexto
  const routes = user ? getRoutesForRole(user.tipo_usuario) : getRoutesForRole(null);

  return (
    
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ "Login" }
        screenOptions={{ headerShown: false }}
      >
        {routes.map(({ name, component }) => (
          <Stack.Screen key={name} name={name} component={component} />
        ))}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
