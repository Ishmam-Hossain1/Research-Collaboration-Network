// import { createContext, useContext, useMemo, useState } from "react";

// const ChatSidebarContext = createContext(null);

// export const ChatSidebarProvider = ({ children }) => {
//   const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
//   const [activeChat, setActiveChat] = useState(null);

//   const openChatSidebar = () => {
//     setIsChatSidebarOpen(true);
//   };

//   const closeChatSidebar = () => {
//     setIsChatSidebarOpen(false);
//     setActiveChat(null);
//   };

//   const toggleChatSidebar = () => {
//     setIsChatSidebarOpen((prev) => !prev);
//   };

//   const value = useMemo(
//     () => ({
//       isChatSidebarOpen,
//       setIsChatSidebarOpen,
//       openChatSidebar,
//       closeChatSidebar,
//       toggleChatSidebar,
//       activeChat,
//       setActiveChat,
//     }),
//     [isChatSidebarOpen, activeChat]
//   );

//   return (
//     <ChatSidebarContext.Provider value={value}>
//       {children}
//     </ChatSidebarContext.Provider>
//   );
// };

// export const useChatSidebar = () => {
//   const context = useContext(ChatSidebarContext);

//   if (!context) {
//     throw new Error(
//       "useChatSidebar must be used within a ChatSidebarProvider"
//     );
//   }

//   return context;
// };


import { createContext, useContext, useMemo, useState } from "react";

const ChatSidebarContext = createContext(null);

export const ChatSidebarProvider = ({ children }) => {
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);

  const openChatSidebar = () => {
    setIsChatSidebarOpen(true);
  };

  const closeChatSidebar = () => {
    setIsChatSidebarOpen(false);
    setActiveChat(null);
  };

  const toggleChatSidebar = () => {
    setIsChatSidebarOpen((prev) => !prev);
  };

  const value = useMemo(
    () => ({
      isChatSidebarOpen,
      setIsChatSidebarOpen,
      openChatSidebar,
      closeChatSidebar,
      toggleChatSidebar,
      activeChat,
      setActiveChat,
    }),
    [isChatSidebarOpen, activeChat]
  );

  return (
    <ChatSidebarContext.Provider value={value}>
      {children}
    </ChatSidebarContext.Provider>
  );
};

export const useChatSidebar = () => {
  const context = useContext(ChatSidebarContext);

  if (!context) {
    throw new Error(
      "useChatSidebar must be used within a ChatSidebarProvider"
    );
  }

  return context;
};