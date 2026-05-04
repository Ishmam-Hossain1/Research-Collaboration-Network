
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


import { createContext, useContext, useEffect, useMemo, useState } from "react";
import socket from "../lib/socket.js";

const ChatSidebarContext = createContext(null);

export const ChatSidebarProvider = ({ children }) => {
  const [isChatSidebarOpen, setIsChatSidebarOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  const loggedInUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("researchConnectUser")) || null;
  }, []);

  useEffect(() => {
    if (loggedInUser?.id) {
      socket.emit("join", loggedInUser.id);
    }
  }, [loggedInUser?.id]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const senderId =
        typeof message.senderId === "object"
          ? message.senderId?._id
          : message.senderId;

      const isIncoming = senderId !== loggedInUser?.id;

      if (isIncoming && !isChatSidebarOpen) {
        setUnreadMessageCount((prev) => prev + 1);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [loggedInUser?.id, isChatSidebarOpen]);

  const openChatSidebar = () => {
    setIsChatSidebarOpen(true);
    setUnreadMessageCount(0);
  };

  const closeChatSidebar = () => {
    setIsChatSidebarOpen(false);
    setActiveChat(null);
  };

  const toggleChatSidebar = () => {
    setIsChatSidebarOpen((prev) => {
      const next = !prev;

      if (next) {
        setUnreadMessageCount(0);
      }

      return next;
    });
  };

  const resetUnreadMessageCount = () => {
    setUnreadMessageCount(0);
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
      unreadMessageCount,
      setUnreadMessageCount,
      resetUnreadMessageCount,
    }),
    [isChatSidebarOpen, activeChat, unreadMessageCount]
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
