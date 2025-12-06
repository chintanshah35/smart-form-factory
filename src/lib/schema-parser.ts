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
  stepIndex?: number;
}

export interface FormStep {
  title: string;
  description?: string;
  fields: FormField[];
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
  'x-step'?: number;
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
    if (property['x-step'] !== undefined) field.stepIndex = property['x-step'];

    fields.push(field);
  }

  return fields;
}

export function groupFieldsByStep(fields: FormField[]): FormStep[] {
  const hasSteps = fields.some(f => f.stepIndex !== undefined);
  
  if (!hasSteps) {
    return [{ title: 'Form', fields }];
  }

  const stepMap = new Map<number, FormField[]>();
  
  fields.forEach(field => {
    const step = field.stepIndex ?? 0;
    if (!stepMap.has(step)) {
      stepMap.set(step, []);
    }
    stepMap.get(step)!.push(field);
  });

  const sortedSteps = Array.from(stepMap.entries()).sort((a, b) => a[0] - b[0]);
  
  return sortedSteps.map(([index, stepFields], i) => ({
    title: `Step ${i + 1}`,
    fields: stepFields,
  }));
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
  checkout: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Checkout',
    type: 'object',
    required: ['email', 'cardName', 'cardNumber', 'expiry', 'cvv', 'address', 'city', 'zip'],
    properties: {
      email: {
        type: 'string',
        format: 'email',
        title: 'Email',
        'x-placeholder': 'you@example.com',
      },
      cardName: {
        type: 'string',
        title: 'Name on Card',
        'x-placeholder': 'John Doe',
      },
      cardNumber: {
        type: 'string',
        title: 'Card Number',
        pattern: '^[0-9]{16}$',
        'x-placeholder': '4242 4242 4242 4242',
      },
      expiry: {
        type: 'string',
        title: 'Expiry (MM/YY)',
        pattern: '^(0[1-9]|1[0-2])/[0-9]{2}$',
        'x-placeholder': '12/25',
      },
      cvv: {
        type: 'string',
        format: 'password',
        title: 'CVV',
        pattern: '^[0-9]{3,4}$',
        'x-placeholder': '123',
      },
      address: {
        type: 'string',
        title: 'Address',
        'x-placeholder': '123 Main St',
      },
      city: {
        type: 'string',
        title: 'City',
        'x-placeholder': 'San Francisco',
      },
      state: {
        type: 'string',
        title: 'State',
        enum: ['CA', 'NY', 'TX', 'FL', 'WA', 'Other'],
        enumNames: ['California', 'New York', 'Texas', 'Florida', 'Washington', 'Other'],
      },
      zip: {
        type: 'string',
        title: 'ZIP Code',
        pattern: '^[0-9]{5}$',
        'x-placeholder': '94102',
      },
    },
  },
  jobApplication: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Job Application',
    type: 'object',
    required: ['fullName', 'email', 'phone', 'position', 'experience'],
    properties: {
      fullName: {
        type: 'string',
        title: 'Full Name',
        'x-placeholder': 'Jane Smith',
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email',
        'x-placeholder': 'jane@example.com',
      },
      phone: {
        type: 'string',
        format: 'tel',
        title: 'Phone',
        'x-placeholder': '+1 555 123 4567',
      },
      position: {
        type: 'string',
        title: 'Position',
        enum: ['frontend', 'backend', 'fullstack', 'design', 'pm'],
        enumNames: ['Frontend Developer', 'Backend Developer', 'Full Stack', 'Designer', 'Product Manager'],
      },
      experience: {
        type: 'string',
        title: 'Years of Experience',
        enum: ['0-1', '1-3', '3-5', '5-10', '10+'],
        enumNames: ['Less than 1 year', '1-3 years', '3-5 years', '5-10 years', '10+ years'],
      },
      linkedin: {
        type: 'string',
        format: 'url',
        title: 'LinkedIn URL',
        'x-placeholder': 'https://linkedin.com/in/yourprofile',
      },
      portfolio: {
        type: 'string',
        format: 'url',
        title: 'Portfolio URL',
        'x-placeholder': 'https://yoursite.com',
      },
      coverLetter: {
        type: 'string',
        title: 'Cover Letter',
        'x-placeholder': 'Tell us why you want to join...',
        'x-rows': 6,
      },
      startDate: {
        type: 'string',
        format: 'date',
        title: 'Available Start Date',
      },
      remote: {
        type: 'boolean',
        title: 'Open to remote work',
        default: true,
      },
    },
  },
  newsletter: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Newsletter Signup',
    type: 'object',
    required: ['email'],
    properties: {
      firstName: {
        type: 'string',
        title: 'First Name',
        'x-placeholder': 'John',
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email',
        'x-placeholder': 'you@example.com',
      },
      interests: {
        type: 'string',
        title: 'Topics',
        enum: ['tech', 'design', 'business', 'all'],
        enumNames: ['Tech & Engineering', 'Design & UX', 'Business & Startups', 'All Topics'],
      },
      frequency: {
        type: 'string',
        title: 'Frequency',
        enum: ['daily', 'weekly', 'monthly'],
        enumNames: ['Daily Digest', 'Weekly Roundup', 'Monthly Highlights'],
      },
    },
  },
  bugReport: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Bug Report',
    type: 'object',
    required: ['title', 'description', 'severity'],
    properties: {
      title: {
        type: 'string',
        title: 'Bug Title',
        minLength: 5,
        'x-placeholder': 'Button not working on checkout page',
      },
      severity: {
        type: 'string',
        title: 'Severity',
        enum: ['critical', 'high', 'medium', 'low'],
        enumNames: ['Critical - App broken', 'High - Major feature broken', 'Medium - Minor issue', 'Low - Cosmetic'],
      },
      description: {
        type: 'string',
        title: 'Description',
        minLength: 20,
        'x-placeholder': 'Describe what happened...',
        'x-rows': 4,
      },
      stepsToReproduce: {
        type: 'string',
        title: 'Steps to Reproduce',
        'x-placeholder': '1. Go to...\n2. Click on...\n3. See error',
        'x-rows': 4,
      },
      browser: {
        type: 'string',
        title: 'Browser',
        enum: ['chrome', 'firefox', 'safari', 'edge', 'other'],
        enumNames: ['Chrome', 'Firefox', 'Safari', 'Edge', 'Other'],
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Your Email (optional)',
        'x-placeholder': 'you@example.com',
      },
    },
  },
  eventRSVP: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Event RSVP',
    type: 'object',
    required: ['name', 'email', 'attending'],
    properties: {
      name: {
        type: 'string',
        title: 'Your Name',
        'x-placeholder': 'John Doe',
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email',
        'x-placeholder': 'john@example.com',
      },
      attending: {
        type: 'string',
        title: 'Will you attend?',
        enum: ['yes', 'no', 'maybe'],
        enumNames: ['Yes, I\'ll be there', 'No, can\'t make it', 'Maybe'],
      },
      guests: {
        type: 'integer',
        title: 'Number of Guests',
        minimum: 0,
        maximum: 5,
        default: 0,
      },
      dietaryRestrictions: {
        type: 'string',
        title: 'Dietary Restrictions',
        enum: ['none', 'vegetarian', 'vegan', 'gluten-free', 'other'],
        enumNames: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Other'],
      },
      notes: {
        type: 'string',
        title: 'Notes',
        'x-placeholder': 'Anything we should know?',
        'x-rows': 2,
      },
    },
  },
  profile: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Profile Settings',
    type: 'object',
    required: ['displayName', 'email'],
    properties: {
      displayName: {
        type: 'string',
        title: 'Display Name',
        minLength: 2,
        'x-placeholder': 'johndoe',
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email',
        'x-placeholder': 'john@example.com',
      },
      bio: {
        type: 'string',
        title: 'Bio',
        maxLength: 160,
        'x-placeholder': 'Tell us about yourself...',
        'x-rows': 3,
      },
      website: {
        type: 'string',
        format: 'url',
        title: 'Website',
        'x-placeholder': 'https://yoursite.com',
      },
      location: {
        type: 'string',
        title: 'Location',
        'x-placeholder': 'San Francisco, CA',
      },
      timezone: {
        type: 'string',
        title: 'Timezone',
        enum: ['pst', 'mst', 'cst', 'est', 'utc', 'other'],
        enumNames: ['Pacific (PT)', 'Mountain (MT)', 'Central (CT)', 'Eastern (ET)', 'UTC', 'Other'],
      },
      emailNotifications: {
        type: 'boolean',
        title: 'Email notifications',
        default: true,
      },
      publicProfile: {
        type: 'boolean',
        title: 'Make profile public',
        default: false,
      },
    },
  },
  multiStep: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Multi-Step Registration',
    type: 'object',
    required: ['firstName', 'lastName', 'email', 'password', 'plan'],
    properties: {
      firstName: {
        type: 'string',
        title: 'First Name',
        'x-placeholder': 'John',
        'x-step': 0,
      },
      lastName: {
        type: 'string',
        title: 'Last Name',
        'x-placeholder': 'Doe',
        'x-step': 0,
      },
      email: {
        type: 'string',
        format: 'email',
        title: 'Email',
        'x-placeholder': 'john@example.com',
        'x-step': 1,
      },
      password: {
        type: 'string',
        format: 'password',
        title: 'Password',
        minLength: 8,
        'x-step': 1,
      },
      confirmPassword: {
        type: 'string',
        format: 'password',
        title: 'Confirm Password',
        'x-step': 1,
      },
      plan: {
        type: 'string',
        title: 'Select Plan',
        enum: ['free', 'pro', 'enterprise'],
        enumNames: ['Free - $0/mo', 'Pro - $19/mo', 'Enterprise - $99/mo'],
        'x-step': 2,
      },
      cardNumber: {
        type: 'string',
        title: 'Card Number',
        'x-placeholder': '4242 4242 4242 4242',
        'x-step': 2,
      },
      acceptTerms: {
        type: 'boolean',
        title: 'I accept the terms and conditions',
        'x-step': 2,
      },
    },
  },
};

