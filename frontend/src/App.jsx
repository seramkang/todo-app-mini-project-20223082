import { useEffect, useState } from 'react';
import axios from 'axios';

const API = '/api/todos';

export const getTodos = async () => {
  const res = await axios.get(API);
  return res.data;
};

export const addTodo = async (todo) => {
  const res = await axios.post(API, { text: todo });
  return res.data;
};

function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');

  const fetchTodos = async () => {
    const res = await axios.get(API);
    setTodos(res.data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    if (!title) return;
    await axios.post(API, { title });
    setTitle('');
    fetchTodos();
  };

  const toggleTodo = async (id, completed) => {
    await axios.put(`${API}/${id}`, {
      completed: !completed
    });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchTodos();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Todo App</h1>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <button onClick={addTodo}>추가</button>

      <ul>
        {todos.map(todo => (
          <li key={todo._id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo._id, todo.completed)}
            />
            {todo.title}
            <button onClick={() => deleteTodo(todo._id)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
