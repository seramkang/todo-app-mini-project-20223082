require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// --- [수정 구간: DB 연결 로직] ---
let cachedDb = null;

async function connectToDatabase() {
  // 이미 연결되어 있다면 기존 연결 사용
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  console.log('새로운 MongoDB 연결 시도 중...');
  // 버퍼링 타임아웃 방지를 위해 strictQuery 설정 (선택 사항)
  mongoose.set('strictQuery', true);

  cachedDb = await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000, // 5초 안에 연결 안 되면 에러 발생
  });
  
  console.log('MongoDB 연결 성공');
  return cachedDb;
}
// ------------------------------

// Todo 스키마 (스키마 정의는 그대로 유지)
const todoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

// 모델 중복 생성을 방지하기 위한 처리
const Todo = mongoose.models.Todo || mongoose.model('Todo', todoSchema);

// --- [API 엔드포인트: 모든 핸들러에 await connectToDatabase() 추가] ---

app.get('/api/todos', async (req, res) => {
  try {
    await connectToDatabase(); // 요청 처리 전 연결 확인
    const todos = await Todo.find();
    res.json(todos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/todos', async (req, res) => {
  try {
    await connectToDatabase();
    const newTodo = new Todo({ title: req.body.title });
    await newTodo.save();
    res.json(newTodo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/todos/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const todo = await Todo.findByIdAndUpdate(
      req.params.id, 
      { completed: req.body.completed }, 
      { new: true }
    );
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/todos/:id', async (req, res) => {
  try {
    await connectToDatabase();
    await Todo.findByIdAndDelete(req.params.id);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = app;
