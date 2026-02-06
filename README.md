# S.Y. B.Com Command Center

A React-based academic assistant for S.Y. B.Com students at Mumbai University.

## 📁 Project Structure

```
SY-BCOM-/
├── src/
│   ├── App.jsx              ← Your main React component
│   ├── main.jsx             ← Application entry point
│   └── index.css            ← Global styles & Tailwind
├── public/
│   └── index.html           ← HTML template
├── package.json             ← Dependencies & scripts
├── vite.config.js           ← Vite bundler config
├── tailwind.config.js       ← Tailwind CSS config
└── postcss.config.js        ← PostCSS config
```

## 🚀 Where to Put Your Code

- **Main component code**: `src/App.jsx` ✅ (Already set up with your code)
- **Additional components**: Create files in `src/` folder (e.g., `src/components/Header.jsx`)
- **Utilities/Helpers**: Create `src/utils/` folder for helper functions
- **Hooks**: Create `src/hooks/` folder for custom React hooks
- **Styles**: Add CSS to `src/index.css` or create component-specific CSS files

## 📦 Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## ✨ Features

- 9 subjects with specialized prompts
- Markdown response rendering with tables
- Exam mode for structured answers
- Quick actions (Simplify, Practice Questions, Exam Tips)
- Responsive design with Tailwind CSS
- Gemini API integration for AI responses