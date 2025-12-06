'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Highlight, themes } from 'prism-react-renderer';
import { useTheme } from 'next-themes';
import { 
  Code2, 
  Copy, 
  Check, 
  Download,
  FileCode,
  Palette,
  FileType
} from 'lucide-react';
import { useFormFactoryStore } from '@/lib/store';
import { Framework, generateCSSVariables, generateTypeScriptTypes } from '@/lib/code-generator';
import { copyToClipboard } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

const frameworkOptions: { value: Framework; label: string; icon: string }[] = [
  { value: 'react-hook-form', label: 'React Hook Form', icon: '⚛️' },
  { value: 'formik', label: 'Formik', icon: '📝' },
  { value: 'vue', label: 'Vue 3', icon: '💚' },
  { value: 'svelte', label: 'Svelte', icon: '🔥' },
  { value: 'html', label: 'Plain HTML', icon: '🌐' },
];

type ViewMode = 'code' | 'css' | 'types';

export function CodeOutput() {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('code');
  
  const {
    generatedCode,
    selectedFramework,
    setSelectedFramework,
    parsedFields,
    formTitle,
  } = useFormFactoryStore();

  const getDisplayCode = () => {
    switch (viewMode) {
      case 'css':
        return generateCSSVariables();
      case 'types':
        return generateTypeScriptTypes(parsedFields, formTitle);
      default:
        return generatedCode?.code || '';
    }
  };

  const getFilename = () => {
    switch (viewMode) {
      case 'css':
        return 'theme-variables.css';
      case 'types':
        return 'types.ts';
      default:
        return generatedCode?.filename || 'form.tsx';
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(getDisplayCode());
    if (success) {
      setCopied(true);
      toast({ title: 'Copied!', description: 'Code copied to clipboard' });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({ title: 'Failed to copy', variant: 'destructive' });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([getDisplayCode()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = getFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: 'Downloaded!', description: `${getFilename()} saved` });
  };

  const getLanguage = () => {
    if (viewMode === 'css') return 'css';
    if (viewMode === 'types') return 'typescript';
    switch (generatedCode?.language) {
      case 'tsx':
      case 'jsx':
        return 'tsx';
      case 'vue':
      case 'svelte':
      case 'html':
        return 'markup';
      default:
        return 'typescript';
    }
  };

  const displayCode = getDisplayCode();

  if (parsedFields.length === 0) {
    return (
      <motion.div 
        className="h-full flex flex-col items-center justify-center p-8 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Code2 className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Code Generated</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          Generate a form from your JSON schema to see the output code for your selected framework.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Code Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-accent" />
          <h2 className="font-semibold text-sm">Generated Code</h2>
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Framework Selector */}
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value as Framework)}
            className="text-sm bg-muted border border-border rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          >
            {frameworkOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>

          {/* Toggle TypeScript Types */}
          <button
            onClick={() => setViewMode(viewMode === 'types' ? 'code' : 'types')}
            className={`btn-ghost p-2 rounded-lg transition-colors ${
              viewMode === 'types' ? 'bg-secondary/20 text-secondary' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="View TypeScript Types"
          >
            <FileType className="w-4 h-4" />
          </button>

          {/* Toggle CSS Variables */}
          <button
            onClick={() => setViewMode(viewMode === 'css' ? 'code' : 'css')}
            className={`btn-ghost p-2 rounded-lg transition-colors ${
              viewMode === 'css' ? 'bg-accent/20 text-accent' : 'text-muted-foreground hover:text-foreground'
            }`}
            title="View CSS Variables"
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* Copy Button */}
          <motion.button
            onClick={handleCopy}
            className="btn-ghost p-2 rounded-lg text-muted-foreground hover:text-foreground"
            title="Copy to clipboard"
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Check className="w-4 h-4 text-success" />
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Copy className="w-4 h-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="btn-ghost p-2 rounded-lg text-muted-foreground hover:text-foreground"
            title="Download file"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* File Name Badge */}
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileCode className="w-4 h-4" />
          <span className="font-mono">{getFilename()}</span>
        </div>
      </div>

      {/* Code Display */}
      <div className="flex-1 overflow-auto">
        <Highlight
          theme={theme === 'dark' ? themes.nightOwl : themes.github}
          code={displayCode}
          language={getLanguage()}
        >
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={`${className} p-4 text-sm font-mono leading-relaxed overflow-x-auto`}
              style={{
                ...style,
                background: 'transparent',
                margin: 0,
              }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  <span className="table-cell pr-4 text-muted-foreground/50 select-none text-right w-12">
                    {i + 1}
                  </span>
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>

      {/* Footer with Quick Actions */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="badge-primary">
              {frameworkOptions.find(f => f.value === selectedFramework)?.label}
            </span>
            <span>•</span>
            <span>{parsedFields.length} fields</span>
            <span>•</span>
            <span>{displayCode.split('\n').length} lines</span>
          </div>
          
          <motion.button
            onClick={handleCopy}
            className="btn-secondary text-sm py-2 px-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy Code
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

