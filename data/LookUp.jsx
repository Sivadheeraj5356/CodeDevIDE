import dedent from "dedent";

export default {
  SUGGSTIONS: ['Create ToDo App in React', 'Create Budget Track App', 'Create Gym Managment Portal Dashboard', 'Create Quizz App On History', 'Create Login Signup Screen'],
  HERO_HEADING: 'What do you want to build?',
  HERO_DESC: 'Prompt, run, edit, and deploy full-stack web apps.',
  INPUT_PLACEHOLDER: 'What you want to build?',
  SIGNIN_HEADING: 'Continue With Bolt.New 2.0',
  SIGNIN_SUBHEADING: 'To use Bolt you must log into an existing account or create one.',
  SIGNIn_AGREEMENT_TEXT: 'By using Bolt, you agree to the collection of usage data for analytics.',


  DEFAULT_FILE: {
    '/public/index.html': {
      code: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`
    },
    '/index.css': {
    code: `@tailwind base;
    @tailwind components;
    @tailwind utilities;`
  },
    '/App.js': {
      code: `
import React from 'react';

function App() {
  return <h1>Hello, World!</h1>;
}

export default App; `
  },
  '/index.js': {
      code: `
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
     `
  },
    '/tailwind.config.js': {
      code: `
           module.exports = {
      content: ["./src/**/*.{html,js,jsx}"],
      theme: { extend: {} },
      plugins: [],
    }`
    },
    '/postcss.config.js': {
      code: `/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    tailwindcss: {},
  },
};

export default config;
`
    }
  },
  DEPENDANCY: {

    "postcss": "^8",
    "tailwindcss": "^3.4.1",
    autoprefixer: "^10.0.0",
    "uuid4": "^2.0.3",
    "tailwind-merge": "^2.4.0",
    "tailwindcss-animate": "^1.0.7",
    "lucide-react": "^0.469.0",
    "react-router-dom": "^7.1.1",
    "firebase": "^11.1.0",
    "@google/generative-ai": "^0.21.0",
    "date-fns": "^4.1.0",
    "react-chartjs-2": "^5.3.0",
    "chart.js": "^4.4.7",
  },
  PRICING_DESC:'Every account starts free. Paid plans raise how much you can generate each month, for when one project a day stops being enough.',
  PRICING_OPTIONS:[
    {
      name:'Basic',
      tokens:'50K',
      value:50000,
      desc:'For trying things out and the occasional weekend project.',
      price:4.99
    },
    {
      name:'Starter',
      tokens:'120K',
      value:120000,
      desc:'For building a few projects a week without watching the counter.',
      price:9.99
    },
    {
      name:'Pro',
      tokens:'2.5M',
      value:2500000,
      desc:'For daily use and larger projects with many screens and components.',
      price:19.99
    },
    {
      name:'Unlimited',
      tokens:'Unlimited',
      value:999999999,
      desc:'No monthly ceiling, for when this is part of your normal workflow.',
      price:49.99
    }
  ]


}