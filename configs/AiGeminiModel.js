const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  const CodegenerationConfig = {
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
  
export const generateAiCode = model.startChat({
  generationConfig : CodegenerationConfig,
  history: [
    {
      role: "user",
      parts: [
        {text: "generate a todo website application with modern ui and completely functional and responsive : \nGenerate a Project in React. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, \nwithout any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\nalso you can use date-fns for date format and react-chartjs-2 chart, graph library\n\nReturn the response in JSON format with the following schema:\n\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\n\nHere’s the reformatted and improved version of your prompt:\n\nGenerate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\n\nReturn the response in JSON format with the following schema:\n\njson\nCopy code\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\nEnsure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field, following this example:\nfiles:{\n  \"/App.js\": {\n    \"code\": \"import React from 'react';\\nimport './styles.css';\\nexport default function App() {\\n  return (\\n    <div className='p-4 bg-gray-100 text-center'>\\n      <h1 className='text-2xl font-bold text-blue-500'>Hello, Tailwind CSS with Sandpack!</h1>\\n      <p className='mt-2 text-gray-700'>This is a live code editor.</p>\\n    </div>\\n  );\\n}\"\n  }\n}\n  Additionally, include an explanation of the project's structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.\n  - When asked then only use this package to import, here are some packages available to import and use (date-fns,react-chartjs-2,\"firebase\",\"@google/generative-ai\" ) only when it required\n  \n  - For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg\n  -Add Emoji icons whenever needed to give good user experinence\n  - all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\n- By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\n- Use icons from lucide-react for logos.\n\n- Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n  "},
      ],
    },
    {
      role: "model",
      parts: [
        {text: "```json\n{\n  \"projectTitle\": \"Todo App with React, Tailwind CSS, and Lucide React\",\n  \"explanation\": \"This React application is a simple todo list manager built using Vite, Tailwind CSS for styling, and Lucide React for icons.  It allows users to add, check off, and delete todo items. The application is structured with components for the main app, todo list, and individual todo items, promoting code reusability and maintainability.  No external libraries beyond Lucide React are used for core functionality.\",\n  \"files\": {\n    \"/src/App.js\": {\n      \"code\": \"import React, { useState } from 'react';\\nimport TodoList from './components/TodoList';\\nimport AddTodo from './components/AddTodo';\\nimport { Plus } from 'lucide-react';\\n\\nexport default function App() {\\n  const [todos, setTodos] = useState([]);\\n\\n  const addTodo = (text) => {\\n    setTodos([...todos, { id: Date.now(), text, completed: false }]);\\n  };\\n\\n  const toggleComplete = (id) => {\\n    setTodos(todos.map((todo) =>\\n      todo.id === id ? { ...todo, completed: !todo.completed } : todo\\n    ));\\n  };\\n\\n  const deleteTodo = (id) => {\\n    setTodos(todos.filter((todo) => todo.id !== id));\\n  };\\n\\n  return (\\n    <div className=\\\"container mx-auto p-4\\\">\\n      <h1 className=\\\"text-3xl font-bold mb-4 text-center\\\">My Todo List 📝</h1>\\n      <AddTodo addTodo={addTodo} />\\n      <TodoList\\n        todos={todos}\\n        toggleComplete={toggleComplete}\\n        deleteTodo={deleteTodo}\\n      />\\n    </div>\\n  );\\n}\"\n    },\n    \"/src/components/AddTodo.js\": {\n      \"code\": \"import React, { useState } from 'react';\\nimport { Plus } from 'lucide-react';\\n\\nexport default function AddTodo({ addTodo }) {\\n  const [text, setText] = useState('');\\n\\n  const handleSubmit = (e) => {\\n    e.preventDefault();\\n    if (text.trim() !== '') {\\n      addTodo(text);\\n      setText('');\\n    }\\n  };\\n\\n  return (\\n    <form onSubmit={handleSubmit} className=\\\"flex mb-4\\\">\\n      <input\\n        type=\\\"text\\\"\\n        value={text}\\n        onChange={(e) => setText(e.target.value)}\\n        placeholder=\\\"Add a todo...\\\"\\n        className=\\\"flex-1 p-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500\\\"\\n      />\\n      <button type=\\\"submit\\\" className=\\\"p-2 ml-2 bg-blue-500 text-white rounded hover:bg-blue-600\\\">\\n        <Plus className=\\\"h-5 w-5\\\" />\\n      </button>\\n    </form>\\n  );\\n}\"\n    },\n    \"/src/components/TodoList.js\": {\n      \"code\": \"import React from 'react';\\nimport TodoItem from './TodoItem';\\n\\nexport default function TodoList({ todos, toggleComplete, deleteTodo }) {\\n  return (\\n    <ul className=\\\"space-y-2\\\">\\n      {todos.map((todo) => (\\n        <TodoItem\\n          key={todo.id}\\n          todo={todo}\\n          toggleComplete={toggleComplete}\\n          deleteTodo={deleteTodo}\\n        />\\n      ))}\\n    </ul>\\n  );\\n}\"\n    },\n    \"/src/components/TodoItem.js\": {\n      \"code\": \"import React from 'react';\\nimport { Check, X } from 'lucide-react';\\n\\nexport default function TodoItem({ todo, toggleComplete, deleteTodo }) {\\n  return (\\n    <li className=\\\"flex items-center justify-between p-2 bg-white rounded border border-gray-200 shadow-sm\\\">\\n      <div\\n        className={`flex items-center ${todo.completed ? 'line-through text-gray-500' : ''}`}\\n        onClick={() => toggleComplete(todo.id)}\\n      >\\n        <Check className=\\\"h-5 w-5 mr-2 text-green-500\\\" style={{ display: todo.completed ? 'inline-block' : 'none' }} />\\n        <span>{todo.text}</span>\\n      </div>\\n      <button onClick={() => deleteTodo(todo.id)} className=\\\"text-red-500 hover:text-red-700\\\">\\n        <X className=\\\"h-5 w-5\\\" />\\n      </button>\\n    </li>\\n  );\\n}\"\n    },\n    \"/index.html\": {\n      \"code\": \"<!DOCTYPE html>\\n<html lang=\\\"en\\\">\\n  <head>\\n    <meta charset=\\\"UTF-8\\\" />\\n    <link rel=\\\"icon\\\" type=\\\"image/svg+xml\\\" href=\\\"/vite.svg\\\" />\\n    <meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1.0\\\" />\\n    <title>Vite + React + TS</title>\\n  </head>\\n  <body>\\n    <div id=\\\"root\\\"></div>\\n    <script type=\\\"module\\\" src=\\\"/src/main.jsx\\\"></script>\\n  </body>\\n</html>\"\n    },\n    \"/src/main.jsx\": {\n      \"code\": \"import React from 'react';\\nimport ReactDOM from 'react-dom/client';\\nimport './index.css';\\nimport App from './App';\\n\\nReactDOM.createRoot(document.getElementById('root')).render(\\n  <React.StrictMode>\\n    <App />\\n  </React.StrictMode>\\n);\\n\"\n    },\n    \"/src/index.css\": {\n      \"code\": \"@tailwind base;\\n@tailwind components;\\n@tailwind utilities;\"\n    }\n  },\n  \"generatedFiles\": [\n    \"/src/App.js\",\n    \"/src/components/AddTodo.js\",\n    \"/src/components/TodoList.js\",\n    \"/src/components/TodoItem.js\",\n    \"/index.html\",\n    \"/src/main.jsx\",\n    \"/src/index.css\"\n  ]\n}\n```\n"},
      ],
    },
  ],
})

    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());
 