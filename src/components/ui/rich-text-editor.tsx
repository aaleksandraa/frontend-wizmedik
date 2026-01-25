import { useState, useRef } from 'react';
import { Button } from './button';
import { Textarea } from './textarea';
import { Bold, Italic, List, ListOrdered, Undo, Redo, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Unesite tekst...',
  rows = 6,
  className
}: RichTextEditorProps) {
  const [showPreview, setShowPreview] = useState(true); // Start in preview mode
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertTag = (openTag: string, closeTag: string) => {
    // Switch to edit mode if in preview
    if (showPreview) {
      setShowPreview(false);
    }

    const textarea = textareaRef.current;
    if (!textarea) {
      // If textarea not ready, wait a bit and try again
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end);
        const beforeText = value.substring(0, start);
        const afterText = value.substring(end);

        const newText = `${beforeText}${openTag}${selectedText}${closeTag}${afterText}`;
        onChange(newText);

        setTimeout(() => {
          textarea.focus();
          const newCursorPos = start + openTag.length + selectedText.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
      }, 100);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const beforeText = value.substring(0, start);
    const afterText = value.substring(end);

    const newText = `${beforeText}${openTag}${selectedText}${closeTag}${afterText}`;
    onChange(newText);

    // Set cursor position after inserted tags
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + openTag.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleBold = () => insertTag('<strong>', '</strong>');
  const handleItalic = () => insertTag('<em>', '</em>');
  const handleUnorderedList = () => {
    // Switch to edit mode if in preview
    if (showPreview) {
      setShowPreview(false);
      setTimeout(() => handleUnorderedListLogic(), 100);
      return;
    }
    handleUnorderedListLogic();
  };

  const handleUnorderedListLogic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      const lines = selectedText.split('\n').filter(line => line.trim());
      const listItems = lines.map(line => `  <li>${line.trim()}</li>`).join('\n');
      const listHtml = `<ul>\n${listItems}\n</ul>`;
      
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      onChange(`${beforeText}${listHtml}${afterText}`);
    } else {
      insertTag('<ul>\n  <li>', '</li>\n</ul>');
    }
  };

  const handleOrderedList = () => {
    // Switch to edit mode if in preview
    if (showPreview) {
      setShowPreview(false);
      setTimeout(() => handleOrderedListLogic(), 100);
      return;
    }
    handleOrderedListLogic();
  };

  const handleOrderedListLogic = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    if (selectedText) {
      const lines = selectedText.split('\n').filter(line => line.trim());
      const listItems = lines.map(line => `  <li>${line.trim()}</li>`).join('\n');
      const listHtml = `<ol>\n${listItems}\n</ol>`;
      
      const beforeText = value.substring(0, start);
      const afterText = value.substring(end);
      onChange(`${beforeText}${listHtml}${afterText}`);
    } else {
      insertTag('<ol>\n  <li>', '</li>\n</ol>');
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 bg-muted rounded-t-md border border-b-0">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleBold}
          title="Bold (Ctrl+B)"
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleItalic}
          title="Italic (Ctrl+I)"
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-border mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUnorderedList}
          title="Bullet List"
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleOrderedList}
          title="Numbered List"
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant={showPreview ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          title="Toggle Preview"
          className="h-8 px-3"
        >
          <Eye className="h-4 w-4 mr-1" />
          {showPreview ? 'Uredi' : 'Pregled'}
        </Button>
      </div>

      {/* Editor/Preview */}
      {showPreview ? (
        <div 
          className="min-h-[150px] p-4 border rounded-b-md bg-background cursor-pointer hover:bg-muted/30 transition-colors"
          onClick={() => setShowPreview(false)}
          title="Kliknite da uredite tekst"
        >
          <div 
            className="rich-text-preview"
            dangerouslySetInnerHTML={{ __html: value || '<p style="color: #888; font-style: italic;">Kliknite da dodate tekst...</p>' }}
          />
        </div>
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="rounded-t-none font-mono text-sm"
        />
      )}

      {/* Help Text */}
      <p className="text-xs text-muted-foreground">
        💡 Kliknite <strong>"Pregled"</strong> da vidite kako će tekst izgledati sa formatiranjem (bold, italic, liste sa tačkama)
      </p>
    </div>
  );
}
