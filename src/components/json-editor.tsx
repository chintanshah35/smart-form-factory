'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { 
  Play, 
  RotateCcw, 
  FileJson, 
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { useFormFactoryStore } from '@/lib/store';

export function JsonEditor() {
  const { theme } = useTheme();
  const [isEditorReady, setIsEditorReady] = useState(false);
  const hasInitialized = useRef(false);
  
  const {
    jsonInput,
    setJsonInput,
    parseJsonSchema,
    parseError,
    parsedFields,
    loadSampleSchema,
    reset,
  } = useFormFactoryStore();

  // Auto-parse on mount
  useEffect(() => {
    if (!hasInitialized.current && jsonInput) {
      hasInitialized.current = true;
      parseJsonSchema();
    }
  }, [jsonInput, parseJsonSchema]);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined) {
      setJsonInput(value);
    }
  }, [setJsonInput]);

  const handleEditorMount = useCallback(() => {
    setIsEditorReady(true);
  }, []);

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <FileJson className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-sm">JSON Schema</h2>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sample Schemas Dropdown */}
          <select
            onChange={(e) => loadSampleSchema(e.target.value as string)}
            className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            defaultValue=""
          >
            <option value="" disabled>Load Sample...</option>
            <option value="contact">Contact</option>
            <option value="registration">Registration</option>
            <option value="feedback">Feedback</option>
            <option value="checkout">Checkout</option>
            <option value="jobApplication">Job Application</option>
            <option value="newsletter">Newsletter</option>
            <option value="bugReport">Bug Report</option>
            <option value="eventRSVP">Event RSVP</option>
            <option value="profile">Profile Settings</option>
          </select>

          <button
            onClick={reset}
            className="btn-ghost p-2 rounded-lg text-muted-foreground hover:text-foreground"
            title="Reset to default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        {!isEditorReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}
        <Editor
          height="100%"
          defaultLanguage="json"
          value={jsonInput}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
            automaticLayout: true,
            padding: { top: 16, bottom: 16 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'auto',
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            bracketPairColorization: {
              enabled: true,
            },
          }}
        />
      </div>

      {/* Generate Button & Status */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Status Message */}
        {parseError ? (
          <motion.div 
            className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="break-all">{parseError}</span>
          </motion.div>
        ) : parsedFields.length > 0 ? (
          <motion.div 
            className="flex items-center gap-2 p-3 rounded-lg bg-success/10 text-success text-sm"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{parsedFields.length} field{parsedFields.length !== 1 ? 's' : ''} detected</span>
          </motion.div>
        ) : null}

        {/* Generate Button */}
        <motion.button
          onClick={parseJsonSchema}
          className="btn-primary w-full flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Play className="w-4 h-4" />
          Generate Form
        </motion.button>
      </div>
    </motion.div>
  );
}

