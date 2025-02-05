import { useState, useEffect } from "react";
import { Message } from "@/utils/types";
import { GoogleGenerativeAI } from "@google/generative-ai";


const api = process.env.NEXT_PUBLIC_APIKEY;
if (!api) {
  console.error("API Key is missing");
}

const genAI = new GoogleGenerativeAI(api || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};



export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatInstance, setChatInstance] = useState<any>(null);

  useEffect(() => {
    const initializeChat = async () => {
      const chat = await model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 2000,
        },
      });
      setChatInstance(chat);
    };

    initializeChat();
  }, []);

  const sendMessage = async (text: string, image: File | null) => {
    if (!text.trim() && !image) return;
    if (!chatInstance && !image) return;

    setIsLoading(true);

    try {
      const userMessageId = Date.now();
      const userMessage: Message = {
        id: userMessageId,
        text,
        user: true,
      };

      if (image) {
        const imagePreview = URL.createObjectURL(image);
        userMessage.image = imagePreview;
      }

      setMessages((prev) => [...prev, userMessage]);

      let response;

      if (image) {
        const imageBase64 = await convertToBase64(image);
        const base64Data = imageBase64.split(",")[1];

        const imagePart = {
          inlineData: {
            mimeType: image.type || "image/jpeg",
            data: base64Data,
          },
        };

        const result = await model.generateContent([text, imagePart]);
        response = await result.response;
      } else {
        const result = await chatInstance.sendMessage(text);
        response = await result.response;
      }

      const aiResponse: Message = {
        id: userMessageId + 1,
        text: response.text(),
        user: false,
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          text: "Sorry, there was an error processing your message.",
          user: false,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    sendMessage,
  };
};
