# 🚀 Smart Form Factory

> **Auto-Generate Beautiful Forms from JSON Schema**

Transform JSON schemas into fully styled, accessible, responsive forms instantly. Export to React Hook Form, Formik, Vue 3, Svelte, or plain HTML with one click.

![Smart Form Factory](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **🎯 Instant Form Generation** - Paste JSON schema, get beautiful forms
- **🔄 Multi-Framework Export** - React Hook Form, Formik, Vue 3, Svelte, HTML
- **✅ Auto Validation** - Zod/Yup schemas generated automatically
- **🌗 Dark/Light Mode** - Seamless theme switching
- **♿ Accessible** - ARIA labels, keyboard navigation, screen reader support
- **📱 Responsive** - Mobile-first design
- **🎨 Themeable** - Export CSS variables for easy customization
- **🔒 Secure** - Input sanitization, XSS prevention, no data storage

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/smart-form-factory.git
cd smart-form-factory

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage

### 1. Paste Your JSON Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Contact Form",
  "type": "object",
  "required": ["name", "email", "message"],
  "properties": {
    "name": {
      "type": "string",
      "title": "Full Name",
      "minLength": 2,
      "x-placeholder": "John Doe"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email Address"
    },
    "message": {
      "type": "string",
      "title": "Message",
      "x-rows": 4
    }
  }
}
```

### 2. Click Generate

The form preview updates instantly with validation rules applied.

### 3. Export Your Code

Choose your framework and copy/download the generated code.

## 🔧 Supported JSON Schema Features

| Feature | Description |
|---------|-------------|
| `type` | string, number, integer, boolean, array |
| `format` | email, url, date, datetime, password, tel |
| `enum` | Dropdown/radio options |
| `required` | Field validation |
| `minLength/maxLength` | String length validation |
| `minimum/maximum` | Number range validation |
| `pattern` | Regex validation |
| `x-placeholder` | Custom placeholder text |
| `x-rows` | Textarea row count |
| `x-disabled` | Disable field |
| `x-hidden` | Hidden field |

## 🎨 Theming

Export CSS variables to customize the design:

```css
:root {
  --primary: 16 85% 55%;
  --secondary: 200 70% 50%;
  --accent: 340 75% 55%;
  --background: 30 25% 98%;
  --foreground: 240 10% 10%;
  /* ...more variables */
}
```

## 🛡️ Security Features

- **Input Sanitization** - All user input is sanitized to prevent XSS
- **JSON Validation** - Schemas are validated before processing
- **Prototype Pollution Prevention** - Dangerous keys are filtered
- **CSP Headers** - Content Security Policy headers configured
- **No Data Storage** - Forms are generated client-side only

## 🏗️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Validation**: [Zod](https://zod.dev/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **UI Primitives**: [Radix UI](https://www.radix-ui.com/)

## 📁 Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles & CSS variables
│   ├── layout.tsx       # Root layout with providers
│   └── page.tsx         # Main application page
├── components/
│   ├── ui/              # Reusable UI components
│   ├── header.tsx       # App header with theme toggle
│   ├── json-editor.tsx  # Monaco JSON editor
│   ├── form-preview.tsx # Live form preview
│   └── code-output.tsx  # Generated code display
└── lib/
    ├── schema-parser.ts # JSON schema parsing logic
    ├── code-generator.ts# Multi-framework code generation
    ├── store.ts         # Zustand state management
    └── utils.ts         # Utility functions
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for component inspiration
- [JSON Schema](https://json-schema.org/) specification
- The amazing open-source community

---

<p align="center">
  Made with ❤️ by developers, for developers
</p>

