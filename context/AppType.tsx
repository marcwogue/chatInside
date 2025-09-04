export interface Message {
    sender: "user" | "bot";
    time: string; // Stocker la date comme une string ISO pour AsyncStorage
    content: string;
  }
  
  export interface Discussion {
    id: string;
    title: string;
    messages: Message[];
  }
  
  export interface User {
    login: string;
    password: string; // Pour l'MVP, pas de cryptage
    pseudo: string;
    discussions: Discussion[]; // Les discussions sont attachées à l'utilisateur
  }