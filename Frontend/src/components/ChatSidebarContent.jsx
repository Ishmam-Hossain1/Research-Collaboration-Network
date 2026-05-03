
// import { useEffect, useMemo, useState } from "react";
// import { Search, X } from "lucide-react";
// import api from "../lib/api.js";
// import socket from "../lib/socket.js";
// import { useChatSidebar } from "../context/ChatSidebarContext";

// const ChatSidebarContent = () => {
//   const [chats, setChats] = useState([]);
//   const [onlineUsers, setOnlineUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchedUsers, setSearchedUsers] = useState([]);
//   const [searchLoading, setSearchLoading] = useState(false);
//   const [searchError, setSearchError] = useState("");

//   const { setActiveChat, activeChat, isChatSidebarOpen } = useChatSidebar();

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

//   const fetchChats = async () => {
//     try {
//       setLoading(true);
//       setError("");

//       const res = await api.get("/chats/my-chats");
//       setChats(res.data || []);
//     } catch (err) {
//       setError(err?.response?.data?.message || "Failed to load chats.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isChatSidebarOpen) {
//       fetchChats();
//     }
//   }, [isChatSidebarOpen]);

//   useEffect(() => {
//     const handleReceiveMessage = (message) => {
//       const senderId =
//         typeof message.senderId === "object"
//           ? message.senderId?._id
//           : message.senderId;

//       const previewPrefix = senderId === loggedInUser?.id ? "You: " : "";

//       setChats((prevChats) => {
//         const updatedChats = prevChats.map((chat) => {
//           if (chat._id === message.chatId) {
//             const isIncoming = senderId !== loggedInUser?.id;

//             return {
//               ...chat,
//               lastMessageText: `${previewPrefix}${message.text}`,
//               lastMessageAt: message.createdAt,
//               messageList: chat.messageList
//                 ? [...chat.messageList, message]
//                 : [message],
//               isUnseen: isIncoming ? true : false,
//             };
//           }
//           return chat;
//         });

//         updatedChats.sort((a, b) => {
//           const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
//           const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
//           return bTime - aTime;
//         });

//         return updatedChats;
//       });
//     };

//     socket.on("receiveMessage", handleReceiveMessage);

//     return () => {
//       socket.off("receiveMessage", handleReceiveMessage);
//     };
//   }, [loggedInUser?.id]);

//   useEffect(() => {
//     const runSearch = async () => {
//       if (!searchTerm.trim()) {
//         setSearchedUsers([]);
//         setSearchError("");
//         return;
//       }

//       try {
//         setSearchLoading(true);
//         setSearchError("");

//         const res = await api.get("/users", {
//           params: {
//             search: searchTerm.trim(),
//             excludeUserId: loggedInUser?.id || "",
//           },
//         });

//         setSearchedUsers(res.data?.researchers || []);
//       } catch (err) {
//         setSearchError(err?.response?.data?.message || "Failed to search users.");
//         setSearchedUsers([]);
//       } finally {
//         setSearchLoading(false);
//       }
//     };

//     const timeout = setTimeout(runSearch, 300);
//     return () => clearTimeout(timeout);
//   }, [searchTerm, loggedInUser?.id]);

//   const getProfilePicture = (user) => {
//     if (!user?.profilePictureId) return null;
//     return `http://localhost:5000/api/auth/profile-picture/${user.profilePictureId}`;
//   };

//   const formatSidebarTimestamp = (dateString) => {
//     if (!dateString) return "";

//     const messageDate = new Date(dateString);
//     const now = new Date();

//     const diffMs = now - messageDate;
//     const oneDayMs = 24 * 60 * 60 * 1000;
//     const oneWeekMs = 7 * oneDayMs;

//     if (diffMs < oneDayMs) {
//       return messageDate.toLocaleTimeString([], {
//         hour: "numeric",
//         minute: "2-digit",
//       });
//     }

//     if (diffMs < oneWeekMs) {
//       return messageDate.toLocaleDateString([], {
//         weekday: "short",
//       });
//     }

//     const sameYear = messageDate.getFullYear() === now.getFullYear();

//     if (sameYear) {
//       return messageDate.toLocaleDateString([], {
//         day: "numeric",
//         month: "short",
//       });
//     }

//     return messageDate.toLocaleDateString([], {
//       day: "numeric",
//       month: "short",
//       year: "numeric",
//     });
//   };

//   const isUserOnline = (userId) => {
//     if (!userId) return false;
//     return onlineUsers.includes(userId);
//   };

//   const handleUserSelect = async (user) => {
//     if (!loggedInUser?.id || !user?._id) return;

//     try {
//       const res = await api.post("/chats", {
//         senderId: loggedInUser.id,
//         receiverId: user._id,
//       });

//       const returned = res.data?.chat ? res.data.chat : res.data;

//       const existingChat = chats.find((chat) => {
//         const otherId = chat?.otherUser?._id;
//         return otherId === user._id;
//       });

//       const selectedChat =
//         existingChat || {
//           ...returned,
//           otherUser: user,
//           lastMessageText:
//             returned?.messageList?.length > 0
//               ? returned.messageList[returned.messageList.length - 1]?.text
//               : "No messages yet",
//           lastMessageAt:
//             returned?.messageList?.length > 0
//               ? returned.messageList[returned.messageList.length - 1]?.createdAt
//               : null,
//           isUnseen: false,
//         };

//       if (!existingChat) {
//         setChats((prev) => {
//           const alreadyExists = prev.some((chat) => chat._id === selectedChat._id);
//           if (alreadyExists) return prev;
//           return [selectedChat, ...prev];
//         });
//       }

//       setActiveChat(selectedChat);
//       setSearchTerm("");
//       setSearchedUsers([]);
//       setSearchError("");

//       if (selectedChat?._id) {
//         await api.patch(`/chats/${selectedChat._id}/seen`);

//         setChats((prevChats) =>
//           prevChats.map((chat) =>
//             chat._id === selectedChat._id
//               ? { ...chat, isUnseen: false }
//               : chat
//           )
//         );
//       }
//     } catch (err) {
//       setSearchError(err?.response?.data?.message || "Failed to open chat.");
//     }
//   };

//   const handleChatClick = async (chat) => {
//     setActiveChat(chat);

//     try {
//       await api.patch(`/chats/${chat._id}/seen`);

//       setChats((prevChats) =>
//         prevChats.map((item) =>
//           item._id === chat._id ? { ...item, isUnseen: false } : item
//         )
//       );
//     } catch (err) {
//       console.error("Failed to mark chat as seen:", err);
//     }
//   };

//   const shouldShowSearchResults = searchTerm.trim().length > 0;

//   return (
//     <div className="flex h-full flex-col bg-white/95">
//       <div className="border-b border-slate-200 px-4 py-4">
//         <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
//           Communication
//         </p>
//         <h2 className="mt-1 text-lg font-bold text-slate-800">Messages</h2>

//         <div className="mt-3">
//           <div className="relative">
//             <Search
//               size={16}
//               className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
//             />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder="Search users..."
//               className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
//             />
//             {searchTerm && (
//               <button
//                 type="button"
//                 onClick={() => {
//                   setSearchTerm("");
//                   setSearchedUsers([]);
//                   setSearchError("");
//                 }}
//                 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
//               >
//                 <X size={16} />
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       <div className="flex-1 overflow-y-auto px-3 py-4">
//         {shouldShowSearchResults ? (
//           <div>
//             {searchLoading ? (
//               <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
//                 Searching users...
//               </div>
//             ) : searchError ? (
//               <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//                 {searchError}
//               </div>
//             ) : searchedUsers.length === 0 ? (
//               <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
//                 No users found.
//               </div>
//             ) : (
//               <div className="space-y-2">
//                 {searchedUsers.map((user) => {
//                   const profilePictureUrl = getProfilePicture(user);
//                   const online = isUserOnline(user?._id);

//                   return (
//                     <button
//                       key={user._id}
//                       onClick={() => handleUserSelect(user)}
//                       className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
//                     >
//                       <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-visible">
//                         <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
//                           {profilePictureUrl ? (
//                             <img
//                               src={profilePictureUrl}
//                               alt={user?.username || "User"}
//                               className="h-full w-full object-cover"
//                             />
//                           ) : (
//                             <span className="text-sm font-semibold text-slate-600">
//                               {user?.username?.charAt(0)?.toUpperCase() || "U"}
//                             </span>
//                           )}
//                         </div>

//                         {online && (
//                           <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
//                         )}
//                       </div>

//                       <div className="min-w-0 flex-1">
//                         <p className="truncate text-sm font-semibold text-slate-800">
//                           {user?.username || "Unknown User"}
//                         </p>
//                         <p className="truncate text-xs text-slate-500">
//                           {user?.email || "Start a new conversation"}
//                         </p>
//                       </div>
//                     </button>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         ) : loading ? (
//           <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
//             Loading chats...
//           </div>
//         ) : error ? (
//           <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
//             {error}
//           </div>
//         ) : chats.length === 0 ? (
//           <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
//             No chats found.
//           </div>
//         ) : (
//           <div className="space-y-2">
//             {chats.map((chat) => {
//               const otherUser = chat.otherUser;
//               const profilePictureUrl = getProfilePicture(otherUser);
//               const isActive = activeChat?._id === chat._id;
//               const online = isUserOnline(otherUser?._id);
//               const unseen = chat.isUnseen;

//               return (
//                 <button
//                   key={chat._id}
//                   onClick={() => handleChatClick(chat)}
//                   className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left shadow-sm transition ${
//                     isActive
//                       ? "border-blue-300 bg-blue-50"
//                       : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50"
//                   }`}
//                 >
//                   <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-visible">
//                     <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
//                       {profilePictureUrl ? (
//                         <img
//                           src={profilePictureUrl}
//                           alt={otherUser?.username || "User"}
//                           className="h-full w-full object-cover"
//                         />
//                       ) : (
//                         <span className="text-sm font-semibold text-slate-600">
//                           {otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
//                         </span>
//                       )}
//                     </div>

//                     {online && (
//                       <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
//                     )}
//                   </div>

//                   <div className="min-w-0 flex-1">
//                     <div className="flex items-start justify-between gap-2">
//                       <p
//                         className={`truncate text-sm ${
//                           unseen
//                             ? "font-bold text-slate-900"
//                             : "font-semibold text-slate-800"
//                         }`}
//                       >
//                         {otherUser?.username || "Unknown User"}
//                       </p>

//                       <span
//                         className={`shrink-0 text-[11px] ${
//                           unseen ? "font-semibold text-slate-700" : "text-slate-400"
//                         }`}
//                       >
//                         {formatSidebarTimestamp(chat?.lastMessageAt)}
//                       </span>
//                     </div>

//                     <p
//                       className={`truncate text-xs ${
//                         unseen ? "font-semibold text-slate-700" : "text-slate-500"
//                       }`}
//                     >
//                       {chat?.lastMessageText || "No messages yet"}
//                     </p>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatSidebarContent;


import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import api from "../lib/api.js";
import socket from "../lib/socket.js";
import { useChatSidebar } from "../context/ChatSidebarContext";

const ChatSidebarContent = () => {
  const [chats, setChats] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [searchedUsers, setSearchedUsers] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const { setActiveChat, activeChat, isChatSidebarOpen } = useChatSidebar();

  const loggedInUser = useMemo(() => {
    return JSON.parse(localStorage.getItem("researchConnectUser")) || null;
  }, []);

  useEffect(() => {
    if (loggedInUser?.id) {
      socket.emit("join", loggedInUser.id);
    }
  }, [loggedInUser?.id]);

  useEffect(() => {
    const handleOnlineUsers = (users) => {
      setOnlineUsers(users || []);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => {
      socket.off("onlineUsers", handleOnlineUsers);
    };
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/chats/my-chats");
      setChats(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load chats.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isChatSidebarOpen) {
      fetchChats();
    }
  }, [isChatSidebarOpen]);

  useEffect(() => {
    const handleReceiveMessage = (message) => {
      const senderId =
        typeof message.senderId === "object"
          ? message.senderId?._id
          : message.senderId;

      const previewPrefix = senderId === loggedInUser?.id ? "You: " : "";
      const isIncoming = senderId !== loggedInUser?.id;
      const isCurrentChatOpen =
        isChatSidebarOpen && activeChat?._id === message.chatId;

      setChats((prevChats) => {
        const updatedChats = prevChats.map((chat) => {
          if (chat._id === message.chatId) {
            return {
              ...chat,
              lastMessageText: `${previewPrefix}${message.text}`,
              lastMessageAt: message.createdAt,
              messageList: chat.messageList
                ? [...chat.messageList, message]
                : [message],
              isUnseen: isCurrentChatOpen ? false : isIncoming,
            };
          }
          return chat;
        });

        updatedChats.sort((a, b) => {
          const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
          const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
          return bTime - aTime;
        });

        return updatedChats;
      });

      if (isCurrentChatOpen) {
        api.patch(`/chats/${message.chatId}/seen`).catch((err) => {
          console.error("Auto-seen failed:", err);
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [loggedInUser?.id, activeChat?._id, isChatSidebarOpen]);

  useEffect(() => {
    const runSearch = async () => {
      if (!searchTerm.trim()) {
        setSearchedUsers([]);
        setSearchError("");
        return;
      }

      try {
        setSearchLoading(true);
        setSearchError("");

        const res = await api.get("/users", {
          params: {
            search: searchTerm.trim(),
            excludeUserId: loggedInUser?.id || "",
          },
        });

        setSearchedUsers(res.data?.researchers || []);
      } catch (err) {
        setSearchError(err?.response?.data?.message || "Failed to search users.");
        setSearchedUsers([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeout = setTimeout(runSearch, 300);
    return () => clearTimeout(timeout);
  }, [searchTerm, loggedInUser?.id]);

  const getProfilePicture = (user) => {
    if (!user?.profilePictureId) return null;
    return `${import.meta.env.VITE_BACKEND_BASEURL}/api/auth/profile-picture/${user.profilePictureId}`;
  };

  const formatSidebarTimestamp = (dateString) => {
    if (!dateString) return "";

    const messageDate = new Date(dateString);
    const now = new Date();

    const diffMs = now - messageDate;
    const oneDayMs = 24 * 60 * 60 * 1000;
    const oneWeekMs = 7 * oneDayMs;

    if (diffMs < oneDayMs) {
      return messageDate.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (diffMs < oneWeekMs) {
      return messageDate.toLocaleDateString([], {
        weekday: "short",
      });
    }

    const sameYear = messageDate.getFullYear() === now.getFullYear();

    if (sameYear) {
      return messageDate.toLocaleDateString([], {
        day: "numeric",
        month: "short",
      });
    }

    return messageDate.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const isUserOnline = (userId) => {
    if (!userId) return false;
    return onlineUsers.includes(userId);
  };

  const handleUserSelect = async (user) => {
    if (!loggedInUser?.id || !user?._id) return;

    try {
      const res = await api.post("/chats", {
        senderId: loggedInUser.id,
        receiverId: user._id,
      });

      const returned = res.data?.chat ? res.data.chat : res.data;

      const existingChat = chats.find((chat) => {
        const otherId = chat?.otherUser?._id;
        return otherId === user._id;
      });

      const selectedChat =
        existingChat || {
          ...returned,
          otherUser: user,
          lastMessageText:
            returned?.messageList?.length > 0
              ? returned.messageList[returned.messageList.length - 1]?.text
              : "No messages yet",
          lastMessageAt:
            returned?.messageList?.length > 0
              ? returned.messageList[returned.messageList.length - 1]?.createdAt
              : null,
          isUnseen: false,
        };

      if (!existingChat) {
        setChats((prev) => {
          const alreadyExists = prev.some((chat) => chat._id === selectedChat._id);
          if (alreadyExists) return prev;
          return [selectedChat, ...prev];
        });
      }

      setActiveChat(selectedChat);
      setSearchTerm("");
      setSearchedUsers([]);
      setSearchError("");

      if (selectedChat?._id) {
        await api.patch(`/chats/${selectedChat._id}/seen`);

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat._id === selectedChat._id
              ? { ...chat, isUnseen: false }
              : chat
          )
        );
      }
    } catch (err) {
      setSearchError(err?.response?.data?.message || "Failed to open chat.");
    }
  };

  const handleChatClick = async (chat) => {
    setActiveChat(chat);

    try {
      await api.patch(`/chats/${chat._id}/seen`);

      setChats((prevChats) =>
        prevChats.map((item) =>
          item._id === chat._id ? { ...item, isUnseen: false } : item
        )
      );
    } catch (err) {
      console.error("Failed to mark chat as seen:", err);
    }
  };

  const shouldShowSearchResults = searchTerm.trim().length > 0;

  return (
    <div className="flex h-full flex-col bg-white/95">
      <div className="border-b border-slate-200 px-4 py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
          Communication
        </p>
        <h2 className="mt-1 text-lg font-bold text-slate-800">Messages</h2>

        <div className="mt-3">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSearchedUsers([]);
                  setSearchError("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        {shouldShowSearchResults ? (
          <div>
            {searchLoading ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                Searching users...
              </div>
            ) : searchError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {searchError}
              </div>
            ) : searchedUsers.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                No users found.
              </div>
            ) : (
              <div className="space-y-2">
                {searchedUsers.map((user) => {
                  const profilePictureUrl = getProfilePicture(user);
                  const online = isUserOnline(user?._id);

                  return (
                    <button
                      key={user._id}
                      onClick={() => handleUserSelect(user)}
                      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
                    >
                      <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-visible">
                        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                          {profilePictureUrl ? (
                            <img
                              src={profilePictureUrl}
                              alt={user?.username || "User"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-slate-600">
                              {user?.username?.charAt(0)?.toUpperCase() || "U"}
                            </span>
                          )}
                        </div>

                        {online && (
                          <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {user?.username || "Unknown User"}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user?.email || "Start a new conversation"}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : loading ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Loading chats...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : chats.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No chats found.
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => {
              const otherUser = chat.otherUser;
              const profilePictureUrl = getProfilePicture(otherUser);
              const isActive = activeChat?._id === chat._id;
              const online = isUserOnline(otherUser?._id);
              const unseen = chat.isUnseen;

              return (
                <button
                  key={chat._id}
                  onClick={() => handleChatClick(chat)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left shadow-sm transition ${
                    isActive
                      ? "border-blue-300 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-visible">
                    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                      {profilePictureUrl ? (
                        <img
                          src={profilePictureUrl}
                          alt={otherUser?.username || "User"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-slate-600">
                          {otherUser?.username?.charAt(0)?.toUpperCase() || "U"}
                        </span>
                      )}
                    </div>

                    {online && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`truncate text-sm ${
                          unseen
                            ? "font-bold text-slate-900"
                            : "font-semibold text-slate-800"
                        }`}
                      >
                        {otherUser?.username || "Unknown User"}
                      </p>

                      <span
                        className={`shrink-0 text-[11px] ${
                          unseen ? "font-semibold text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {formatSidebarTimestamp(chat?.lastMessageAt)}
                      </span>
                    </div>

                    <p
                      className={`truncate text-xs ${
                        unseen ? "font-semibold text-slate-700" : "text-slate-500"
                      }`}
                    >
                      {chat?.lastMessageText || "No messages yet"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebarContent;