'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Paintbrush, X, Copy, Check, RotateCcw } from 'lucide-react';
import { copyToClipboard } from '@/lib/utils';
import { toast } from '@/components/ui/toaster';

interface ColorConfig {
  name: string;
  label: string;
  value: string;
}

const defaultColors: ColorConfig[] = [
  { name: 'primary', label: 'Primary', value: '#f97316' },
  { name: 'secondary', label: 'Secondary', value: '#3b82f6' },
  { name: 'accent', label: 'Accent', value: '#ec4899' },
  { name: 'background', label: 'Background', value: '#faf9f7' },
  { name: 'foreground', label: 'Text', value: '#1a1a1a' },
];

function hexToHSL(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const [colors, setColors] = useState<ColorConfig[]>(defaultColors);
  const [copied, setCopied] = useState(false);

  const updateColor = (name: string, value: string) => {
    setColors(colors.map(c => c.name === name ? { ...c, value } : c));
    
    // Apply to CSS variables in real-time
    const hsl = hexToHSL(value);
    document.documentElement.style.setProperty(`--${name}`, hsl);
  };

  const resetColors = () => {
    setColors(defaultColors);
    defaultColors.forEach(c => {
      document.documentElement.style.removeProperty(`--${c.name}`);
    });
  };

  const exportCSS = async () => {
    const css = `:root {
${colors.map(c => `  --${c.name}: ${hexToHSL(c.value)};`).join('\n')}
}`;
    
    const success = await copyToClipboard(css);
    if (success) {
      setCopied(true);
      toast({ title: 'CSS copied!' });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 flex items-center justify-center text-white"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Customize Theme"
      >
        <Paintbrush className="w-6 h-6" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-card border-l border-border shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Theme</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Colors */}
              <div className="p-4 space-y-4">
                {colors.map(color => (
                  <div key={color.name} className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={color.value}
                        onChange={(e) => updateColor(color.name, e.target.value)}
                        className="w-10 h-10 rounded-lg border border-border cursor-pointer overflow-hidden"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{color.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">{color.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-card space-y-2">
                <button
                  onClick={exportCSS}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy CSS'}
                </button>
                <button
                  onClick={resetColors}
                  className="w-full btn-ghost flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

