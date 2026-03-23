// import mongoose from "mongoose";

// const chatSchema = new mongoose.Schema(
//   {
//     members: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "User",
//         required: true,
//       },
//     ],

//     messageList: [
//       {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: "Message",
//       },
//     ],
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Chat", chatSchema);

import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    messageList: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    seenBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        lastSeenAt: {
          type: Date,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);