import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      select: false,
    },

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = model("User", userSchema);

export default User;
