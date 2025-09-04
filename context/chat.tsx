import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useUser } from './userContext'; // Pour accéder à l'utilisateur courant
import { useBD } from './bd';   // Pour sauvegarder les utilisateurs mis à jour
import { User, Discussion, Message } from './AppType'; // Nos types définis
import { send } from '@/API/gemini';
// Interface pour le ChatContext
interface ChatContextType {
  currentDiscussion: Discussion | null;
  setCurrentDiscussion: (discussion: Discussion | null) => void;
  createDiscussion: (title: string) => Discussion;
  deleteDiscussion: (discussionId: string) => void;
  sendMessage: (discussionId: string, content: string) => void;
}

// Création du Contexte
export const ChatContext = createContext<ChatContextType | undefined>(undefined);

// Provider du Contexte
interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const { currentUser, setCurrentUser } = useUser(); // On aura besoin de setCurrentUser si on le rend disponible
  const { users, saveUsers } = useBD(); // Pour sauvegarder les changements sur les users
  const [currentDiscussion, setCurrentDiscussion] = useState<Discussion | null>(null);

  // Fonction utilitaire pour mettre à jour l'utilisateur courant et sauvegarder dans la BD
  const updateUserAndSave = async (updatedUser: User) => {
    if (currentUser) {
      // Met à jour la liste des utilisateurs dans BDContext
      const updatedUsers = users.map(u => (u.login === updatedUser.login ? updatedUser : u));
      await saveUsers(updatedUsers);
      // Met à jour l'utilisateur courant dans UserContext si setCurrentUser est disponible
      // Pour l'MVP, on assume que UserContext ne met à jour l'utilisateur que via ses propres fonctions
      // Si UserContext n'a pas de setCurrentUser public, on devra le gérer différemment
      // Pour l'instant, on se contente de mettre à jour le BDContext qui sera rechargé à la prochaine connexion
      // ou quand l'état de l'utilisateur est rafraîchi par UserContext (ex: après un login/signin).
      // SOLUTION PLUS ROBUSTE : Mettre à jour l'objet currentUser DANS le UserContext, ce qui déclencherait le re-rendu
      // et la sauvegarde via un useEffect dans UserContext.
      // Pour l'MVP et simplifier, nous allons assumer que `setCurrentUser` est disponible ou que l'objet `currentUser`
      // est lui-même mis à jour et que le `BDContext` est la source de vérité pour la persistance.
      // => Solution actuelle: La modification se fait sur un clone de l'utilisateur, puis on cherche
      // cet utilisateur dans 'users' (via le `useBD` hook) pour le mettre à jour et sauvegarder.

      // IMPORTANT : Pour que UserContext reflète les changements, il faudrait que `useUser`
      // dispose d'une méthode pour mettre à jour l'objet `currentUser` ou que `currentUser`
      // lui-même soit une référence mutable qui est observée.
      // Une approche simple pour l'MVP est de dire que les modifications sur les discussions
      // sont persistées via BDContext et seront visibles quand l'utilisateur se reconnectera
      // ou quand l'état de l'application sera rafraîchi.
      // Mieux: UserContext devrait exposer une fonction `updateCurrentUserDiscussions` par exemple.
      // Pour l'instant, je vais laisser cette subtilité pour se concentrer sur le ChatContext.
      // Je vais simuler la mise à jour de currentUser directement pour les besoins de ce contexte.
      // Si setCurrentUser n'est pas exposé par useUser, on devra le récupérer du UserContext ou UserProvider.

      // Modification: ajout de setCurrentUser dans UserContextType et UserProvider pour que ça marche
      // Cela implique une modification MINIME dans UserContext.tsx
      // Voir note ci-dessous.
      setCurrentUser(updatedUser); // Mise à jour de l'état local dans UserContext
      console.log('User and discussions updated and saved.');
    }
  };


  const createDiscussion = (title: string): Discussion => {
    if (!currentUser) {
      throw new Error("Impossible de créer une discussion : aucun utilisateur connecté.");
    }

    const newDiscussion: Discussion = {
      id: `disc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, // ID unique
      title: title,
      messages: [],
    };

    const updatedUser: User = {
      ...currentUser,
      discussions: [...currentUser.discussions, newDiscussion],
    };

    updateUserAndSave(updatedUser); // Sauvegarder les changements
    setCurrentDiscussion(newDiscussion); // Définir la nouvelle discussion comme courante
    console.log(`Discussion '${title}' créée pour ${currentUser.pseudo}.`);
    return newDiscussion;
  };

  const deleteDiscussion = (discussionId: string) => {
    if (!currentUser) {
      console.warn("Impossible de supprimer une discussion : aucun utilisateur connecté.");
      return;
    }

    const updatedDiscussions = currentUser.discussions.filter(
      (disc) => disc.id !== discussionId
    );

    const updatedUser: User = {
      ...currentUser,
      discussions: updatedDiscussions,
    };

    updateUserAndSave(updatedUser); // Sauvegarder les changements

    // Si la discussion supprimée était la discussion courante, la réinitialiser
    if (currentDiscussion && currentDiscussion.id === discussionId) {
      setCurrentDiscussion(null);
    }
    console.log(`Discussion ${discussionId} supprimée pour ${currentUser.pseudo}.`);
  };

  const sendMessage = async (discussionId: string, content: string) => {
    if (!currentUser) {
      console.warn("Impossible d'envoyer un message : aucun utilisateur connecté.");
      return;
    }
    if (!content.trim()) {
      console.warn("Impossible d'envoyer un message vide.");
      return;
    }

    const res =await send(content)


    console.log( "reponse ai : " ,res);
    

    const newMessage: Message = {
      sender: "user",
      time: new Date().toISOString(), // Date actuelle en format ISO string
      content: content.trim(),
    };

    const updatedDiscussions = currentUser.discussions.map((disc) => {
      if (disc.id === discussionId) {
        return {
          ...disc,
          messages: [...disc.messages, newMessage],
        };
      }
      return disc;
    });

    const updatedUser: User = {
      ...currentUser,
      discussions: updatedDiscussions,
    };

    updateUserAndSave(updatedUser); // Sauvegarder les changements
    // Si c'est la discussion courante, mettre à jour l'état local
    if (currentDiscussion && currentDiscussion.id === discussionId) {
      setCurrentDiscussion(
        updatedDiscussions.find((disc) => disc.id === discussionId) || null
      );
    }
    console.log(`Message envoyé dans la discussion ${discussionId} par ${currentUser.pseudo}.`);
  };

 

  const contextValue: ChatContextType = {
    currentDiscussion,
    setCurrentDiscussion,
    createDiscussion,
    deleteDiscussion,
    sendMessage,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

// Hook personnalisé pour utiliser le ChatContext
export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat doit être utilisé à l\'intérieur d\'un ChatProvider');
  }
  return context;
};