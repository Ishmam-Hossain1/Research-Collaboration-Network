import { io } from "socket.io-client";

<<<<<<< HEAD
const socket = io(`${import.meta.env.VITE_BACKEND_BASEURL}`, {
=======
const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000", {
>>>>>>> 2b64cadba04286aafacfde64e93575934ff6c993
  autoConnect: true,
});

export default socket;