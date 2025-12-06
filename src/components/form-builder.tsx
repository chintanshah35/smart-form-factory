'use client';

import { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  GripVertical,
  Trash2,
  Type,
  Mail,
  Hash,
  Calendar,
  CheckSquare,
  List,
  AlignLeft,
  X,
  Wand2
} from 'lucide-react';
import { useFormFactoryStore } from '@/lib/store';
import { cn } from '@/lib/utils';

interface BuilderField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

const fieldTypes = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'textarea', label: 'Textarea', icon: AlignLeft },
];

interface FormBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormBuilder({ isOpen, onClose }: FormBuilderProps) {
  const [fields, setFields] = useState<BuilderField[]>([]);
  const [formTitle, setFormTitle] = useState('My Form');
  const { setJsonInput, parseJsonSchema } = useFormFactoryStore();

  const addField = (type: string) => {
    const newField: BuilderField = {
      id: `field_${Date.now()}`,
      type,
      label: `${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
      required: false,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updates: Partial<BuilderField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
  };

  const generateSchema = () => {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    fields.forEach(field => {
      const name = field.label.toLowerCase().replace(/\s+/g, '_');
      
      const prop: Record<string, unknown> = {
        type: field.type === 'checkbox' ? 'boolean' : 
              field.type === 'number' ? 'number' : 'string',
        title: field.label,
      };

      if (field.placeholder) {
        prop['x-placeholder'] = field.placeholder;
      }

      if (field.type === 'email') {
        prop.format = 'email';
      } else if (field.type === 'date') {
        prop.format = 'date';
      } else if (field.type === 'textarea') {
        prop['x-rows'] = 4;
      } else if (field.type === 'select') {
        prop.enum = ['option1', 'option2', 'option3'];
        prop.enumNames = ['Option 1', 'Option 2', 'Option 3'];
      }

      properties[name] = prop;

      if (field.required) {
        required.push(name);
      }
    });

    const schema = {
      $schema: 'http://json-schema.org/draft-07/schema#',
      title: formTitle,
      type: 'object',
      required: required.length > 0 ? required : undefined,
      properties,
    };

    const json = JSON.stringify(schema, null, 2);
    setJsonInput(json);
    parseJsonSchema();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />
              <h2 className="font-semibold">Form Builder</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 space-y-4">
            {/* Form Title */}
            <div>
              <label className="form-label">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="form-input"
                placeholder="Enter form title..."
              />
            </div>

            {/* Field Types */}
            <div>
              <label className="form-label">Add Fields</label>
              <div className="flex flex-wrap gap-2">
                {fieldTypes.map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => addField(type)}
                    className="flex items-center gap-2 px-3 py-2 bg-muted hover:bg-muted/80 rounded-lg text-sm transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Fields List */}
            <div>
              <label className="form-label">Fields ({fields.length})</label>
              {fields.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center border border-dashed border-border rounded-lg">
                  Click buttons above to add fields
                </p>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={fields}
                  onReorder={setFields}
                  className="space-y-2"
                >
                  {fields.map((field) => (
                    <Reorder.Item
                      key={field.id}
                      value={field}
                      className="bg-muted/50 border border-border rounded-lg p-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="cursor-grab mt-1">
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded"
                              placeholder="Field label"
                            />
                            <span className="px-2 py-1 text-xs bg-primary/10 text-primary rounded">
                              {field.type}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <input
                              type="text"
                              value={field.placeholder || ''}
                              onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                              className="flex-1 px-2 py-1 text-sm bg-background border border-border rounded"
                              placeholder="Placeholder (optional)"
                            />
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                className="rounded"
                              />
                              Required
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={() => removeField(field.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </Reorder.Item>
                  ))}
                </Reorder.Group>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <button onClick={onClose} className="btn-ghost px-4 py-2">
              Cancel
            </button>
            <button
              onClick={generateSchema}
              disabled={fields.length === 0}
              className={cn(
                'btn-primary px-4 py-2 flex items-center gap-2',
                fields.length === 0 && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Wand2 className="w-4 h-4" />
              Generate Form
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

