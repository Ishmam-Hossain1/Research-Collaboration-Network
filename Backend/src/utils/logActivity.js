import Activity from "../models/Activity.js";

const logActivity = async (projectId, userId, action) => {
  try {
    await Activity.create({ projectId, userId, action });
  } catch (error) {
    console.error("Error logging activity:", error.message);
  }
};

export default logActivity;