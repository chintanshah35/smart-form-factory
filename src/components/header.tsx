'use client';

import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { 
  Sun, 
  Moon, 
  Github, 
  Sparkles,
  Zap,
  Share2,
  Check,
  Wand2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormFactoryStore } from '@/lib/store';
import { encodeSchema, copyToClipboard } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';
import { FormBuilder } from '@/components/form-builder';

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const { jsonInput, parsedFields } = useFormFactoryStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleShare = async () => {
    if (!parsedFields.length) {
      toast({ title: 'Generate a form first', variant: 'destructive' });
      return;
    }
    
    const encoded = encodeSchema(jsonInput);
    const url = `${window.location.origin}?s=${encoded}`;
    
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      toast({ title: 'Link copied!', description: 'Share this URL with anyone' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo & Title */}
        <motion.div 
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse'
              }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
          </div>
          
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="gradient-text">Smart Form Factory</span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              JSON → Beautiful Forms
            </p>
          </div>
        </motion.div>

        {/* Navigation & Actions */}
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Form Builder Button */}
          {mounted && (
            <button
              onClick={() => setShowBuilder(true)}
              className="btn-ghost rounded-lg p-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Open form builder"
              title="Visual form builder"
            >
              <Wand2 className="w-5 h-5" />
            </button>
          )}

          {/* Share Button */}
          {mounted && (
            <button
              onClick={handleShare}
              className="btn-ghost rounded-lg p-2.5 text-muted-foreground hover:text-foreground"
              aria-label="Share form"
              title="Copy shareable link"
            >
              {copied ? <Check className="w-5 h-5 text-success" /> : <Share2 className="w-5 h-5" />}
            </button>
          )}

          {/* GitHub Link */}
          <a
            href="https://github.com/chintanshah35/smart-form-factory"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost rounded-lg p-2.5 text-muted-foreground hover:text-foreground"
            aria-label="View on GitHub"
          >
            <Github className="w-5 h-5" />
          </a>

          {/* Theme Toggle */}
          {mounted && (
            <motion.button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="btn-ghost rounded-lg p-2.5 text-muted-foreground hover:text-foreground relative overflow-hidden"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                initial={false}
                animate={{
                  rotate: theme === 'dark' ? 0 : 180,
                  scale: theme === 'dark' ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Moon className="w-5 h-5" />
              </motion.div>
              <motion.div
                initial={false}
                animate={{
                  rotate: theme === 'light' ? 0 : -180,
                  scale: theme === 'light' ? 1 : 0,
                }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Sun className="w-5 h-5" />
              </motion.div>
              <span className="w-5 h-5 opacity-0">
                <Sun className="w-5 h-5" />
              </span>
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Form Builder Modal */}
      <FormBuilder isOpen={showBuilder} onClose={() => setShowBuilder(false)} />
    </header>
  );
}
