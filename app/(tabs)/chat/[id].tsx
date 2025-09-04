import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router'; // Pour récupérer l'ID de la discussion
import { useChat } from '../../../context/chat';
import { useUser } from '../../../context/userContext';
import { Message, Discussion } from '../../../context/AppType'; // Assurez-vous que le chemin est correct
import { Feather } from '@expo/vector-icons';
import { MotiView } from 'moti';

const ChatScreen: React.FC = () => {
  const { id } = useLocalSearchParams(); // Récupère l'ID de la discussion de l'URL
  const discussionId = Array.isArray(id) ? id[0] : id; // Gère le cas où 'id' est un tableau
  const { currentUser } = useUser();
  const { currentDiscussion, setCurrentDiscussion, sendMessage } = useChat();
  const [messageInput, setMessageInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  // Rechercher la discussion si elle n'est pas déjà dans currentDiscussion ou si l'ID change
  useEffect(() => {
    if (currentUser && discussionId) {
      const foundDiscussion = currentUser.discussions.find(d => d.id === discussionId);
      if (foundDiscussion) {
        setCurrentDiscussion(foundDiscussion);
      } else {
        // Gérer le cas où la discussion n'est pas trouvée (ex: rediriger vers Home)
        console.warn(`Discussion avec l'ID ${discussionId} non trouvée. Redirection vers Home.`);
        console.log(currentUser.discussions);
        
        router.navigate('/'); // Assurez-vous que '/home' est la route de votre HomeScreen
      }
    }
  }, [currentUser, discussionId, setCurrentDiscussion]);

  // Scroll automatique vers le bas quand de nouveaux messages arrivent
  useEffect(() => {
    if (currentDiscussion?.messages.length) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [currentDiscussion?.messages.length]);

  const handleSendMessage = () => {
    if (messageInput.trim() && currentDiscussion) {
      sendMessage(currentDiscussion.id, messageInput.trim());
      setMessageInput('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const messageTime = new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <MotiView
        from={{ opacity: 0, translateY: isUser ? 20 : -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 300 }}
        className={`flex-row items-end mb-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <View className={`p-3 rounded-lg max-w-[80%] ${isUser ? 'bg-blue-600 self-end' : 'bg-gray-700 self-start'}`}>
          <Text className="text-white text-base">{item.content}</Text>
          <Text className={`text-xs mt-1 ${isUser ? 'text-blue-200' : 'text-gray-400'} text-right`}>
            {messageTime}
          </Text>
        </View>
      </MotiView>
    );
  };

  if (!currentDiscussion) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-900">
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text className="text-white mt-4 text-lg">Chargement de la discussion...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <View className="flex-row items-center p-4 bg-gray-800 border-b border-gray-700">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Feather name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1">{currentDiscussion.title}</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <FlatList
          ref={flatListRef}
          data={currentDiscussion.messages}
          keyExtractor={(item, index) => `${item.time}-${index}`} // Utilise temps + index comme clé unique
          renderItem={renderMessage}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 }}
        />

        <View className="flex-row items-center p-4 bg-gray-800 border-t border-gray-700">
          <TextInput
            className="flex-1 p-3 bg-gray-700 text-white rounded-full mr-3 placeholder-gray-400"
            placeholder="Écrire un message..."
            placeholderTextColor="#9ca3af"
            value={messageInput}
            onChangeText={setMessageInput}
            onSubmitEditing={handleSendMessage} // Permet d'envoyer en appuyant sur "Entrée"
          />
          <TouchableOpacity
            className="bg-blue-600 p-3 rounded-full active:bg-blue-700"
            onPress={handleSendMessage}
            disabled={!messageInput.trim()}
          >
            <Feather name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;