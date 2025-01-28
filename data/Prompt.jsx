import dedent from "dedent";

export default{
  CHAT_PROMPT:dedent`
  'You are a AI Assistant and experience in React Development.
  GUIDELINES:
  - Tell user what your are building
  - response less than 15 lines. 
  - Skip code examples and commentary'
`,

CODE_GEN_PROMPT:dedent`
Generate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from "lucide-react" and use it in JSX as <Heart className="" />.
do not use src folder and generate code without source folder ,
Return the response in JSON format with the following schema: remove a source folder from the generated code 

json
Copy code
{
  "projectTitle": "",
  "explanation": "",
  "files": {
    "/App.js": {
      "code": ""
    },
    ...
  },
  "generatedFiles": []
}
Ensure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field, following this example:
files:{
  "/App.js": {
    "code": "import React from 'react';\nimport './styles.css';\nexport default function App() {\n  return (\n    <div className='p-4 bg-gray-100 text-center'>\n      <h1 className='text-2xl font-bold text-blue-500'>Hello, Tailwind CSS with Sandpack!</h1>\n      <p className='mt-2 text-gray-700'>This is a live code editor.</p>\n    </div>\n  );\n}"
  }
}
  Additionally, include an explanation of the project's structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.
  - When asked then only use this package to import, here are some packages available to import and use (date-fns,react-chartjs-2,"firebase","@google/generative-ai" ) only when it required
  
  -use images wherever required from valid links of images from internet , if not use this For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg
  -Add Emoji icons whenever needed to give good user experinence
  -use react-router-dom for routing in the project , and link them properly
  - make the ui beautiful and responsive, and the generated code should have The output should use Tailwind CSS for styling, with a focus on creating a beautiful UI that includes:
    - A responsive header with a logo and navigation links.
    - A navbar for easy access to different sections of the application.
    - A footer with copyright information and links.
    - A dashboard layout that displays key metrics and information.
    
    Ensure that the application is fully functional and includes a terminal for installing dependencies and editing code.
    -replicate the clone websites design with pixel perfection and make the website responsive with modern and stunning ui with a toggle button for light and dark mode , which is completely functional and user friendly
  - all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.

- By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.

- Use icons from lucide-react for logos.

- Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.
  
`,



}

