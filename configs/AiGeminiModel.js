const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

const CodeGenerationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};


  export const chatSession = model.startChat({
    generationConfig,
    history: [
    ],
  });

  export const GenAiCode=model.startChat({
    generationConfig:CodeGenerationConfig,
    history: [
      {
        role: "user",
        parts: [
          {text: "Generate to do app : Generate a Project in React. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\n\nReturn the response in JSON format with the following schema:\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\n\nHere’s the reformatted and improved version of your prompt:\n\nGenerate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary . Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\n\nReturn the response in JSON format with the following schema:\n\njson\nCopy code\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\nEnsure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field, following this example:\nfiles:{\n  \"/App.js\": {\n    \"code\": \"import React from 'react';\\nimport './styles.css';\\nexport default function App() {\\n  return (\\n    <div className='p-4 bg-gray-100 text-center'>\\n      <h1 className='text-2xl font-bold text-blue-500'>Hello, Tailwind CSS with Sandpack!</h1>\\n      <p className='mt-2 text-gray-700'>This is a live code editor.</p>\\n    </div>\\n  );\\n}\"\n  }\n}\n  Additionally, include an explanation of the project's structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.\n  - For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg\n  -Add Emoji icons whenever needed to give good user experinence\n   - The lucide-react library is also available to be imported IF NECCESARY ONLY FOR THE FOLLOWING ICONS: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Clock, Heart, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, ArrowRight. Here's an example of importing and using one: import { Heart } from \"lucide-react\"\\` & \\<Heart className=\"\"  />\\. PLEASE ONLY USE THE ICONS IF AN ICON IS NEEDED IN THE USER'S REQUEST.\n\n"},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n{\n  \"projectTitle\": \"Simple To-Do App\",\n  \"explanation\": \"This project is a simple to-do application built with React and styled using Tailwind CSS. It features a component-based structure, allowing users to add, edit, and delete tasks. The app uses functional components and manages state through useState. It provides a basic interface for managing a list of tasks with clear visual feedback on their completion status and uses icons for better user experience.\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"import React from 'react';\\nimport TodoList from './components/TodoList';\\n\\nfunction App() {\\n  return (\\n    <div className=\\\"bg-gray-100 min-h-screen p-4\\\">\\n      <div className=\\\"max-w-2xl mx-auto bg-white shadow-md rounded-md p-6\\\">\\n        <h1 className=\\\"text-2xl font-bold mb-4 text-center\\\">My To-Do List 📝</h1>\\n        <TodoList />\\n      </div>\\n    </div>\\n  );\\n}\\n\\nexport default App;\\n\"\n    },\n    \"/components/TodoList.js\": {\n      \"code\": \"import React, { useState } from 'react';\\nimport { Plus, Trash, Edit, Check, X } from 'lucide-react';\\nimport TodoItem from './TodoItem';\\n\\nfunction TodoList() {\\n  const [todos, setTodos] = useState([]);\\n  const [newTask, setNewTask] = useState('');\\n  const [editId, setEditId] = useState(null);\\n  const [editTaskText, setEditTaskText] = useState('');\\n\\n  const handleAddTodo = () => {\\n    if (newTask.trim() !== '') {\\n      setTodos([...todos, { id: Date.now(), text: newTask, completed: false }]);\\n      setNewTask('');\\n    }\\n  };\\n\\n  const handleDeleteTodo = (id) => {\\n    setTodos(todos.filter((todo) => todo.id !== id));\\n  };\\n\\n  const handleToggleComplete = (id) => {\\n      setTodos(todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo));\\n  }\\n\\n  const handleEditTodo = (todo) => {\\n    setEditId(todo.id);\\n    setEditTaskText(todo.text);\\n  };\\n\\n  const handleUpdateTodo = () => {\\n      if (editTaskText.trim() !== '') {\\n          setTodos(todos.map(todo => todo.id === editId ? {...todo, text: editTaskText} : todo));\\n          setEditId(null);\\n          setEditTaskText('');\\n      }\\n    \\n  };\\n\\n  const handleCancelEdit = () => {\\n    setEditId(null);\\n    setEditTaskText('');\\n  }\\n\\n  return (\\n    <div>\\n      <div className=\\\"flex mb-4\\\">\\n        <input\\n          type=\\\"text\\\"\\n          className=\\\"border rounded-md p-2 mr-2 flex-grow\\\"\\n          placeholder=\\\"Add a new task...\\\"\\n          value={newTask}\\n          onChange={(e) => setNewTask(e.target.value)}\\n        />\\n        <button onClick={handleAddTodo} className=\\\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\\\">\\n            <Plus className=\\\"h-4 w-4 inline-block mr-1\\\"/> Add\\n        </button>\\n      </div>\\n      <ul>\\n        {todos.map((todo) => (\\n          <TodoItem\\n              key={todo.id}\\n              todo={todo}\\n              onDelete={handleDeleteTodo}\\n              onEdit={handleEditTodo}\\n              onToggleComplete={handleToggleComplete}\\n              editId={editId}\\n              editTaskText={editTaskText}\\n              onEditChange={setEditTaskText}\\n              onUpdateTodo={handleUpdateTodo}\\n              onCancelEdit={handleCancelEdit}\\n\\n          />\\n        ))}\\n      </ul>\\n    </div>\\n  );\\n}\\n\\nexport default TodoList;\\n\"\n    },\n     \"/components/TodoItem.js\": {\n      \"code\": \"import React from 'react';\\nimport { Trash, Edit, Check, X } from 'lucide-react';\\n\\n\\nfunction TodoItem({todo, onDelete, onEdit, onToggleComplete, editId, editTaskText, onEditChange, onUpdateTodo, onCancelEdit}) {\\n  const isEditing = editId === todo.id;\\n  \\n    return (\\n    <li className=\\\"flex items-center justify-between border-b py-2 last:border-b-0\\\">\\n        {isEditing ? (\\n        <div className=\\\"flex items-center w-full\\\">\\n            <input\\n                type=\\\"text\\\"\\n                value={editTaskText}\\n                onChange={(e) => onEditChange(e.target.value)}\\n                className=\\\"border rounded p-2 mr-2 w-full focus:outline-none\\\"\\n            />\\n            <button onClick={onUpdateTodo} className=\\\"text-green-500 hover:text-green-700 mr-2 focus:outline-none\\\">\\n             <Check className=\\\"h-5 w-5\\\"/>\\n           </button>\\n           <button onClick={onCancelEdit} className=\\\"text-red-500 hover:text-red-700 focus:outline-none\\\">\\n             <X className=\\\"h-5 w-5\\\"/>\\n           </button>\\n          </div>\\n        ) : (\\n        <div className=\\\"flex items-center w-full\\\">\\n            <input\\n                type=\\\"checkbox\\\"\\n                checked={todo.completed}\\n                onChange={() => onToggleComplete(todo.id)}\\n                className=\\\"mr-2 cursor-pointer\\\"\\n            />\\n             <span className={`flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}>\\n                {todo.text}\\n            </span>\\n            <div className=\\\"flex items-center\\\">\\n                <button onClick={() => onEdit(todo)} className=\\\"text-blue-500 hover:text-blue-700 mr-2 focus:outline-none\\\">\\n                  <Edit className=\\\"h-4 w-4\\\"/>\\n                </button>\\n                <button onClick={() => onDelete(todo.id)} className=\\\"text-red-500 hover:text-red-700 focus:outline-none\\\">\\n                    <Trash className=\\\"h-4 w-4\\\" />\\n                </button>\\n            </div>\\n        </div>\\n        )}\\n      </li>\\n    );\\n}\\n\\nexport default TodoItem;\\n\"\n    }\n  },\n  \"generatedFiles\": [\n    \"/App.js\",\n    \"/components/TodoList.js\",\n    \"/components/TodoItem.js\"\n  ]\n}\n```\n"},
        ],
      },
    ],
  })

  // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
  // console.log(result.response.text());
