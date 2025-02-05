"use client";
import React from "react";
import { useChat } from "@/hooks/useChat";
import { ImageUpIcon, Text, Brain, Code, Languages, BookOpen } from "lucide-react";
import ChatInput from "./ChatInput";
import Header from "./Header";
import ChatMessages from "./ChatMesage";
import { motion } from "framer-motion";

const ChatScreen = () => {
  const { messages, isLoading, sendMessage } = useChat();

  const greetingVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex flex-col h-screen bg-[#2c2b28] text-white relative md:px-[15vw]">
      <Header />
      <div
        className={`flex-grow overflow-y-auto p-4 relative scrollbar-hide mt-8`}
      >
        {messages.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
           <motion.div
             variants={greetingVariants}
             initial="hidden"
             animate="visible"
             className="text-center max-w-3xl mx-auto mt-8 mb-12"
           >
               <h1 className="text-4xl mb-6">What you can do </h1>
               <div className="space-y-8 p-6  rounded-xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
                     <ImageUpIcon className="text-blue-500 w-7 h-7  shrink-0" />
                     <span className="text-gray-200 text-lg">Upload and analyze images</span>
                   </div>
                   <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
                     <Text className="text-green-500 w-7 h-7  shrink-0" />
                     <span className="text-gray-200 text-lg">Summarize any text content</span>
                   </div>
                   <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
                     <Brain className="text-purple-500 w-7 h-7  shrink-0" />
                     <span className="text-gray-200 text-lg">Get creative writing help</span>
                   </div>
                   <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
                     <Code className="text-red-500 w-7 h-7  shrink-0" />
                     <span className="text-gray-200 text-lg">Debug and write code</span>
                   </div>
                   <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
                     <BookOpen className="text-orange-500 w-7 h-7  shrink-0" />
                     <span className="text-gray-200 text-lg">Research and learn</span>
                   </div>
                   <div className="flex items-center space-x-4 p-4 hover:bg-gray-800/50 rounded-lg transition-colors">
                     <Languages className="text-yellow-500 w-7 h-7  shrink-0" />
                     <span className="text-gray-200 text-lg ">Translate to another language</span>
                   </div>
                 </div>
               </div>
           </motion.div>
          </div>
        ) : (
          <ChatMessages messages={messages} isLoading={isLoading} />
        )}
      </div>
      <ChatInput
        onSend={sendMessage}
        isLoading={isLoading}
        messagesExist={messages.length > 0}
      />
    </div>
  );
};

export default ChatScreen;
