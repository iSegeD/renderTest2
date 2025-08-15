import bcrypt from "bcrypt";
import User from "../models/userModel.js";

import { httpError } from "../utils/httpErrorHelper.js";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ================= GET USERS =================
// GET: api/users/authors
// UNPROTECTED
const getUsers = async (req, res) => {
  const users = await User.find({});

  res.status(200).json(users);
};

// ================= GET USER =================
// GET: api/users/:id
// UNPROTECTED
const getUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    httpError("User not found", 404);
  }

  res.status(200).json(user);
};

// ================= CHANGE USER AVATAR =================
// POST: api/users/change-avatar
// PROTECTED
const changeAvatar = async (req, res) => {
  const file = req.file;

  if (!file) {
    httpError("Please upload a profile avatar", 400);
  }

  if (file.size > 500 * 1024) {
    httpError("Profile picture is too large. Maximum size is 500KB", 400);
  }

  const user = await User.findById(req.userId);

  if (user.avatar) {
    const oldPath = path.join(__dirname, "..", "uploads/avatar", user.avatar);

    try {
      await fs.unlink(oldPath);
    } catch (err) {
      if (err.code === "ENOENT") {
        console.warn(
          "The file was manually deleted, but the express won't go down"
        );
      } else {
        httpError("Failed to update old profile picture", 400);
      }
    }
  }

  const updatedAvatar = await User.findByIdAndUpdate(
    req.userId,
    { avatar: file.filename },
    { new: true }
  );

  res.status(200).json(updatedAvatar);
};

// ================= EDIT USER DETAILS =================
// PATCH: api/users/edit-user
// PROTECTED
const editUser = async (req, res) => {
  const {
    name,
    username,
    email,
    currentPassword,
    newPassword,
    confirmPassword,
  } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    httpError("User not found", 404);
  }

  const updatedFields = {};

  if (name) {
    updatedFields.name = name;
  }

  if (username) {
    updatedFields.username = username;
  }

  if (email) {
    updatedFields.email = email;
  }

  if (currentPassword || newPassword || confirmPassword) {
    if (!currentPassword || !newPassword || !confirmPassword) {
      httpError("To change password, fill in all password fields", 422);
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordCorrect) {
      httpError("Invalid current password", 422);
    }

    if (newPassword !== confirmPassword) {
      httpError("New passwords do not match", 422);
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    updatedFields.password = hashPassword;
  }

  const updatedUser = await User.findByIdAndUpdate(req.userId, updatedFields, {
    new: true,
  });

  res.status(200).json(updatedUser);
};

export { getUser, changeAvatar, editUser, getUsers };
