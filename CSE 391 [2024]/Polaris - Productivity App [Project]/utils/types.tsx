export interface Message {
    id: string | number;
    text?: string;
    image?: string;
    user: boolean;
  }
  
  export interface ChatInputProps {
    onSend: (text: string, image: File | null) => void;
    isLoading: boolean;
    messagesExist?: boolean;
  }
  
  export interface ChatMessagesProps {
    messages: Message[];
    isLoading: boolean;
  }
  
  export interface ImagePreviewProps {
    imagePreview: string | null;
    onRemove: () => void;
    messagesExist: boolean;
  }
  