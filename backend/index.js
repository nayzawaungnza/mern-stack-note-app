require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");
mongoose.connect(config.connectionString);
const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");

const app = express();
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", (req, res) => {
  res.json({
    message: "Hello World!",
  });
});

//create account
app.post("/users", async (req, res) => {
  const { fullName, email, password } = req.body;
  if (!fullName) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter your full name." });
  }
  if (!email) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter your email." });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter your password." });
  }
  const isUser = await User.findOne({ email });
  if (isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User already exists." });
  }
  const user = new User({
    fullName,
    email,
    password,
  });
  await user.save();
  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  res.json({
    error: false,
    user,
    accessToken,
    message: "User created successfully.",
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter your email." });
  }
  if (!password) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter your password." });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res
      .status(400)
      .json({ error: true, message: "User does not exist." });
  }
  if (password !== user.password) {
    return res
      .status(400)
      .json({ error: true, message: "Incorrect password." });
  }
  if (email === user.email && password === user.password) {
    const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "45m",
    });
    res.json({
      error: false,
      email,
      accessToken,
      message: "Login successful.",
    });
  } else {
    res.status(400).json({ error: true, message: "Invalid credentials." });
  }
});

//Get User
app.get("/get-user", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const isUser = await User.findOne({ _id: user._id });
  if (!isUser) {
    return res
      .status(400)
      .json({ error: true, message: "User does not exist." });
  }
  res.json({
    error: false,
    user: {
      _id: isUser._id,
      fullName: isUser.fullName,
      email: isUser.email,
      password: isUser.password,
      createdOn: isUser.createdOn,
    },
    message: "User fetched successfully.",
  });
});

// Add Note
app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;
  if (!title) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter title." });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter content." });
  }
  if (!tags) {
    return res.status(400).json({ error: true, message: "Please enter tags." });
  }
  try {
    const note = new Note({
      title,
      content,
      tags: tags || [],
      userId: user._id,
    });
    await note.save();
    res.json({
      error: false,
      note,
      message: "Note added successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

// Edit Notes
app.put("/edit-note/:id", authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;
  if (!noteId) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter note id." });
  }
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  if (!title && !content && !tags && !isPinned) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter something to update." });
  }
  if (!title) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter title." });
  }
  if (!content) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter content." });
  }
  if (!tags) {
    return res.status(400).json({ error: true, message: "Please enter tags." });
  }
  try {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: user._id },
      {
        title,
        content,
        tags: tags || [],
      },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found." });
    }
    return res.json({
      error: false,
      note,
      message: "Note updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

//Get all notes
app.get("/get-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id }).sort({
      isPinned: -1,
      createdOn: -1,
    });
    res.json({ error: false, notes, message: "Notes fetched successfully." });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});
// Delete Note
app.delete("/delete-note/:id", authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  const { user } = req.user;
  if (!noteId) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter note id." });
  }
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ msg: "Invalid ID" });
  }
  try {
    const note = await Note.findOneAndDelete({
      _id: noteId,
      userId: user._id,
    });
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found." });
    }
    return res.json({
      error: false,
      message: "Note deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});

//Get update pin
app.put("/pin-note/:id", authenticateToken, async (req, res) => {
  const noteId = req.params.id;
  const { user } = req.user;
  const { isPinned } = req.body;
  if (!noteId) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter note id." });
  }
  if (!mongoose.Types.ObjectId.isValid(noteId)) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  try {
    const note = await Note.findOneAndUpdate(
      { _id: noteId, userId: user._id },
      {
        isPinned,
      },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ error: true, message: "Note not found." });
    }
    return res.json({
      error: false,
      note,
      message: "Note pinned updated successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});
// Search Notes
app.get("/search-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  const { query } = req.query;
  if (!query) {
    return res
      .status(400)
      .json({ error: true, message: "Please enter something to search." });
  }

  try {
    const notes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
        { tags: { $regex: new RegExp(query, "i") } },
      ],
    });
    res.json({
      error: false,
      notes,
      message: "Notes matching the search query retrieved successfully.",
    });
  } catch (error) {
    res.status(500).json({ error: true, message: "Internal server error" });
  }
});
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});

module.export = app;
