require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DB 연결 (serverless용)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('MongoDB 연결 성공');
  } catch (err) {
    console.error(err);
  }
};

// 모델
const todoSchema = new mongoose.Schema({
  title: String,
  completed: Boolean,
});
const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

// API
app.get('/todos', async (req, res) => {
  try {
    await connectDB();
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/todos', async (req, res) => {
  try {
    await connectDB();
    const newTodo = new Todo({ title: req.body.title });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
