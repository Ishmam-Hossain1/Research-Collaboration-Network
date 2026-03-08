// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       trim: true,
//       lowercase: true,
//     },

//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },

//     researchInterests: {
//       type: [String],
//       default: [],
//     },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// export default User;

import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    researchInterests: {
      type: [String],
      default: [],
    },

    // GridFS file reference
    profilePictureId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;