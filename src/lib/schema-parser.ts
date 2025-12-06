// JSON Schema Parser and Form Field Generator
// Supports JSON Schema Draft 7

import { z } from 'zod';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  required: boolean;
  disabled?: boolean;
  readonly?: boolean;
  defaultValue?: unknown;
  validation: ValidationRule[];
  options?: SelectOption[];
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  format?: string;
  rows?: number;
  accept?: string;
  multiple?: boolean;
}

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'date'
  | 'datetime-local'
  | 'time'
  | 'textarea'
  | 'select'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'color'
  | 'range'
  | 'hidden';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: ValidationType;
  value?: unknown;
  message: string;
}

export type ValidationType =
  | 'required'
  | 'email'
  | 'url'
  | 'min'
  | 'max'
  | 'minLength'
  | 'maxLength'
  | 'pattern'
  | 'custom';

export interface JSONSchema {
  type?: string | string[];
  title?: string;
  description?: string;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
  $schema?: string;
  $id?: string;
  definitions?: Record<string, JSONSchemaProperty>;
}

export interface JSONSchemaProperty {
  type?: string | string[];
  title?: string;
  description?: string;
  default?: unknown;
  enum?: (string | number)[];
  enumNames?: string[];
  const?: unknown;
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  multipleOf?: number;
  readOnly?: boolean;
  writeOnly?: boolean;
  deprecated?: boolean;
  examples?: unknown[];
  // UI extensions
  'x-placeholder'?: string;
  'x-rows'?: number;
  'x-accept'?: string;
  'x-multiple'?: boolean;
  'x-disabled'?: boolean;
  'x-hidden'?: boolean;
  // Nested
  items?: JSONSchemaProperty;
  properties?: Record<string, JSONSchemaProperty>;
  required?: string[];
  oneOf?: JSONSchemaProperty[];
  anyOf?: JSONSchemaProperty[];
  allOf?: JSONSchemaProperty[];
  $ref?: string;
}

// Schema validation
const schemaValidator = z.object({
  type: z.union([z.string(), z.array(z.string())]).optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  properties: z.record(z.any()).optional(),
  required: z.array(z.string()).optional(),
});

// Determine field type from JSON Schema property
function determineFieldType(property: JSONSchemaProperty, name: string): FieldType {
  // Check for hidden field
  if (property['x-hidden']) {
    return 'hidden';
  }

  // Check format first
  if (property.format) {
    const formatMap: Record<string, FieldType> = {
      'email': 'email',
      'uri': 'url',
      'url': 'url',
      'date': 'date',
      'date-time': 'datetime-local',
      'time': 'time',
      'password': 'password',
      'color': 'color',
      'tel': 'tel',
      'phone': 'tel',
    };
    if (formatMap[property.format]) {
      return formatMap[property.format];
    }
  }

  // Check for enum (select or radio)
  if (property.enum) {
    return property.enum.length <= 5 ? 'radio' : 'select';
  }

  // Check type
  const type = Array.isArray(property.type) ? property.type[0] : property.type;

  switch (type) {
    case 'string':
      // Check for textarea hints
      if (property.maxLength && property.maxLength > 100) {
        return 'textarea';
      }
      if (property['x-rows'] && property['x-rows'] > 1) {
        return 'textarea';
      }
      // Check name for common patterns
      if (/email/i.test(name)) return 'email';
      if (/password/i.test(name)) return 'password';
      if (/phone|tel/i.test(name)) return 'tel';
      if (/url|website|link/i.test(name)) return 'url';
      if (/description|bio|message|comment|content/i.test(name)) return 'textarea';
      return 'text';

    case 'number':
    case 'integer':
      if (property.minimum !== undefined && property.maximum !== undefined) {
        // Could be a range slider
        const range = property.maximum - property.minimum;
        if (range <= 100) return 'range';
      }
      return 'number';

    case 'boolean':
      return 'checkbox';

    case 'array':
      if (property.items?.type === 'string' && property['x-accept']) {
        return 'file';
      }
      return 'select';

    default:
      return 'text';
  }
}

// Generate validation rules from JSON Schema property
function generateValidationRules(
  property: JSONSchemaProperty,
  isRequired: boolean
): ValidationRule[] {
  const rules: ValidationRule[] = [];

  if (isRequired) {
    rules.push({
      type: 'required',
      message: 'This field is required',
    });
  }

  if (property.format === 'email') {
    rules.push({
      type: 'email',
      message: 'Please enter a valid email address',
    });
  }

  if (property.format === 'uri' || property.format === 'url') {
    rules.push({
      type: 'url',
      message: 'Please enter a valid URL',
    });
  }

  if (property.minimum !== undefined) {
    rules.push({
      type: 'min',
      value: property.minimum,
      message: `Value must be at least ${property.minimum}`,
    });
  }

  if (property.maximum !== undefined) {
    rules.push({
      type: 'max',
      value: property.maximum,
      message: `Value must be at most ${property.maximum}`,
    });
  }

  if (property.minLength !== undefined) {
    rules.push({
      type: 'minLength',
      value: property.minLength,
      message: `Must be at least ${property.minLength} characters`,
    });
  }

  if (property.maxLength !== undefined) {
    rules.push({
      type: 'maxLength',
      value: property.maxLength,
      message: `Must be at most ${property.maxLength} characters`,
    });
  }

  if (property.pattern) {
    rules.push({
      type: 'pattern',
      value: property.pattern,
      message: `Invalid format`,
    });
  }

  return rules;
}

// Convert enum to select options
function enumToOptions(
  enumValues: (string | number)[],
  enumNames?: string[]
): SelectOption[] {
  return enumValues.map((value, index) => ({
    value: String(value),
    label: enumNames?.[index] || formatLabel(String(value)),
  }));
}

// Format a camelCase or snake_case name to a human-readable label
function formatLabel(name: string): string {
  return name
    // Insert space before uppercase letters
    .replace(/([A-Z])/g, ' $1')
    // Replace underscores and hyphens with spaces
    .replace(/[_-]/g, ' ')
    // Capitalize first letter
    .replace(/^./, (str) => str.toUpperCase())
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Parse JSON Schema and generate form fields
export function parseSchema(schema: JSONSchema): FormField[] {
  // Validate schema structure
  const validation = schemaValidator.safeParse(schema);
  if (!validation.success) {
    throw new Error('Invalid JSON Schema format');
  }

  const fields: FormField[] = [];
  const properties = schema.properties || {};
  const requiredFields = schema.required || [];

  for (const [name, property] of Object.entries(properties)) {
    const isRequired = requiredFields.includes(name);
    const fieldType = determineFieldType(property, name);

    const field: FormField = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      label: property.title || formatLabel(name),
      type: fieldType,
      placeholder: property['x-placeholder'] || property.examples?.[0]?.toString(),
      description: property.description,
      required: isRequired,
      disabled: property['x-disabled'],
      readonly: property.readOnly,
      defaultValue: property.default,
      validation: generateValidationRules(property, isRequired),
      format: property.format,
    };

    // Add type-specific properties
    if (property.enum) {
      field.options = enumToOptions(property.enum, property.enumNames);
    }

    if (property.minimum !== undefined) field.min = property.minimum;
    if (property.maximum !== undefined) field.max = property.maximum;
    if (property.multipleOf !== undefined) field.step = property.multipleOf;
    if (property.minLength !== undefined) field.minLength = property.minLength;
    if (property.maxLength !== undefined) field.maxLength = property.maxLength;
    if (property.pattern) field.pattern = property.pattern;
    if (property['x-rows']) field.rows = property['x-rows'];
    if (property['x-accept']) field.accept = property['x-accept'];
    if (property['x-multiple']) field.multiple = property['x-multiple'];

    fields.push(field);
  }

  return fields;
}

// Generate Zod schema from form fields
export function generateZodSchema(fields: FormField[]): string {
  const zodFields: string[] = [];

  for (const field of fields) {
    let zodType = 'z.string()';

    switch (field.type) {
      case 'email':
        zodType = 'z.string().email()';
        break;
      case 'url':
        zodType = 'z.string().url()';
        break;
      case 'number':
      case 'range':
        zodType = 'z.number()';
        if (field.min !== undefined) zodType += `.min(${field.min})`;
        if (field.max !== undefined) zodType += `.max(${field.max})`;
        break;
      case 'checkbox':
        zodType = 'z.boolean()';
        break;
      case 'date':
      case 'datetime-local':
      case 'time':
        zodType = 'z.string()';
        break;
      case 'select':
      case 'radio':
        if (field.options) {
          const values = field.options.map((o) => `'${o.value}'`).join(', ');
          zodType = `z.enum([${values}])`;
        }
        break;
      default:
        zodType = 'z.string()';
        if (field.minLength) zodType += `.min(${field.minLength})`;
        if (field.maxLength) zodType += `.max(${field.maxLength})`;
        if (field.pattern) zodType += `.regex(/${field.pattern}/)`;
    }

    if (!field.required) {
      zodType += '.optional()';
    }

    zodFields.push(`  ${field.name}: ${zodType}`);
  }

  return `const schema = z.object({\n${zodFields.join(',\n')}\n});`;
}

// Sample schemas for demonstration
export const sampleSchemas: Record<string, JSONSchema> = {
  contact: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Contact Form',
    description: 'A simple contact form',
    type: 'object',
    required: ['name', 'email', 'message'],
    properties: {
      name: {
        type: 'string',
        title: 'Full Name',
        minLength: 2,
        maxLength: 100,
        'x-placeholder': 'John Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email Address',
        'x-placeholder': 'john@example.com',
      },
      phone: {
        type: 'string',
        format: 'tel',
        title: 'Phone Number',
        'x-placeholder': '+1 (555) 123-4567',
      },
      subject: {
        type: 'string',
        title: 'Subject',
        enum: ['general', 'support', 'sales', 'partnership'],
        enumNames: ['General Inquiry', 'Technical Support', 'Sales', 'Partnership'],
      },
      message: {
        type: 'string',
        title: 'Message',
        minLength: 10,
        maxLength: 1000,
        'x-placeholder': 'How can we help you?',
        'x-rows': 4,
      },
      newsletter: {
        type: 'boolean',
        title: 'Subscribe to newsletter',
        default: false,
      },
    },
  },
  registration: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'User Registration',
    description: 'Create a new account',
    type: 'object',
    required: ['username', 'email', 'password', 'confirmPassword', 'acceptTerms'],
    properties: {
      username: {
        type: 'string',
        title: 'Username',
        minLength: 3,
        maxLength: 20,
        pattern: '^[a-zA-Z0-9_]+$',
        'x-placeholder': 'johndoe',
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email Address',
        'x-placeholder': 'john@example.com',
      },
      password: {
        type: 'string',
        format: 'password',
        title: 'Password',
        minLength: 8,
        'x-placeholder': '••••••••',
      },
      confirmPassword: {
        type: 'string',
        format: 'password',
        title: 'Confirm Password',
        'x-placeholder': '••••••••',
      },
      dateOfBirth: {
        type: 'string',
        format: 'date',
        title: 'Date of Birth',
      },
      gender: {
        type: 'string',
        title: 'Gender',
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        enumNames: ['Male', 'Female', 'Other', 'Prefer not to say'],
      },
      acceptTerms: {
        type: 'boolean',
        title: 'I accept the terms and conditions',
      },
    },
  },
  feedback: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Product Feedback',
    description: 'Share your thoughts about our product',
    type: 'object',
    required: ['rating', 'feedback'],
    properties: {
      rating: {
        type: 'integer',
        title: 'Overall Rating',
        minimum: 1,
        maximum: 5,
        default: 3,
      },
      category: {
        type: 'string',
        title: 'Feedback Category',
        enum: ['bug', 'feature', 'improvement', 'other'],
        enumNames: ['Bug Report', 'Feature Request', 'Improvement', 'Other'],
      },
      feedback: {
        type: 'string',
        title: 'Your Feedback',
        minLength: 20,
        maxLength: 2000,
        'x-placeholder': 'Tell us what you think...',
        'x-rows': 5,
      },
      wouldRecommend: {
        type: 'boolean',
        title: 'Would you recommend this product?',
        default: true,
      },
      contactMe: {
        type: 'boolean',
        title: 'I would like to be contacted about my feedback',
        default: false,
      },
    },
  },
};

