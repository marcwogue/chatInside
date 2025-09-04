import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert, TextInput, Modal, Pressable } from 'react-native';
import { useUser } from '../../context/userContext'; // Ajustez le chemin si nécessaire
import { useChat } from '../../context/chat'; // Importe useChat
import { router } from 'expo-router'; // Utilisation d'expo-router
import { Discussion } from '../../context/AppType';
import { MotiView } from 'moti';
import { Feather } from '@expo/vector-icons'; // Pour les icônes, assurez-vous d'avoir installé @expo/vector-icons

const HomeScreen: React.FC = () => {
  const { currentUser, disconnect, isLoading } = useUser();
  const { createDiscussion, deleteDiscussion, setCurrentDiscussion } = useChat();
  const [isModalVisible, setModalVisible] = useState(false);
  const [newDiscussionTitle, setNewDiscussionTitle] = useState('');

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-white mt-4 text-lg">Chargement de l'utilisateur...</Text>
      </View>
    );
  }

  // Cette partie ne devrait normalement pas être atteinte si App.tsx fait bien son travail
  // Mais elle reste une sécurité.
  if (!currentUser) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <Text className="text-white text-2xl font-bold mb-4">Bienvenue sur ChatInside !</Text>
        <Text className="text-gray-400 text-lg text-center mb-8">
          Veuillez vous connecter pour commencer à discuter.
        </Text>
        <Pressable
          onPress={() => router.navigate('./seesion')} // Redirige vers AuthScreen si pas connecté
          className='bg-blue-600 rounded-xl py-2 px-4 '
        >
          <Text className='text-white font-semibold'>Se connecter</Text>
        </Pressable>
      </View>
    );
  }

  const handleCreateDiscussion = () => {
    if (!newDiscussionTitle.trim()) {
      Alert.alert("Erreur", "Le titre de la discussion ne peut pas être vide.");
      return;
    }
    const newDisc = createDiscussion(newDiscussionTitle);
    setNewDiscussionTitle('');
    setModalVisible(false);
    setCurrentDiscussion(newDisc); // Définit la nouvelle discussion comme active
    router.push(`./chat/${newDisc.id}`); // Navigue vers l'écran de chat de cette discussion
  };

  const handleDeleteDiscussion = (id: string) => {
    Alert.alert(
      "Supprimer la discussion",
      "Êtes-vous sûr de vouloir supprimer cette discussion ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          onPress: () => {
            deleteDiscussion(id);
            // Si la discussion supprimée était celle active, réinitialiser
            if (router.canGoBack()) { // Une vérification pour expo-router
                // router.goBack(); // Peut-être revenir à Home si on était dans ChatScreen
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderDiscussionItem = ({ item }: { item: Discussion }) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 300 }}
      className="flex-row items-center justify-between bg-gray-700 p-4 rounded-lg mb-3 shadow-md"
    >
      <TouchableOpacity
        className="flex-1"
        onPress={() => {
          setCurrentDiscussion(item); // Définit la discussion comme courante
          router.push(`/chat/${item.id}`); // Navigue vers l'écran de chat
        }}
      >
        <Text className="text-white text-lg font-semibold">{item.title}</Text>
        {item.messages.length > 0 && (
          <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
            {item.messages[item.messages.length - 1].content}
          </Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleDeleteDiscussion(item.id)}
        className="ml-4 p-2"
      >
        <Feather name="trash-2" size={24} color="#EF4444" />
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <View className="flex-1 bg-gray-900 p-4 pt-12">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-white text-3xl font-extrabold">Bonjour, {currentUser.pseudo} !</Text>
        <TouchableOpacity
          className="bg-red-600 p-2 rounded-full active:bg-red-700"
          onPress={disconnect}
        >
          <Feather name="log-out" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text className="text-gray-300 text-xl font-semibold mb-4">Vos Discussions</Text>

      {currentUser.discussions.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-gray-400 text-lg text-center">
            Vous n'avez pas encore de discussions.
          </Text>
          <Text className="text-gray-400 text-lg text-center mb-6">
            Commencez une nouvelle conversation !
          </Text>
        </View>
      ) : (
        <FlatList
          data={currentUser.discussions}
          keyExtractor={(item) => item.id}
          renderItem={renderDiscussionItem}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <TouchableOpacity
        className="bg-blue-600 p-4 rounded-full items-center justify-center mt-6 active:bg-blue-700 shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Text className="text-white font-bold text-lg">Nouvelle Discussion</Text>
      </TouchableOpacity>

      {/* Modal de création de discussion */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <MotiView
            from={{ translateY: 50, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', duration: 300 }}
            className="bg-gray-800 p-6 rounded-lg w-4/5 shadow-xl"
          >
            <Text className="text-white text-2xl font-bold mb-4 text-center">Créer une discussion</Text>
            <TextInput
              className="w-full p-3 bg-gray-700 text-white rounded-md mb-4 placeholder-gray-400"
              placeholder="Titre de la discussion"
              placeholderTextColor="#9ca3af"
              value={newDiscussionTitle}
              onChangeText={setNewDiscussionTitle}
            />
            <TouchableOpacity
              className="bg-blue-600 p-3 rounded-md items-center justify-center mb-3 active:bg-blue-700"
              onPress={handleCreateDiscussion}
            >
              <Text className="text-white font-bold text-lg">Créer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="p-3 items-center"
              onPress={() => setModalVisible(false)}
            >
              <Text className="text-gray-400 text-base">Annuler</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;