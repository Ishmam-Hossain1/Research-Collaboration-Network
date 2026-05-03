// import { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import api from "../lib/api.js";
// import socket from "../lib/socket.js";
// import { useChatSidebar } from "../context/ChatSidebarContext";
// import { X, SendHorizontal } from "lucide-react";

// const ChatWindow = () => {
//   const navigate = useNavigate();

//   const { activeChat, isChatSidebarOpen, setActiveChat } = useChatSidebar();

//   const [messages, setMessages] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [sending, setSending] = useState(false);
//   const [error, setError] = useState("");
//   const [newMessage, setNewMessage] = useState("");

//   const messagesEndRef = useRef(null);

//   const loggedInUser = useMemo(() => {
//     return JSON.parse(localStorage.getItem("researchConnectUser")) || null;
//   }, []);

//   useEffect(() => {
//     if (loggedInUser?.id) {
//       socket.emit("join", loggedInUser.id);
//     }
//   }, [loggedInUser?.id]);

//   useEffect(() => {
//     const handleOnlineUsers = (users) => {
//       setOnlineUsers(users || []);
//     };

//     socket.on("onlineUsers", handleOnlineUsers);

//     return () => {
//       socket.off("onlineUsers", handleOnlineUsers);
//     };
//   }, []);

//   useEffect(() => {
//     const handleReceiveMessage = (message) => {
//       if (message.chatId === activeChat?._id) {
//         setMessages((prev) => {
//           const exists = prev.some((msg) => msg._id === message._id);
//           if (exists) return prev;
//           return [...prev, message];
//         });
//       }
//     };

//     socket.on("receiveMessage", handleReceiveMessage);

//     return () => {
//       socket.off("receiveMessage", handleReceiveMessage);
//     };
//   }, [activeChat?._id]);

//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!activeChat?._id) {
//         setMessages([]);
//         setError("");
//         return;
//       }

//       try {
//         setLoading(true);
//         setError("");

//         const res = await api.get(`/messages/${activeChat._id}`);
//         setMessages(res.data || []);
//       } catch (err) {
//         setError(err?.response?.data?.message || "Failed to load messages.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMessages();
//   }, [activeChat?._id]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   const handleSendMessage = async () => {
//     const trimmed = newMessage.trim();
//     if (!trimmed) return;

//     try {
//       setSending(true);

//       await api.post("/messages", {
//         chatId: activeChat._id,
//         senderId: loggedInUser.id,
//         receiverId: activeChat.otherUser._id,
//         text: trimmed,
//       });

//       setNewMessage("");
//     } catch (err) {
//       setError("Failed to send message.");
//     } finally {
//       setSending(false);
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   const formatTime = (date) => {
//     return new Date(date).toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const isUserOnline = (userId) => {
//     return onlineUsers.includes(userId);
//   };

//   // 🚀 NEW: redirect handler
//   const goToProfile = () => {
//     if (activeChat?.otherUser?._id) {
//       navigate(`/researchers/${activeChat.otherUser._id}`);
//     }
//   };

//   if (!isChatSidebarOpen || !activeChat) return null;

//   const otherUser = activeChat.otherUser;
//   const online = isUserOnline(otherUser?._id);

//   return (
//     <div className="fixed bottom-0 right-[320px] top-[45vh] z-30 hidden w-[420px] rounded-t-3xl border border-b-0 border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md lg:flex lg:flex-col">

//       {/* HEADER */}
//       <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

//         {/* 🚀 CLICKABLE PROFILE */}
//         <div
//           onClick={goToProfile}
//           className="flex cursor-pointer items-center gap-3"
//         >
//           <div className="relative flex h-11 w-11 items-center justify-center">
//             <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border bg-slate-100">
//               {otherUser?.profilePictureId ? (
//                 <img
//                   src={`http://localhost:5000/api/auth/profile-picture/${otherUser.profilePictureId}`}
//                   className="h-full w-full object-cover"
//                 />
//               ) : (
//                 <span className="font-semibold">
//                   {otherUser?.username?.charAt(0).toUpperCase()}
//                 </span>
//               )}
//             </div>

//             {online && (
//               <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
//             )}
//           </div>

//           <div>
//             <h3 className="text-sm font-semibold text-slate-800">
//               {otherUser?.username}
//             </h3>
//             <p className="text-xs text-slate-500">
//               {online ? "Active now" : "Offline"}
//             </p>
//           </div>
//         </div>

//         <button
//           onClick={() => setActiveChat(null)}
//           className="rounded-full p-2 hover:bg-slate-100"
//         >
//           <X size={18} />
//         </button>
//       </div>

//       {/* MESSAGES */}
//       <div className="flex-1 overflow-y-auto px-4 py-4">
//         {messages.map((msg) => {
//           const isOwn =
//             msg.senderId === loggedInUser.id ||
//             msg.senderId?._id === loggedInUser.id;

//           return (
//             <div
//               key={msg._id}
//               className={`mb-2 flex ${
//                 isOwn ? "justify-end" : "justify-start"
//               }`}
//             >
//               <div
//                 className={`max-w-[70%] rounded-2xl px-4 py-2 ${
//                   isOwn
//                     ? "bg-blue-600 text-white"
//                     : "border bg-white text-slate-800"
//                 }`}
//               >
//                 <p>{msg.text}</p>
//                 <span className="text-[10px] opacity-70">
//                   {formatTime(msg.createdAt)}
//                 </span>
//               </div>
//             </div>
//           );
//         })}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* INPUT */}
//       <div className="flex gap-2 border-t p-3">
//         <textarea
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={handleKeyDown}
//           className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm"
//           placeholder="Type message..."
//         />

//         <button
//           onClick={handleSendMessage}
//           disabled={sending}
//           className="rounded-full bg-blue-600 p-2 text-white"
//         >
//           <SendHorizontal size={18} />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api.js";
import socket from "../lib/socket.js";
import { useChatSidebar } from "../context/ChatSidebarContext";
import { X, SendHorizontal } from "lucide-react";

const ChatWindow = () => {
  const navigate = useNavigate();

  const { activeChat, isChatSidebarOpen, setActiveChat } = useChatSidebar();

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const messagesEndRef = useRef(null);

  const loggedInUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("researchConnectUser")) || null;
  }, []);

  // Join socket
  useEffect(() => {
    if (loggedInUser?.id) {
      socket.emit("join", loggedInUser.id);
    }
  }, [loggedInUser?.id]);

  // Online users
  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, []);

  // 🔥 Mark chat as seen when opened
  useEffect(() => {
    const markSeen = async () => {
      if (!activeChat?._id) return;

      try {
        await api.patch(`/chats/${activeChat._id}/seen`);
      } catch (err) {
        console.error("Failed to mark chat as seen:", err);
      }
    };

    markSeen();
  }, [activeChat?._id]);

  // Receive messages (realtime)
  useEffect(() => {
    const handleReceiveMessage = (message) => {
      if (message.chatId === activeChat?._id) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [activeChat?._id]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChat?._id) {
        setMessages([]);
        return;
      }

      try {
        setLoading(true);

        const res = await api.get(`/messages/${activeChat._id}`);
        setMessages(res.data || []);
      } catch (err) {
        setError("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeChat?._id]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Send message
  const handleSendMessage = async () => {
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    try {
      setSending(true);

      await api.post("/messages", {
        chatId: activeChat._id,
        senderId: loggedInUser.id,
        receiverId: activeChat.otherUser._id,
        text: trimmed,
      });

      setNewMessage("");
    } catch (err) {
      setError("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.includes(userId);
  };

  const goToProfile = () => {
    if (activeChat?.otherUser?._id) {
      navigate(`/researcher/${activeChat.otherUser._id}`);
    }
  };

  if (!isChatSidebarOpen || !activeChat) return null;

  const otherUser = activeChat.otherUser;
  const online = isUserOnline(otherUser?._id);

  return (
    <div className="fixed bottom-0 right-[320px] top-[45vh] z-30 hidden w-[420px] rounded-t-3xl border border-b-0 border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md lg:flex lg:flex-col">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b px-5 py-4">

        <div
          onClick={goToProfile}
          className="flex cursor-pointer items-center gap-3"
        >
          <div className="relative h-11 w-11">
            <div className="h-11 w-11 overflow-hidden rounded-full border bg-slate-100">
              {otherUser?.profilePictureId ? (
                <img
                  src={`${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/profile-picture/${otherUser.profilePictureId}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-semibold">
                  {otherUser?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold">{otherUser?.username}</h3>
            <p className="text-xs text-slate-500">
              {online ? "Active now" : "Offline"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveChat(null)}
          className="rounded-full p-2 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.map((msg) => {
          const isOwn =
            msg.senderId === loggedInUser.id ||
            msg.senderId?._id === loggedInUser.id;

          return (
            <div
              key={msg._id}
              className={`mb-2 flex ${
                isOwn ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                  isOwn
                    ? "bg-blue-600 text-white"
                    : "border bg-white text-slate-800"
                }`}
              >
                <p>{msg.text}</p>
                <span className="text-[10px] opacity-70">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="flex gap-2 border-t p-3">
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm"
          placeholder="Type message..."
        />

        <button
          onClick={handleSendMessage}
          disabled={sending}
          className="rounded-full bg-blue-600 p-2 text-white"
        >
          <SendHorizontal size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;