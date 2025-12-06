// Code Generator for multiple frameworks
import { FormField, generateZodSchema } from './schema-parser';
import { sanitizeString } from './utils';

export type Framework = 'react-hook-form' | 'formik' | 'vue' | 'svelte' | 'html';

export interface GeneratedCode {
  framework: Framework;
  code: string;
  language: string;
  filename: string;
}

// Sanitize field values for code generation
function sanitizeFieldName(name: string): string {
  return sanitizeString(name).replace(/[^a-zA-Z0-9_]/g, '_');
}

// Generate input element based on field type
function generateInputElement(
  field: FormField,
  framework: Framework,
  indent: string = '        '
): string {
  const name = sanitizeFieldName(field.name);
  const label = sanitizeString(field.label);
  const placeholder = field.placeholder ? sanitizeString(field.placeholder) : '';

  const commonAttrs = `
${indent}id="${field.id}"
${indent}name="${name}"
${indent}${placeholder ? `placeholder="${placeholder}"` : ''}
${indent}${field.required ? 'required' : ''}
${indent}${field.disabled ? 'disabled' : ''}
${indent}${field.readonly ? 'readOnly' : ''}
${indent}aria-describedby="${field.id}-error"`.trim();

  switch (field.type) {
    case 'textarea':
      return `<textarea
${indent}${commonAttrs}
${indent}rows="${field.rows || 4}"
${indent}${field.minLength ? `minLength={${field.minLength}}` : ''}
${indent}${field.maxLength ? `maxLength={${field.maxLength}}` : ''}
${indent}className="form-input"
${indent}/>`;

    case 'select':
      const options = field.options || [];
      return `<select
${indent}${commonAttrs}
${indent}className="form-input"
${indent}>
${indent}  <option value="">Select ${label}...</option>
${options.map(opt => `${indent}  <option value="${sanitizeString(opt.value)}">${sanitizeString(opt.label)}</option>`).join('\n')}
${indent}</select>`;

    case 'radio':
      const radioOptions = field.options || [];
      return `<div className="space-y-2" role="radiogroup" aria-label="${label}">
${radioOptions.map(opt => `${indent}  <label className="flex items-center gap-2">
${indent}    <input
${indent}      type="radio"
${indent}      name="${name}"
${indent}      value="${sanitizeString(opt.value)}"
${indent}      ${field.required ? 'required' : ''}
${indent}      className="form-radio"
${indent}    />
${indent}    <span>${sanitizeString(opt.label)}</span>
${indent}  </label>`).join('\n')}
${indent}</div>`;

    case 'checkbox':
      return `<label className="flex items-center gap-2">
${indent}  <input
${indent}    type="checkbox"
${indent}    id="${field.id}"
${indent}    name="${name}"
${indent}    ${field.defaultValue ? 'defaultChecked' : ''}
${indent}    ${field.disabled ? 'disabled' : ''}
${indent}    className="form-checkbox"
${indent}  />
${indent}  <span>${label}</span>
${indent}</label>`;

    case 'number':
    case 'range':
      return `<input
${indent}type="${field.type}"
${indent}${commonAttrs}
${indent}${field.min !== undefined ? `min={${field.min}}` : ''}
${indent}${field.max !== undefined ? `max={${field.max}}` : ''}
${indent}${field.step ? `step={${field.step}}` : ''}
${indent}className="form-input"
${indent}/>`;

    case 'file':
      return `<input
${indent}type="file"
${indent}${commonAttrs}
${indent}${field.accept ? `accept="${field.accept}"` : ''}
${indent}${field.multiple ? 'multiple' : ''}
${indent}className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary file:text-primary-foreground"
${indent}/>`;

    default:
      return `<input
${indent}type="${field.type}"
${indent}${commonAttrs}
${indent}${field.minLength ? `minLength={${field.minLength}}` : ''}
${indent}${field.maxLength ? `maxLength={${field.maxLength}}` : ''}
${indent}${field.pattern ? `pattern="${field.pattern}"` : ''}
${indent}className="form-input"
${indent}/>`;
  }
}

// Generate React Hook Form code
export function generateReactHookForm(fields: FormField[], formTitle: string): GeneratedCode {
  const zodSchema = generateZodSchema(fields);
  
  const fieldComponents = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    const label = sanitizeString(field.label);
    
    if (field.type === 'checkbox') {
      return `      {/* ${label} */}
      <div className="form-group">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('${name}')}
            className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">${label}</span>
        </label>
        {errors.${name} && (
          <p className="form-error">{errors.${name}?.message}</p>
        )}
      </div>`;
    }

    if (field.type === 'select') {
      const options = field.options || [];
      return `      {/* ${label} */}
      <div className="form-group">
        <label htmlFor="${field.id}" className="form-label">
          ${label}${field.required ? ' *' : ''}
        </label>
        <select
          id="${field.id}"
          {...register('${name}')}
          className="form-input"
          aria-describedby="${field.id}-error"
        >
          <option value="">Select ${label.toLowerCase()}...</option>
${options.map(opt => `          <option value="${sanitizeString(opt.value)}">${sanitizeString(opt.label)}</option>`).join('\n')}
        </select>
        {errors.${name} && (
          <p id="${field.id}-error" className="form-error">{errors.${name}?.message}</p>
        )}
      </div>`;
    }

    if (field.type === 'radio') {
      const options = field.options || [];
      return `      {/* ${label} */}
      <div className="form-group">
        <fieldset>
          <legend className="form-label">${label}${field.required ? ' *' : ''}</legend>
          <div className="space-y-2">
${options.map(opt => `            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                value="${sanitizeString(opt.value)}"
                {...register('${name}')}
                className="w-4 h-4 border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">${sanitizeString(opt.label)}</span>
            </label>`).join('\n')}
          </div>
        </fieldset>
        {errors.${name} && (
          <p className="form-error">{errors.${name}?.message}</p>
        )}
      </div>`;
    }

    if (field.type === 'textarea') {
      return `      {/* ${label} */}
      <div className="form-group">
        <label htmlFor="${field.id}" className="form-label">
          ${label}${field.required ? ' *' : ''}
        </label>
        <textarea
          id="${field.id}"
          {...register('${name}')}
          placeholder="${field.placeholder || ''}"
          rows={${field.rows || 4}}
          className="form-input resize-y"
          aria-describedby="${field.id}-error"
        />
        {errors.${name} && (
          <p id="${field.id}-error" className="form-error">{errors.${name}?.message}</p>
        )}
        ${field.description ? `<p className="text-sm text-muted-foreground mt-1">${sanitizeString(field.description)}</p>` : ''}
      </div>`;
    }

    return `      {/* ${label} */}
      <div className="form-group">
        <label htmlFor="${field.id}" className="form-label">
          ${label}${field.required ? ' *' : ''}
        </label>
        <input
          type="${field.type}"
          id="${field.id}"
          {...register('${name}'${field.type === 'number' ? ', { valueAsNumber: true }' : ''})}
          placeholder="${field.placeholder || ''}"
          className="form-input"
          aria-describedby="${field.id}-error"
          ${field.min !== undefined ? `min={${field.min}}` : ''}
          ${field.max !== undefined ? `max={${field.max}}` : ''}
        />
        {errors.${name} && (
          <p id="${field.id}-error" className="form-error">{errors.${name}?.message}</p>
        )}
        ${field.description ? `<p className="text-sm text-muted-foreground mt-1">${sanitizeString(field.description)}</p>` : ''}
      </div>`;
  }).join('\n\n');

  const code = `'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Validation Schema
${zodSchema}

type FormData = z.infer<typeof schema>;

export function ${formTitle.replace(/\s+/g, '')}Form() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Form submitted:', data);
      // Add your submission logic here
      // await submitForm(data);
      reset();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
${fieldComponents}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary w-full"
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
`;

  return {
    framework: 'react-hook-form',
    code,
    language: 'tsx',
    filename: `${formTitle.replace(/\s+/g, '')}Form.tsx`,
  };
}

// Generate Formik code
export function generateFormik(fields: FormField[], formTitle: string): GeneratedCode {
  const initialValues = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    let defaultValue: string;
    
    switch (field.type) {
      case 'checkbox':
        defaultValue = field.defaultValue ? 'true' : 'false';
        break;
      case 'number':
      case 'range':
        defaultValue = field.defaultValue?.toString() || '0';
        break;
      default:
        defaultValue = field.defaultValue ? `'${field.defaultValue}'` : "''";
    }
    
    return `    ${name}: ${defaultValue}`;
  }).join(',\n');

  const validationRules = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    let yupType = 'Yup.string()';
    
    switch (field.type) {
      case 'email':
        yupType = "Yup.string().email('Invalid email address')";
        break;
      case 'number':
      case 'range':
        yupType = 'Yup.number()';
        if (field.min !== undefined) yupType += `.min(${field.min}, 'Must be at least ${field.min}')`;
        if (field.max !== undefined) yupType += `.max(${field.max}, 'Must be at most ${field.max}')`;
        break;
      case 'checkbox':
        yupType = 'Yup.boolean()';
        break;
      case 'url':
        yupType = "Yup.string().url('Invalid URL')";
        break;
      default:
        yupType = 'Yup.string()';
        if (field.minLength) yupType += `.min(${field.minLength}, 'Must be at least ${field.minLength} characters')`;
        if (field.maxLength) yupType += `.max(${field.maxLength}, 'Must be at most ${field.maxLength} characters')`;
    }
    
    if (field.required) {
      yupType += ".required('This field is required')";
    }
    
    return `  ${name}: ${yupType}`;
  }).join(',\n');

  const fieldComponents = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    const label = sanitizeString(field.label);
    
    if (field.type === 'checkbox') {
      return `        {/* ${label} */}
        <div className="form-group">
          <label className="flex items-center gap-3 cursor-pointer">
            <Field
              type="checkbox"
              name="${name}"
              className="w-5 h-5 rounded border-border"
            />
            <span className="text-sm">${label}</span>
          </label>
          <ErrorMessage name="${name}" component="p" className="form-error" />
        </div>`;
    }

    if (field.type === 'select') {
      const options = field.options || [];
      return `        {/* ${label} */}
        <div className="form-group">
          <label htmlFor="${field.id}" className="form-label">
            ${label}${field.required ? ' *' : ''}
          </label>
          <Field as="select" name="${name}" id="${field.id}" className="form-input">
            <option value="">Select ${label.toLowerCase()}...</option>
${options.map(opt => `            <option value="${sanitizeString(opt.value)}">${sanitizeString(opt.label)}</option>`).join('\n')}
          </Field>
          <ErrorMessage name="${name}" component="p" className="form-error" />
        </div>`;
    }

    if (field.type === 'textarea') {
      return `        {/* ${label} */}
        <div className="form-group">
          <label htmlFor="${field.id}" className="form-label">
            ${label}${field.required ? ' *' : ''}
          </label>
          <Field
            as="textarea"
            name="${name}"
            id="${field.id}"
            placeholder="${field.placeholder || ''}"
            rows={${field.rows || 4}}
            className="form-input resize-y"
          />
          <ErrorMessage name="${name}" component="p" className="form-error" />
        </div>`;
    }

    return `        {/* ${label} */}
        <div className="form-group">
          <label htmlFor="${field.id}" className="form-label">
            ${label}${field.required ? ' *' : ''}
          </label>
          <Field
            type="${field.type}"
            name="${name}"
            id="${field.id}"
            placeholder="${field.placeholder || ''}"
            className="form-input"
          />
          <ErrorMessage name="${name}" component="p" className="form-error" />
        </div>`;
  }).join('\n\n');

  const code = `'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Validation Schema
const validationSchema = Yup.object({
${validationRules}
});

// Initial Values
const initialValues = {
${initialValues}
};

export function ${formTitle.replace(/\s+/g, '')}Form() {
  const handleSubmit = async (values: typeof initialValues, { setSubmitting, resetForm }: any) => {
    try {
      console.log('Form submitted:', values);
      // Add your submission logic here
      // await submitForm(values);
      resetForm();
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-6">
${fieldComponents}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </Form>
      )}
    </Formik>
  );
}
`;

  return {
    framework: 'formik',
    code,
    language: 'tsx',
    filename: `${formTitle.replace(/\s+/g, '')}Form.tsx`,
  };
}

// Generate Vue 3 Composition API code
export function generateVue(fields: FormField[], formTitle: string): GeneratedCode {
  const formDataFields = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    let defaultValue: string;
    
    switch (field.type) {
      case 'checkbox':
        defaultValue = field.defaultValue ? 'true' : 'false';
        break;
      case 'number':
      case 'range':
        defaultValue = field.defaultValue?.toString() || '0';
        break;
      default:
        defaultValue = field.defaultValue ? `'${field.defaultValue}'` : "''";
    }
    
    return `  ${name}: ${defaultValue}`;
  }).join(',\n');

  const validationRules = fields.filter(f => f.required).map(field => {
    const name = sanitizeFieldName(field.name);
    return `  if (!formData.${name}) errors.${name} = '${field.label} is required';`;
  }).join('\n');

  const fieldComponents = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    const label = sanitizeString(field.label);
    
    if (field.type === 'checkbox') {
      return `    <!-- ${label} -->
    <div class="form-group">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          v-model="formData.${name}"
          class="w-5 h-5 rounded border-border"
        />
        <span class="text-sm">${label}</span>
      </label>
      <p v-if="errors.${name}" class="form-error">{{ errors.${name} }}</p>
    </div>`;
    }

    if (field.type === 'select') {
      const options = field.options || [];
      return `    <!-- ${label} -->
    <div class="form-group">
      <label for="${field.id}" class="form-label">
        ${label}${field.required ? ' *' : ''}
      </label>
      <select
        id="${field.id}"
        v-model="formData.${name}"
        class="form-input"
      >
        <option value="">Select ${label.toLowerCase()}...</option>
${options.map(opt => `        <option value="${sanitizeString(opt.value)}">${sanitizeString(opt.label)}</option>`).join('\n')}
      </select>
      <p v-if="errors.${name}" class="form-error">{{ errors.${name} }}</p>
    </div>`;
    }

    if (field.type === 'textarea') {
      return `    <!-- ${label} -->
    <div class="form-group">
      <label for="${field.id}" class="form-label">
        ${label}${field.required ? ' *' : ''}
      </label>
      <textarea
        id="${field.id}"
        v-model="formData.${name}"
        placeholder="${field.placeholder || ''}"
        rows="${field.rows || 4}"
        class="form-input resize-y"
      ></textarea>
      <p v-if="errors.${name}" class="form-error">{{ errors.${name} }}</p>
    </div>`;
    }

    return `    <!-- ${label} -->
    <div class="form-group">
      <label for="${field.id}" class="form-label">
        ${label}${field.required ? ' *' : ''}
      </label>
      <input
        type="${field.type}"
        id="${field.id}"
        v-model="formData.${name}"
        placeholder="${field.placeholder || ''}"
        class="form-input"
      />
      <p v-if="errors.${name}" class="form-error">{{ errors.${name} }}</p>
    </div>`;
  }).join('\n\n');

  const code = `<script setup lang="ts">
import { ref, reactive } from 'vue';

// Form Data
const formData = reactive({
${formDataFields}
});

// Validation Errors
const errors = reactive<Record<string, string>>({});
const isSubmitting = ref(false);

// Validation Function
function validate(): boolean {
  // Clear previous errors
  Object.keys(errors).forEach(key => delete errors[key]);
  
${validationRules}

  return Object.keys(errors).length === 0;
}

// Submit Handler
async function handleSubmit() {
  if (!validate()) return;
  
  isSubmitting.value = true;
  
  try {
    console.log('Form submitted:', formData);
    // Add your submission logic here
    // await submitForm(formData);
    
    // Reset form
    Object.keys(formData).forEach(key => {
      (formData as any)[key] = '';
    });
  } catch (error) {
    console.error('Submission error:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
${fieldComponents}

    <button
      type="submit"
      :disabled="isSubmitting"
      class="btn-primary w-full"
    >
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
    </button>
  </form>
</template>

<style scoped>
.form-group {
  @apply space-y-2;
}

.form-label {
  @apply text-sm font-medium text-foreground/90;
}

.form-input {
  @apply w-full px-4 py-3 bg-input/50 border border-border rounded-lg
         transition-all duration-200 ease-out
         placeholder:text-muted-foreground/60
         hover:border-primary/50 hover:bg-input/70
         focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20;
}

.form-error {
  @apply text-destructive text-sm;
}

.btn-primary {
  @apply px-6 py-3 bg-primary text-primary-foreground font-medium rounded-lg
         transition-all duration-200 ease-out
         hover:bg-primary/90 hover:shadow-lg
         disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
`;

  return {
    framework: 'vue',
    code,
    language: 'vue',
    filename: `${formTitle.replace(/\s+/g, '')}Form.vue`,
  };
}

// Generate Svelte code
export function generateSvelte(fields: FormField[], formTitle: string): GeneratedCode {
  const formDataFields = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    let defaultValue: string;
    
    switch (field.type) {
      case 'checkbox':
        defaultValue = field.defaultValue ? 'true' : 'false';
        break;
      case 'number':
      case 'range':
        defaultValue = field.defaultValue?.toString() || '0';
        break;
      default:
        defaultValue = field.defaultValue ? `'${field.defaultValue}'` : "''";
    }
    
    return `  let ${name} = ${defaultValue};`;
  }).join('\n');

  const resetFields = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    switch (field.type) {
      case 'checkbox':
        return `    ${name} = false;`;
      case 'number':
      case 'range':
        return `    ${name} = 0;`;
      default:
        return `    ${name} = '';`;
    }
  }).join('\n');

  const fieldComponents = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    const label = sanitizeString(field.label);
    
    if (field.type === 'checkbox') {
      return `  <!-- ${label} -->
  <div class="form-group">
    <label class="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        bind:checked={${name}}
        class="w-5 h-5 rounded border-border"
      />
      <span class="text-sm">${label}</span>
    </label>
    {#if errors.${name}}
      <p class="form-error">{errors.${name}}</p>
    {/if}
  </div>`;
    }

    if (field.type === 'select') {
      const options = field.options || [];
      return `  <!-- ${label} -->
  <div class="form-group">
    <label for="${field.id}" class="form-label">
      ${label}${field.required ? ' *' : ''}
    </label>
    <select
      id="${field.id}"
      bind:value={${name}}
      class="form-input"
    >
      <option value="">Select ${label.toLowerCase()}...</option>
${options.map(opt => `      <option value="${sanitizeString(opt.value)}">${sanitizeString(opt.label)}</option>`).join('\n')}
    </select>
    {#if errors.${name}}
      <p class="form-error">{errors.${name}}</p>
    {/if}
  </div>`;
    }

    if (field.type === 'textarea') {
      return `  <!-- ${label} -->
  <div class="form-group">
    <label for="${field.id}" class="form-label">
      ${label}${field.required ? ' *' : ''}
    </label>
    <textarea
      id="${field.id}"
      bind:value={${name}}
      placeholder="${field.placeholder || ''}"
      rows="${field.rows || 4}"
      class="form-input resize-y"
    ></textarea>
    {#if errors.${name}}
      <p class="form-error">{errors.${name}}</p>
    {/if}
  </div>`;
    }

    return `  <!-- ${label} -->
  <div class="form-group">
    <label for="${field.id}" class="form-label">
      ${label}${field.required ? ' *' : ''}
    </label>
    <input
      type="${field.type}"
      id="${field.id}"
      bind:value={${name}}
      placeholder="${field.placeholder || ''}"
      class="form-input"
    />
    {#if errors.${name}}
      <p class="form-error">{errors.${name}}</p>
    {/if}
  </div>`;
  }).join('\n\n');

  const validationRules = fields.filter(f => f.required).map(field => {
    const name = sanitizeFieldName(field.name);
    return `    if (!${name}) newErrors.${name} = '${field.label} is required';`;
  }).join('\n');

  const code = `<script lang="ts">
  // Form Data
${formDataFields}

  // State
  let errors: Record<string, string> = {};
  let isSubmitting = false;

  // Validation
  function validate(): boolean {
    const newErrors: Record<string, string> = {};
    
${validationRules}

    errors = newErrors;
    return Object.keys(errors).length === 0;
  }

  // Submit Handler
  async function handleSubmit() {
    if (!validate()) return;
    
    isSubmitting = true;
    
    try {
      console.log('Form submitted:', { ${fields.map(f => sanitizeFieldName(f.name)).join(', ')} });
      // Add your submission logic here
      
      // Reset form
${resetFields}
      errors = {};
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      isSubmitting = false;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="space-y-6">
${fieldComponents}

  <button
    type="submit"
    disabled={isSubmitting}
    class="btn-primary w-full"
  >
    {isSubmitting ? 'Submitting...' : 'Submit'}
  </button>
</form>

<style>
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--foreground);
  }

  .form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--input);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    transition: all 0.2s ease;
  }

  .form-input:hover {
    border-color: var(--primary);
  }

  .form-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary), 0.2);
  }

  .form-error {
    color: var(--destructive);
    font-size: 0.875rem;
  }

  .btn-primary {
    padding: 0.75rem 1.5rem;
    background: var(--primary);
    color: var(--primary-foreground);
    font-weight: 500;
    border-radius: var(--radius);
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
  }

  .btn-primary:hover:not(:disabled) {
    opacity: 0.9;
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
`;

  return {
    framework: 'svelte',
    code,
    language: 'svelte',
    filename: `${formTitle.replace(/\s+/g, '')}Form.svelte`,
  };
}

// Generate Plain HTML code
export function generateHTML(fields: FormField[], formTitle: string): GeneratedCode {
  const fieldComponents = fields.map(field => {
    const name = sanitizeFieldName(field.name);
    const label = sanitizeString(field.label);
    const requiredAttr = field.required ? 'required' : '';
    const ariaRequired = field.required ? 'aria-required="true"' : '';
    
    if (field.type === 'checkbox') {
      return `    <!-- ${label} -->
    <div class="form-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          name="${name}"
          ${field.defaultValue ? 'checked' : ''}
        />
        <span>${label}</span>
      </label>
    </div>`;
    }

    if (field.type === 'select') {
      const options = field.options || [];
      return `    <!-- ${label} -->
    <div class="form-group">
      <label for="${field.id}" class="form-label">
        ${label}${field.required ? ' <span class="required">*</span>' : ''}
      </label>
      <select
        id="${field.id}"
        name="${name}"
        class="form-input"
        ${requiredAttr}
        ${ariaRequired}
      >
        <option value="">Select ${label.toLowerCase()}...</option>
${options.map(opt => `        <option value="${sanitizeString(opt.value)}">${sanitizeString(opt.label)}</option>`).join('\n')}
      </select>
    </div>`;
    }

    if (field.type === 'radio') {
      const options = field.options || [];
      return `    <!-- ${label} -->
    <fieldset class="form-group">
      <legend class="form-label">${label}${field.required ? ' <span class="required">*</span>' : ''}</legend>
      <div class="radio-group">
${options.map(opt => `        <label class="radio-label">
          <input
            type="radio"
            name="${name}"
            value="${sanitizeString(opt.value)}"
            ${requiredAttr}
          />
          <span>${sanitizeString(opt.label)}</span>
        </label>`).join('\n')}
      </div>
    </fieldset>`;
    }

    if (field.type === 'textarea') {
      return `    <!-- ${label} -->
    <div class="form-group">
      <label for="${field.id}" class="form-label">
        ${label}${field.required ? ' <span class="required">*</span>' : ''}
      </label>
      <textarea
        id="${field.id}"
        name="${name}"
        placeholder="${field.placeholder || ''}"
        rows="${field.rows || 4}"
        class="form-input"
        ${requiredAttr}
        ${ariaRequired}
        ${field.minLength ? `minlength="${field.minLength}"` : ''}
        ${field.maxLength ? `maxlength="${field.maxLength}"` : ''}
      ></textarea>
    </div>`;
    }

    return `    <!-- ${label} -->
    <div class="form-group">
      <label for="${field.id}" class="form-label">
        ${label}${field.required ? ' <span class="required">*</span>' : ''}
      </label>
      <input
        type="${field.type}"
        id="${field.id}"
        name="${name}"
        placeholder="${field.placeholder || ''}"
        class="form-input"
        ${requiredAttr}
        ${ariaRequired}
        ${field.min !== undefined ? `min="${field.min}"` : ''}
        ${field.max !== undefined ? `max="${field.max}"` : ''}
        ${field.pattern ? `pattern="${field.pattern}"` : ''}
      />
    </div>`;
  }).join('\n\n');

  const code = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${formTitle}</title>
  <style>
    /* CSS Variables for Easy Theming */
    :root {
      --primary: #f97316;
      --primary-foreground: #ffffff;
      --background: #faf9f7;
      --foreground: #1a1a1a;
      --card: #ffffff;
      --border: #e5e5e5;
      --input: #f5f5f5;
      --muted: #737373;
      --destructive: #ef4444;
      --radius: 0.5rem;
      --shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    /* Dark mode */
    @media (prefers-color-scheme: dark) {
      :root {
        --primary: #14b8a6;
        --primary-foreground: #0f172a;
        --background: #0f172a;
        --foreground: #f1f5f9;
        --card: #1e293b;
        --border: #334155;
        --input: #1e293b;
        --muted: #94a3b8;
        --destructive: #f87171;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--background);
      color: var(--foreground);
      line-height: 1.6;
    }

    .form-container {
      max-width: 32rem;
      margin: 2rem auto;
      padding: 2rem;
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }

    .form-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      margin-bottom: 0.5rem;
    }

    .required {
      color: var(--destructive);
    }

    .form-input {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      background: var(--input);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-input:hover {
      border-color: var(--primary);
    }

    .form-input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
    }

    textarea.form-input {
      resize: vertical;
      min-height: 100px;
    }

    .checkbox-label,
    .radio-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    input[type="checkbox"],
    input[type="radio"] {
      width: 1.25rem;
      height: 1.25rem;
      accent-color: var(--primary);
    }

    .btn-submit {
      width: 100%;
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      color: var(--primary-foreground);
      background: var(--primary);
      border: none;
      border-radius: var(--radius);
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
    }

    .btn-submit:hover {
      opacity: 0.9;
    }

    .btn-submit:active {
      transform: scale(0.98);
    }

    .btn-submit:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Validation styles */
    .form-input:invalid:not(:placeholder-shown) {
      border-color: var(--destructive);
    }

    .error-message {
      color: var(--destructive);
      font-size: 0.875rem;
      margin-top: 0.25rem;
      display: none;
    }

    .form-input:invalid:not(:placeholder-shown) + .error-message {
      display: block;
    }
  </style>
</head>
<body>
  <div class="form-container">
    <h1 class="form-title">${formTitle}</h1>
    
    <form id="form" novalidate>
${fieldComponents}

      <button type="submit" class="btn-submit">
        Submit
      </button>
    </form>
  </div>

  <script>
    const form = document.getElementById('form');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Check validity
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      console.log('Form submitted:', data);
      
      // Add your submission logic here
      // await fetch('/api/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data)
      // });
      
      // Reset form
      form.reset();
      alert('Form submitted successfully!');
    });
  </script>
</body>
</html>
`;

  return {
    framework: 'html',
    code,
    language: 'html',
    filename: `${formTitle.toLowerCase().replace(/\s+/g, '-')}.html`,
  };
}

// Main generator function
export function generateCode(
  fields: FormField[],
  framework: Framework,
  formTitle: string = 'Form'
): GeneratedCode {
  switch (framework) {
    case 'react-hook-form':
      return generateReactHookForm(fields, formTitle);
    case 'formik':
      return generateFormik(fields, formTitle);
    case 'vue':
      return generateVue(fields, formTitle);
    case 'svelte':
      return generateSvelte(fields, formTitle);
    case 'html':
      return generateHTML(fields, formTitle);
    default:
      return generateReactHookForm(fields, formTitle);
  }
}

// Generate CSS variables export
export function generateCSSVariables(): string {
  return `/* Smart Form Factory - CSS Variables for Theming */

:root {
  /* Light Theme - Coral Sunset */
  --primary: 16 85% 55%;           /* Coral orange */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 200 70% 50%;        /* Ocean blue */
  --secondary-foreground: 0 0% 100%;
  
  --accent: 340 75% 55%;           /* Rose pink */
  --accent-foreground: 0 0% 100%;
  
  --background: 30 25% 98%;
  --foreground: 240 10% 10%;
  
  --card: 30 20% 99%;
  --card-foreground: 240 10% 10%;
  
  --muted: 30 15% 93%;
  --muted-foreground: 240 5% 45%;
  
  --border: 30 15% 85%;
  --input: 30 15% 85%;
  --ring: 16 85% 55%;
  
  --destructive: 0 72% 51%;
  --destructive-foreground: 0 0% 100%;
  
  --success: 142 72% 40%;
  --success-foreground: 0 0% 100%;
  
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  
  --radius: 0.75rem;
}

/* Dark Theme - Midnight Ocean */
[data-theme="dark"],
.dark {
  --primary: 170 80% 45%;          /* Teal */
  --primary-foreground: 230 25% 8%;
  
  --secondary: 280 65% 60%;        /* Purple */
  --secondary-foreground: 0 0% 100%;
  
  --accent: 45 95% 55%;            /* Gold */
  --accent-foreground: 230 25% 8%;
  
  --background: 230 25% 8%;
  --foreground: 210 20% 95%;
  
  --card: 230 25% 11%;
  --card-foreground: 210 20% 95%;
  
  --muted: 230 20% 18%;
  --muted-foreground: 210 15% 60%;
  
  --border: 230 20% 20%;
  --input: 230 20% 20%;
  --ring: 170 80% 45%;
  
  --destructive: 0 72% 55%;
  --destructive-foreground: 0 0% 100%;
  
  --success: 142 72% 45%;
  --success-foreground: 0 0% 100%;
  
  --warning: 38 92% 55%;
  --warning-foreground: 0 0% 0%;
}

/* Form Styles */
.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: hsl(var(--foreground) / 0.9);
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: hsl(var(--input) / 0.5);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  color: hsl(var(--foreground));
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input::placeholder {
  color: hsl(var(--muted-foreground) / 0.6);
}

.form-input:hover {
  border-color: hsl(var(--primary) / 0.5);
  background: hsl(var(--input) / 0.7);
}

.form-input:focus {
  outline: none;
  border-color: hsl(var(--primary));
  background: hsl(var(--card));
  box-shadow: 0 0 0 3px hsl(var(--primary) / 0.2);
}

.form-error {
  color: hsl(var(--destructive));
  font-size: 0.875rem;
  margin-top: 0.375rem;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  font-weight: 500;
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: hsl(var(--primary) / 0.9);
  box-shadow: 0 10px 25px hsl(var(--primary) / 0.25);
}

.btn-primary:active {
  transform: scale(0.98);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;
}

