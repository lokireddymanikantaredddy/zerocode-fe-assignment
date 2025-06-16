
import React from 'react';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Code, Lightbulb, HelpCircle } from 'lucide-react';

const promptTemplates = [
  {
    id: '1',
    title: 'Code Review',
    content: 'Please review this code and suggest improvements for better performance and readability:',
    category: 'Development',
    icon: Code
  },
  {
    id: '2',
    title: 'Creative Writing',
    content: 'Write a creative story about a programmer who discovers their code can alter reality. Make it engaging and include unexpected plot twists.',
    category: 'Creative',
    icon: Lightbulb
  },
  {
    id: '3',
    title: 'Explain Concept',
    content: 'Explain React hooks in simple terms with practical examples that a beginner can understand.',
    category: 'Learning',
    icon: HelpCircle
  },
  {
    id: '4',
    title: 'Debug Help',
    content: 'I\'m getting an error in my code. Can you help me debug and fix this issue:',
    category: 'Development',
    icon: MessageSquare
  }
];

const PromptTemplates: React.FC = () => {
  const { sendMessage } = useChat();

  const handleTemplateClick = (content: string) => {
    // Dispatch a custom event to set the input value
    window.dispatchEvent(new CustomEvent('setPromptTemplate', { detail: content }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Prompt Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {promptTemplates.map((template) => {
          const IconComponent = template.icon;
          return (
            <Button
              key={template.id}
              variant="ghost"
              className="w-full justify-start text-left h-auto p-3"
              onClick={() => handleTemplateClick(template.content)}
            >
              <div className="flex items-start gap-2">
                <IconComponent className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-xs">{template.title}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {template.content.slice(0, 50)}...
                  </div>
                </div>
              </div>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default PromptTemplates;
