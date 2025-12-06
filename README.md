# Smart Form Factory

Paste a JSON schema, get a working form. Supports React Hook Form, Formik, Vue, Svelte, and plain HTML.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square) ![Version](https://img.shields.io/badge/Version-1.1.0-green?style=flat-square)

## Features

- **Visual Form Builder** - drag & drop interface, no JSON needed
- **Multi-Step Forms** - wizard-style forms with progress indicator
- **Shareable Links** - encode forms in URL to share with anyone
- **TypeScript Export** - generate TS interfaces from your schema
- **Theme Customizer** - live color picker with CSS export
- **10 Sample Templates** - contact, checkout, job application, etc.
- **5 Framework Exports** - React Hook Form, Formik, Vue, Svelte, HTML
- **Dark/Light Mode** - seamless theme switching

## Quick Start

```bash
git clone https://github.com/chintanshah35/smart-form-factory.git
cd smart-form-factory
npm install
npm run dev
```

Open http://localhost:3000

## Usage

**Option 1: Visual Builder**
Click the wand icon in the header to open the drag & drop builder.

**Option 2: JSON Schema**
Paste a schema in the editor or select a sample from the dropdown.

## Example Schema

```json
{
  "title": "Contact",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": { "type": "string", "title": "Name" },
    "email": { "type": "string", "format": "email" },
    "message": { "type": "string", "x-rows": 4 }
  }
}
```

## Multi-Step Forms

Add `x-step` to group fields into steps:

```json
{
  "properties": {
    "name": { "type": "string", "x-step": 0 },
    "email": { "type": "string", "x-step": 1 }
  }
}
```

## Schema Options

| Option | Description |
|--------|-------------|
| `type` | string, number, integer, boolean |
| `format` | email, url, date, password, tel |
| `enum` | dropdown or radio options |
| `required` | array of required field names |
| `minLength` / `maxLength` | text limits |
| `minimum` / `maximum` | number range |
| `pattern` | regex |
| `x-placeholder` | placeholder text |
| `x-rows` | textarea rows |
| `x-step` | step index for multi-step forms |

## Changelog

### v1.1.0
- Visual form builder with drag & drop
- Multi-step form support
- Shareable URL links
- TypeScript types export
- Theme customizer with live preview
- 10 sample form templates

### v1.0.0
- Initial release
- JSON schema to form generation
- 5 framework exports
- Dark/light mode
- CSS variables export

## Stack

Next.js 14, TypeScript, Tailwind, Zustand, Monaco Editor, Framer Motion

## License

MIT
