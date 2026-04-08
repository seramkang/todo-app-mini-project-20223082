require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// DB 연결
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
};

// 모델
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

// API
app.get('/todos', async (req, res) => {
  await connectDB();
  const todos = await Todo.find();
  res.json(todos);
});

app.post('/todos', async (req, res) => {
  await connectDB();
  const newTodo = new Todo({ title: req.body.title });
  await newTodo.save();
  res.json(newTodo);
});

app.put('/todos/:id', async (req, res) => {
  await connectDB();
  const todo = await Todo.findByIdAndUpdate(
    req.params.id,
    { completed: req.body.completed },
    { new: true }
  );
  res.json(todo);
});

app.delete('/todos/:id', async (req, res) => {
  await connectDB();
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: '삭제 완료' });
});

// 필수
module.exports = app;
