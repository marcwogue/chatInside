import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useBD } from './bd'; // Utilise notre BDContext
import { User, Discussion } from './AppType'; // Nos types définis précédemment

// Interface pour le UserContext
interface UserContextType {
  currentUser: User | null;
  login: (login: string, password: string) => Promise<boolean>;
  signin: (login: string, password: string, pseudo: string) => Promise<boolean>;
  disconnect: () => void;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean; // Pour gérer l'état de chargement lors de l'auth
}

// Création du Contexte
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider du Contexte
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Commence en chargement pour vérifier l'état initial
  const { users, auth, saveUsers, loadUsers } = useBD(); // Accès aux fonctions du BDContext

  // On peut ajouter une logique pour tenter de recharger l'utilisateur
  // si on avait un mécanisme de persistance de session (non MVP ici, mais utile à savoir)
  useEffect(() => {
    // Dans un vrai scénario, on pourrait charger un token de session ici.
    // Pour l'MVP, on assume pas de session persistante au démarrage pour UserContext.
    // L'isLoading est là principalement pour les fonctions login/signin.
    setIsLoading(false); // Fin du chargement initial
  }, []);



  const login = async (login: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    const authenticatedUser = auth(login, password); // Utilise la fonction auth du BDContext
    if (authenticatedUser) {
      setCurrentUser(authenticatedUser);
      setIsLoading(false);
      console.log('UserContext: Utilisateur connecté :', authenticatedUser.pseudo);
      return true;
    }
    setIsLoading(false);
    console.log('UserContext: Échec de la connexion.');
    return false;
  };

  const signin = async (login: string, password: string, pseudo: string): Promise<boolean> => {
    setIsLoading(true);
    // Vérifier si un utilisateur avec ce login existe déjà
    const userExists = users.some(u => u.login === login);
    if (userExists) {
      setIsLoading(false);
      console.log('UserContext: Un utilisateur avec ce login existe déjà.');
      return false; // Échec : login déjà pris
    }

    const newUser: User = {
      login,
      password, // Rappel : pas de cryptage pour l'MVP
      pseudo,
      discussions: [], // Nouvel utilisateur sans discussions au départ
    };

    const updatedUsers = [...users, newUser]; // Ajout du nouvel utilisateur
    await saveUsers(updatedUsers); // Sauvegarde dans BDContext

    setCurrentUser(newUser); // Connecte le nouvel utilisateur
    setIsLoading(false);
    console.log('UserContext: Nouvel utilisateur créé et connecté :', newUser.pseudo);
    return true;
  };

  const disconnect = () => {
    setCurrentUser(null);
    console.log('UserContext: Utilisateur déconnecté.');
    // Pas besoin de sauvegarder directement ici, car la déconnexion ne modifie pas le tableau des utilisateurs
  };



  const contextValue: UserContextType = {
    currentUser,
    login,
    signin,
    disconnect,
    setCurrentUser, 
    isLoading,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personnalisé pour utiliser le UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser doit être utilisé à l\'intérieur d\'un UserProvider');
  }
  return context;
};