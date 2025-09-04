import axios from "axios";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const GEMINI_API_KEY = "AIzaSyCANKefcI1op4bFlUEZWIqtllGoGZtu1Qg";

export const send = async (mess: string) => {
  try {
    const response = await axios.post(
      GEMINI_URL,
      {
        contents: [
          {
            parts: [
              {
                text: mess,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY!,
        },
      }
    );

    // ✅ Retourne seulement le texte généré
    return (
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ Pas de réponse"
    );
  } catch (error: any) {
    console.error("Erreur API Gemini :", error.response?.data || error.message);
    return "⚠️ Erreur API Gemini";
  }
};
