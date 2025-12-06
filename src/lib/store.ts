import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Framework, GeneratedCode, generateCode } from './code-generator';
import { FormField, JSONSchema, parseSchema, sampleSchemas } from './schema-parser';
import { safeJSONParse } from './utils';

interface FormFactoryState {
  // Schema
  jsonInput: string;
  parsedFields: FormField[];
  parseError: string | null;
  formTitle: string;

  // Code generation
  selectedFramework: Framework;
  generatedCode: GeneratedCode | null;

  // UI State
  activeTab: 'editor' | 'preview' | 'code';
  showPreview: boolean;

  // Actions
  setJsonInput: (json: string) => void;
  parseJsonSchema: () => void;
  setSelectedFramework: (framework: Framework) => void;
  setFormTitle: (title: string) => void;
  setActiveTab: (tab: 'editor' | 'preview' | 'code') => void;
  loadSampleSchema: (name: keyof typeof sampleSchemas) => void;
  generateFormCode: () => void;
  reset: () => void;
}

const defaultSchema = JSON.stringify(sampleSchemas.contact, null, 2);

export const useFormFactoryStore = create<FormFactoryState>()(
  persist(
    (set, get) => ({
      // Initial state
      jsonInput: defaultSchema,
      parsedFields: [],
      parseError: null,
      formTitle: 'Contact Form',
      selectedFramework: 'react-hook-form',
      generatedCode: null,
      activeTab: 'editor',
      showPreview: true,

      // Actions
      setJsonInput: (json: string) => {
        set({ jsonInput: json, parseError: null });
      },

      parseJsonSchema: () => {
        const { jsonInput, selectedFramework, formTitle } = get();
        
        // Parse JSON safely
        const parseResult = safeJSONParse<JSONSchema>(jsonInput);
        
        if (!parseResult.success) {
          set({ parseError: parseResult.error, parsedFields: [], generatedCode: null });
          return;
        }

        try {
          const schema = parseResult.data;
          const fields = parseSchema(schema);
          const title = schema.title || formTitle;
          const code = generateCode(fields, selectedFramework, title);
          
          set({
            parsedFields: fields,
            parseError: null,
            formTitle: title,
            generatedCode: code,
          });
        } catch (error) {
          set({
            parseError: error instanceof Error ? error.message : 'Failed to parse schema',
            parsedFields: [],
            generatedCode: null,
          });
        }
      },

      setSelectedFramework: (framework: Framework) => {
        set({ selectedFramework: framework });
        // Regenerate code with new framework
        const { parsedFields, formTitle } = get();
        if (parsedFields.length > 0) {
          const code = generateCode(parsedFields, framework, formTitle);
          set({ generatedCode: code });
        }
      },

      setFormTitle: (title: string) => {
        set({ formTitle: title });
        // Regenerate code with new title
        const { parsedFields, selectedFramework } = get();
        if (parsedFields.length > 0) {
          const code = generateCode(parsedFields, selectedFramework, title);
          set({ generatedCode: code });
        }
      },

      setActiveTab: (tab: 'editor' | 'preview' | 'code') => {
        set({ activeTab: tab });
      },

      loadSampleSchema: (name: keyof typeof sampleSchemas) => {
        const schema = sampleSchemas[name];
        if (schema) {
          const jsonString = JSON.stringify(schema, null, 2);
          set({ 
            jsonInput: jsonString,
            formTitle: schema.title || 'Form',
            parseError: null 
          });
          // Auto-parse after loading
          setTimeout(() => get().parseJsonSchema(), 0);
        }
      },

      generateFormCode: () => {
        const { parsedFields, selectedFramework, formTitle } = get();
        if (parsedFields.length > 0) {
          const code = generateCode(parsedFields, selectedFramework, formTitle);
          set({ generatedCode: code });
        }
      },

      reset: () => {
        set({
          jsonInput: defaultSchema,
          parsedFields: [],
          parseError: null,
          formTitle: 'Contact Form',
          generatedCode: null,
          activeTab: 'editor',
        });
      },
    }),
    {
      name: 'form-factory-storage',
      partialize: (state) => ({
        jsonInput: state.jsonInput,
        selectedFramework: state.selectedFramework,
        formTitle: state.formTitle,
      }),
    }
  )
);

