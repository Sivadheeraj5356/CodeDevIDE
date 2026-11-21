const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey =
  process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.5-flash";

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
  // Gemini 2.5 spends output tokens on internal thinking before writing any
  // JSON, so a small cap truncates the project mid-object and it no longer
  // parses. Give the answer room, and skip thinking to stay well inside the
  // serverless function timeout.
  maxOutputTokens: 65536,
  thinkingConfig: { thinkingBudget: 0 },
  responseMimeType: "application/json",
};

const CODE_GEN_HISTORY = [
  {
    role: "user",
    parts: [
      {text: "Generate to do app : Generate a Project in React. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\n\nReturn the response in JSON format with the following schema:\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\n\nHere’s the reformatted and improved version of your prompt:\n\nGenerate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary . Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\n\nReturn the response in JSON format with the following schema:\n\njson\nCopy code\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\nEnsure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field, following this example:\nfiles:{\n  \"/App.js\": {\n    \"code\": \"import React from 'react';\\nimport './styles.css';\\nexport default function App() {\\n  return (\\n    <div className='p-4 bg-gray-100 text-center'>\\n      <h1 className='text-2xl font-bold text-blue-500'>Hello, Tailwind CSS with Sandpack!</h1>\\n      <p className='mt-2 text-gray-700'>This is a live code editor.</p>\\n    </div>\\n  );\\n}\"\n  }\n}\n  Additionally, include an explanation of the project's structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.\n  - For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg\n  -Add Emoji icons whenever needed to give good user experinence\n   - The lucide-react library is also available to be imported IF NECCESARY ONLY FOR THE FOLLOWING ICONS: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Clock, Heart, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, ArrowRight. Here's an example of importing and using one: import { Heart } from \"lucide-react\"\\` & \\<Heart className=\"\"  />\\. PLEASE ONLY USE THE ICONS IF AN ICON IS NEEDED IN THE USER'S REQUEST.\n\n"},
    ],
  },
  {
    role: "model",
    parts: [
      {text: "{\n  \"projectTitle\": \"Simple To-Do App\",\n  \"explanation\": \"This project is a simple to-do application built with React and styled using Tailwind CSS. It features a component-based structure, allowing users to add, edit, and delete tasks. The app uses functional components and manages state through useState. It provides a basic interface for managing a list of tasks with clear visual feedback on their completion status and uses icons for better user experience.\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"import React from 'react';\\nimport TodoList from './components/TodoList';\\n\\nfunction App() {\\n  return (\\n    <div className=\\\"bg-gray-100 min-h-screen p-4\\\">\\n      <div className=\\\"max-w-2xl mx-auto bg-white shadow-md rounded-md p-6\\\">\\n        <h1 className=\\\"text-2xl font-bold mb-4 text-center\\\">My To-Do List 📝</h1>\\n        <TodoList />\\n      </div>\\n    </div>\\n  );\\n}\\n\\nexport default App;\\n\"\n    },\n    \"/components/TodoList.js\": {\n      \"code\": \"import React, { useState } from 'react';\\nimport { Plus } from 'lucide-react';\\nimport TodoItem from './TodoItem';\\n\\nfunction TodoList() {\\n  const [todos, setTodos] = useState([]);\\n  const [newTask, setNewTask] = useState('');\\n\\n  const handleAddTodo = () => {\\n    if (newTask.trim() !== '') {\\n      setTodos([...todos, { id: Date.now(), text: newTask, completed: false }]);\\n      setNewTask('');\\n    }\\n  };\\n\\n  const handleDeleteTodo = (id) => {\\n    setTodos(todos.filter((todo) => todo.id !== id));\\n  };\\n\\n  const handleToggleComplete = (id) => {\\n    setTodos(todos.map(todo => todo.id === id ? {...todo, completed: !todo.completed} : todo));\\n  };\\n\\n  return (\\n    <div>\\n      <div className=\\\"flex mb-4\\\">\\n        <input\\n          type=\\\"text\\\"\\n          className=\\\"border rounded-md p-2 mr-2 flex-grow\\\"\\n          placeholder=\\\"Add a new task...\\\"\\n          value={newTask}\\n          onChange={(e) => setNewTask(e.target.value)}\\n        />\\n        <button onClick={handleAddTodo} className=\\\"bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded\\\">\\n          <Plus className=\\\"h-4 w-4 inline-block mr-1\\\"/> Add\\n        </button>\\n      </div>\\n      <ul>\\n        {todos.map((todo) => (\\n          <TodoItem\\n            key={todo.id}\\n            todo={todo}\\n            onDelete={handleDeleteTodo}\\n            onToggleComplete={handleToggleComplete}\\n          />\\n        ))}\\n      </ul>\\n    </div>\\n  );\\n}\\n\\nexport default TodoList;\\n\"\n    },\n    \"/components/TodoItem.js\": {\n      \"code\": \"import React from 'react';\\nimport { Trash } from 'lucide-react';\\n\\nfunction TodoItem({ todo, onDelete, onToggleComplete }) {\\n  return (\\n    <li className=\\\"flex items-center justify-between border-b py-2 last:border-b-0\\\">\\n      <div className=\\\"flex items-center w-full\\\">\\n        <input\\n          type=\\\"checkbox\\\"\\n          checked={todo.completed}\\n          onChange={() => onToggleComplete(todo.id)}\\n          className=\\\"mr-2 cursor-pointer\\\"\\n        />\\n        <span className={`flex-grow ${todo.completed ? 'line-through text-gray-500' : ''}`}>\\n          {todo.text}\\n        </span>\\n        <button onClick={() => onDelete(todo.id)} className=\\\"text-red-500 hover:text-red-700 focus:outline-none\\\">\\n          <Trash className=\\\"h-4 w-4\\\" />\\n        </button>\\n      </div>\\n    </li>\\n  );\\n}\\n\\nexport default TodoItem;\\n\"\n    }\n  },\n  \"generatedFiles\": [\n    \"/App.js\",\n    \"/components/TodoList.js\",\n    \"/components/TodoItem.js\"\n  ]\n}"},
    ],
  },
];

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "google/gemma-4-31b-it:free";

function getModel() {
  if (!apiKey) {
    throw new Error(
      "Missing Gemini API key. Set GEMINI_API_KEY in .env.local (and in your Vercel project settings)."
    );
  }
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL_NAME });
}

// The fallback providers speak the OpenAI chat-completions shape, so a Gemini
// session history maps onto plain user/assistant messages.
function toOpenAiMessages(history, prompt) {
  const messages = history.map((entry) => ({
    role: entry.role === "model" ? "assistant" : "user",
    content: entry.parts.map((part) => part.text || "").join("\n"),
  }));
  messages.push({ role: "user", content: prompt });
  return messages;
}

async function callOpenAiCompatible(endpoint, key, model, messages, config) {
  const body = {
    model,
    messages,
    temperature: config.temperature,
    top_p: config.topP,
    max_tokens: Math.min(config.maxOutputTokens || 8192, 16384),
  };
  if (config.responseMimeType === "application/json") {
    body.response_format = { type: "json_object" };
  }
  const post = () =>
    fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(55000),
    });
  let response = await post();
  if (response.status === 400 && body.response_format) {
    delete body.response_format;
    response = await post();
  }
  if (!response.ok) {
    const error = new Error(`${model} returned HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }
  const payload = await response.json();
  const text = (payload.choices || [])
    .map((choice) => choice.message?.content || "")
    .join("")
    .trim();
  if (!text) {
    throw new Error(`${model} returned an empty response`);
  }
  const finishReason = payload.choices?.[0]?.finish_reason;
  return { text, finishReason: finishReason === "length" ? "MAX_TOKENS" : "STOP" };
}

function fallbackProviders() {
  const providers = [];
  if (process.env.GROQ_API_KEY) {
    providers.push({ name: "groq", endpoint: GROQ_ENDPOINT, key: process.env.GROQ_API_KEY, model: GROQ_MODEL });
  }
  if (process.env.OPENROUTER_API_KEY) {
    providers.push({ name: "openrouter", endpoint: OPENROUTER_ENDPOINT, key: process.env.OPENROUTER_API_KEY, model: OPENROUTER_MODEL });
  }
  return providers;
}

// A chat session keeps its own history, so each request gets a fresh one.
// Sharing a single module-level session across requests leaks conversations
// between users and grows the history until the model call fails.
function createSession(history, config) {
  return {
    async sendMessage(prompt) {
      const attempts = [];
      if (apiKey) {
        attempts.push({
          name: "gemini",
          run: async () => {
            const session = getModel().startChat({ generationConfig: config, history });
            const result = await session.sendMessage(prompt);
            return {
              text: result.response.text(),
              finishReason: result.response.candidates?.[0]?.finishReason,
            };
          },
        });
      }
      for (const provider of fallbackProviders()) {
        attempts.push({
          name: provider.name,
          run: () =>
            callOpenAiCompatible(
              provider.endpoint,
              provider.key,
              provider.model,
              toOpenAiMessages(history, prompt),
              config
            ),
        });
      }
      if (!attempts.length) {
        throw new Error(
          "Missing Gemini API key. Set GEMINI_API_KEY in .env.local (and in your Vercel project settings)."
        );
      }
      const failures = [];
      let lastError;
      for (const attempt of attempts) {
        try {
          const result = await attempt.run();
          return {
            response: {
              text: () => result.text,
              candidates: [{ finishReason: result.finishReason }],
            },
          };
        } catch (error) {
          failures.push(`${attempt.name}: ${error?.message || error}`);
          lastError = error;
        }
      }
      console.error(`[ai] providers failed: ${failures.join("; ")}`);
      throw lastError;
    },
  };
}

export function createChatSession() {
  return createSession([], generationConfig);
}

export function createCodeSession() {
  return createSession(CODE_GEN_HISTORY, CodeGenerationConfig);
}

export const GEMINI_MODEL_NAME = MODEL_NAME;

function findQuotaViolation(error) {
  const details = Array.isArray(error?.errorDetails) ? error.errorDetails : [];
  const quotaFailure = details.find((d) =>
    String(d["@type"]).includes("QuotaFailure")
  );
  return quotaFailure?.violations?.[0];
}

// The SDK throws with the provider's whole JSON payload in the message, which is
// several hundred characters of quota metadata. Turn it into one line a user can
// act on, and keep an HTTP status the client can branch on.
export function describeAiError(error) {
  const status = error?.status ?? error?.response?.status;

  if (status === 429 || /429|Too Many Requests|quota/i.test(error?.message || "")) {
    const violation = findQuotaViolation(error);
    const perDay = String(violation?.quotaId || "").includes("PerDay");
    const limit = violation?.quotaValue;

    return {
      status: 429,
      message: perDay
        ? `Daily Gemini limit reached${limit ? ` (${limit} requests a day` : " (free tier"} for ${MODEL_NAME}). The quota resets at midnight Pacific time, or you can enable billing on the API key.`
        : `Gemini is rate limiting this key. Wait a few seconds and try again.`,
    };
  }

  if (status === 401 || status === 403) {
    return {
      status: 401,
      message: "The Gemini API key is missing, invalid, or not allowed to use this model.",
    };
  }

  if (status === 503 || /overloaded/i.test(error?.message || "")) {
    return {
      status: 503,
      message: "Gemini is overloaded right now. Try again in a moment.",
    };
  }

  if (/Missing Gemini API key/i.test(error?.message || "")) {
    return { status: 500, message: error.message };
  }

  return { status: 500, message: "The AI model could not be reached. Try again." };
}
