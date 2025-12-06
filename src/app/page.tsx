'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  PanelLeftClose, 
  PanelLeftOpen,
  Sparkles,
  Zap,
  Code2,
  Eye,
  Layers,
  ArrowRight,
  Star
} from 'lucide-react';
import { Header } from '@/components/header';
import { JsonEditor } from '@/components/json-editor';
import { FormPreview } from '@/components/form-preview';
import { CodeOutput } from '@/components/code-output';
import { ThemeCustomizer } from '@/components/theme-customizer';
import { useFormFactoryStore } from '@/lib/store';
import { cn, decodeSchema } from '@/lib/utils';

type TabType = 'editor' | 'preview' | 'code';

export default function Home() {
  const { parsedFields, activeTab, setActiveTab, setJsonInput, parseJsonSchema } = useFormFactoryStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load schema from URL if present
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('s');
    if (encoded) {
      const decoded = decodeSchema(encoded);
      if (decoded) {
        setJsonInput(decoded);
        setTimeout(() => parseJsonSchema(), 100);
      }
    }
  }, [setJsonInput, parseJsonSchema]);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'editor', label: 'Schema', icon: <Code2 className="w-4 h-4" /> },
    { id: 'preview', label: 'Preview', icon: <Eye className="w-4 h-4" /> },
    { id: 'code', label: 'Export', icon: <Layers className="w-4 h-4" /> },
  ];

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Zap className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-50" />
          <div className="absolute inset-0 animated-gradient" />
          
          <div className="relative container mx-auto px-4 py-12 sm:py-16">
            <motion.div
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Badge */}
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Transform JSON to Beautiful Forms</span>
                <Star className="w-4 h-4" />
              </motion.div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="gradient-text">Smart Form Factory</span>
              </h1>

              {/* Description */}
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 text-balance">
                Paste a JSON schema, get a fully styled, accessible, responsive form. 
                Export to React, Vue, Svelte, or plain HTML with one click.
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                  <span className="text-muted-foreground">Auto Validation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-muted-foreground">Dark/Light Mode</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-muted-foreground">Accessible</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-muted-foreground">5 Frameworks</span>
                </div>
              </div>

              {/* CTA Arrow */}
              <motion.div
                className="mt-8 text-muted-foreground"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <ArrowRight className="w-6 h-6 mx-auto rotate-90" />
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Main App Section */}
        <section className="flex-1 container mx-auto px-4 py-6">
          {/* Mobile Tabs */}
          <div className="lg:hidden mb-4">
            <div className="flex rounded-lg bg-muted p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all',
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  {tab.id === 'preview' && parsedFields.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-success" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-6 h-[calc(100vh-24rem)]">
            {/* Editor Panel */}
            <motion.div
              className={cn(
                'rounded-xl border border-border bg-card overflow-hidden transition-all duration-300',
                isCollapsed ? 'lg:col-span-1' : 'lg:col-span-4'
              )}
              layout
            >
              {isCollapsed ? (
                <div className="h-full flex flex-col items-center py-4">
                  <button
                    onClick={() => setIsCollapsed(false)}
                    className="btn-ghost p-2 rounded-lg"
                    title="Expand editor"
                  >
                    <PanelLeftOpen className="w-5 h-5" />
                  </button>
                  <div className="flex-1 flex items-center">
                    <span className="text-sm font-medium [writing-mode:vertical-rl] rotate-180">
                      JSON Schema Editor
                    </span>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between p-2 border-b border-border">
                    <span className="sr-only">Editor</span>
                    <button
                      onClick={() => setIsCollapsed(true)}
                      className="btn-ghost p-2 rounded-lg ml-auto"
                      title="Collapse editor"
                    >
                      <PanelLeftClose className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex-1">
                    <JsonEditor />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Preview Panel */}
            <motion.div
              className={cn(
                'rounded-xl border border-border bg-card overflow-hidden',
                isCollapsed ? 'lg:col-span-5' : 'lg:col-span-4'
              )}
              layout
            >
              <FormPreview />
            </motion.div>

            {/* Code Output Panel */}
            <motion.div
              className={cn(
                'rounded-xl border border-border bg-card overflow-hidden',
                isCollapsed ? 'lg:col-span-6' : 'lg:col-span-4'
              )}
              layout
            >
              <CodeOutput />
            </motion.div>
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden h-[calc(100vh-20rem)]">
            <motion.div 
              className="h-full rounded-xl border border-border bg-card overflow-hidden"
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'editor' && <JsonEditor />}
              {activeTab === 'preview' && <FormPreview />}
              {activeTab === 'code' && <CodeOutput />}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-border bg-muted/30">
          <div className="container mx-auto px-4 py-12">
            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {[
                {
                  icon: <Zap className="w-6 h-6" />,
                  title: 'Instant Generation',
                  description: 'Paste JSON, get forms. No setup or configuration needed.',
                  color: 'text-primary',
                },
                {
                  icon: <Code2 className="w-6 h-6" />,
                  title: '5 Frameworks',
                  description: 'React Hook Form, Formik, Vue 3, Svelte, or plain HTML.',
                  color: 'text-secondary',
                },
                {
                  icon: <Sparkles className="w-6 h-6" />,
                  title: 'Auto Validation',
                  description: 'Zod/Yup schemas generated from your JSON automatically.',
                  color: 'text-accent',
                },
                {
                  icon: <Layers className="w-6 h-6" />,
                  title: 'Easy Theming',
                  description: 'Export CSS variables to match your design system.',
                  color: 'text-success',
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="card-hover text-center p-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className={cn('mb-4 inline-flex p-3 rounded-xl bg-muted', feature.color)}>
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            Built with{' '}
            <span className="text-destructive">♥</span>
            {' '}using Next.js 14, Tailwind CSS, and TypeScript
          </p>
          <p className="mt-1">
            Open source • MIT License
          </p>
        </div>
      </footer>

      {/* Theme Customizer */}
      <ThemeCustomizer />
    </div>
  );
}

