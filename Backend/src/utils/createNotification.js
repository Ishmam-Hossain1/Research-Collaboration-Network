import Notification from "../models/Notification.js";

const createNotification = async ({
  recipient,
  sender = null,
  title,
  message,
  type = "system",
  link = "",
}) => {
  return await Notification.create({
    recipient,
    sender,
    title,
    message,
    type,
    link,
  });
};

export default createNotification;