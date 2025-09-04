import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // N'oubliez pas d'installer ce package
import { User, Discussion } from './AppType'; // Nous allons créer ce fichier types/AppTypes.ts

// --- Interfaces et Types (à déplacer dans src/types/AppTypes.ts) ---
// Pour l'instant, je les mets ici pour que le code soit compilable.
// Mais il faudra créer le fichier src/types/AppTypes.ts et les y déplacer.
/*
export interface Message {
  sender: "user" | "bot";
  time: Date;
  content: string;
}

export interface Discussion {
  id: string;
  title: string;
  messages: Message[];
}

export interface User {
  login: string;
  password: string;
  pseudo: string;
  discussions: Discussion[];
}
*/
// --- Fin des Interfaces et Types temporaires ---


// Interface pour le BDContext
interface BDContextType {
  users: User[];
  auth: (login: string, password: string) => User | null;
  saveUsers: (usersToSave: User[]) => Promise<void>;
  loadUsers: () => Promise<void>;
}

// Création du Contexte
export const BDContext = createContext<BDContextType | undefined>(undefined);

// Provider du Contexte
interface BDProviderProps {
  children: ReactNode;
}

export const BDProvider: React.FC<BDProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<User[]>([]);
  const USERS_STORAGE_KEY = '@chatinside_users';

  // Charger les utilisateurs au démarrage de l'application
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const storedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (storedUsers) {
        // Important : Reconvertir les dates des discussions si nécessaire,
        // mais pour l'MVP, les dates seront gérées comme des strings ou recréées à partir de strings.
        // Ici, on fait un parse simple.
        const parsedUsers: User[] = JSON.parse(storedUsers);
        setUsers(parsedUsers);
        console.log('Utilisateurs chargés :', parsedUsers.length, 'utilisateurs');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs depuis AsyncStorage', error);
    }
  };

  const saveUsers = async (usersToSave: User[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersToSave));
      setUsers(usersToSave); // Mettre à jour l'état local après la sauvegarde
      console.log('Utilisateurs sauvegardés :', usersToSave.length, 'utilisateurs');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des utilisateurs dans AsyncStorage', error);
    }
  };

  const auth = (login: string, password: string): User | null => {
    console.log(`Tentative d'authentification pour ${login}...`);
    const user = users.find(u => u.login === login && u.password === password);
    if (user) {
      console.log(`Authentification réussie pour ${login}.`);
      return user;
    }
    console.log(`Authentification échouée pour ${login}.`);
    return null;
  };

  const contextValue: BDContextType = {
    users,
    auth,
    saveUsers,
    loadUsers,
  };

  return (
    <BDContext.Provider value={contextValue}>
      {children}
    </BDContext.Provider>
  );
};

// Hook personnalisé pour utiliser le BDContext
export const useBD = () => {
  const context = useContext(BDContext);
  if (context === undefined) {
    throw new Error('useBD doit être utilisé à l\'intérieur d\'un BDProvider');
  }
  return context;
};