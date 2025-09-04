import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { MotiView } from 'moti'; // Pour les animations
import { useUser } from '../../context/userContext';
import { useRouter } from 'expo-router';

// Définissez le type de votre pile de navigation.
// Pour l'MVP, nous aurons une pile simple: Auth, Home

// Type pour la prop de navigation

const AuthScreen: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true); // true pour login, false pour signin
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [pseudoInput, setPseudoInput] = useState('');

  const { login, signin, isLoading } = useUser();
   // Hook de navigation

   const router = useRouter()
  const handleAuth = async () => {
    if (!loginInput || !passwordInput || (!isLogin && !pseudoInput)) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs.");
      return;
    }

    let success = false;
    if (isLogin) {
      success = await login(loginInput, passwordInput);
      if (!success) {
        Alert.alert("Erreur de connexion", "Login ou mot de passe incorrect.");
      }
    } else {
      success = await signin(loginInput, passwordInput, pseudoInput);
      if (!success) {
        Alert.alert("Erreur d'inscription", "Ce login est déjà utilisé ou une erreur est survenue.");
      }
    }

    if (success) {
      // Naviguer vers l'écran Home après une connexion/inscription réussie
      router.navigate('/'); // replace pour ne pas pouvoir revenir à l'AuthScreen
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-gray-900 p-4">
      <MotiView
        from={{ translateY: -50, opacity: 0 }}
        animate={{ translateY: 0, opacity: 1 }}
        transition={{ type: 'timing', duration: 500 }}
        className="w-full max-w-sm p-6 bg-gray-800 rounded-lg shadow-lg"
      >
        <Text className="text-white text-3xl font-bold mb-6 text-center">
          {isLogin ? "Se connecter" : "S'inscrire"}
        </Text>

        {!isLogin && (
          <MotiView
            from={{ translateY: -20, opacity: 0 }}
            animate={{ translateY: 0, opacity: 1 }}
            transition={{ type: 'timing', duration: 300, delay: 100 }}
            className="mb-4"
          >
            <TextInput
              className="w-full p-3 bg-gray-700 text-white rounded-md placeholder-gray-400"
              placeholder="Pseudo"
              placeholderTextColor="#9ca3af"
              value={pseudoInput}
              onChangeText={setPseudoInput}
            />
          </MotiView>
        )}

        <TextInput
          className="w-full p-3 bg-gray-700 text-white rounded-md mb-4 placeholder-gray-400"
          placeholder="Login"
          placeholderTextColor="#9ca3af"
          value={loginInput}
          onChangeText={setLoginInput}
          autoCapitalize="none"
        />

        <TextInput
          className="w-full p-3 bg-gray-700 text-white rounded-md mb-6 placeholder-gray-400"
          placeholder="Mot de passe"
          placeholderTextColor="#9ca3af"
          secureTextEntry
          value={passwordInput}
          onChangeText={setPasswordInput}
        />

        <TouchableOpacity
          className="w-full bg-blue-600 p-3 rounded-md items-center justify-center mb-4 active:bg-blue-700"
          onPress={handleAuth}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text className="text-white font-bold text-lg">Chargement...</Text>
          ) : (
            <Text className="text-white font-bold text-lg">
              {isLogin ? "Connexion" : "S'inscrire"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full p-3 items-center"
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text className="text-blue-400 text-base">
            {isLogin ? "Pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </Text>
        </TouchableOpacity>
      </MotiView>
    </View>
  );
};

export default AuthScreen;