# Smart Form Factory

Paste a JSON schema, get a working form. Supports React Hook Form, Formik, Vue, Svelte, and plain HTML.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square)

## Quick Start

```bash
git clone https://github.com/chintanshah35/smart-form-factory.git
cd smart-form-factory
npm install
npm run dev
```

Open http://localhost:3000

## Example

```json
{
  "title": "Contact Form",
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "title": "Name",
      "minLength": 2
    },
    "email": {
      "type": "string",
      "format": "email"
    },
    "message": {
      "type": "string",
      "x-rows": 4
    }
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

## Stack

Next.js 14, TypeScript, Tailwind, Zustand, Monaco Editor, Framer Motion

## License

MIT
