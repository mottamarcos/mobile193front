import React, { createContext, useContext, useState } from 'react';

// Criando o contexto do usuário
const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext); // Hook customizado para acessar o contexto
};

// Função para fornecer o contexto
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para armazenar o usuário

  // Função para realizar o login e armazenar o papel do usuário
  const login = (data) => {
    setUser(data); // Atualiza os dados do usuário no contexto
  };

  // Função para fazer o logout (opcional)
  const logout = () => {
    setUser(null); // Limpa o estado do usuário
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};
