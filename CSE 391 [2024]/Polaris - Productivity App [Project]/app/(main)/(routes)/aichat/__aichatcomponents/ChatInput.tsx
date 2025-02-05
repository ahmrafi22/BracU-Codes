import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, PaperclipIcon, XIcon } from "lucide-react";
import Image from "next/image";
import { ChatInputProps } from "@/utils/types";

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
}) => {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = () => {
    onSend(input, image);
    setInput("");
    removeImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    setShowTooltip(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {imagePreview && (
        <div className="fixed z-10 p-4 md:h-40 h-24 md:w-[65vw] w-[75vw] left-1/2 transform -translate-x-1/2 bg-[#282623] rounded-t-3xl border border-[#383933] border-opacity-10 bottom-[14vh]">
          <div className="relative h-full w-44">
            <Image
              src={imagePreview}
              alt="Preview"
              className="object-cover h-full w-full rounded-lg border border-gray-400"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <button onClick={removeImage} className="absolute top-2 left-2 hover:bg-red-500 bg-[#3a3a38] rounded-full p-1 transition-colors duration-200">
              <XIcon color="white" className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 rounded-[12px] bg-white/15 md:w-[70vw] w-[85vw] shadow-[0_10px_10px_rgba(0,0,0,0.3)] backdrop-blur-[4px] border border-white/20 p-6">
        <div className="flex items-center gap-4">
          <div className="flex-grow relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyPress}
              placeholder="Ask Anything..."
              className="pr-10 text-white bg-[#2c2c2a] w-full resize-none placeholder-gray-400 focus:outline-none scrollbar-hide rounded-xl p-4 mb-4 min-h-[60px]"
            />
            <label htmlFor="image-upload" className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer hover:bg-[#2c2b28] p-2 rounded-xl transition-colors">
              <PaperclipIcon color="gray" className="w-5 h-5" />
              <input
                type="file"
                id="image-upload"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          <div onMouseEnter={() => setShowTooltip(true)} onMouseLeave={() => setShowTooltip(false)} className="relative">
            <button
              onClick={handleSend}
              disabled={isLoading || (!input.trim() && !image)}
              className={`p-4 rounded-full mb-4 transition-colors ${
                isLoading || (!input.trim() && !image)
                  ? "bg-gray-500"
                  : "bg-[#ae562f] hover:bg-[#a84b23]"
              }`}
            >
              <ArrowUpIcon color="white" className="w-5 h-5 " />
            </button>
            {showTooltip && (
              <div className="flex items-center justify-center absolute w-32 h-8 -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black text-white text-xs rounded-md shadow-lg">
                {isLoading || (!input.trim() && !image)
                  ? "Message is empty"
                  : "Send message"}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatInput;