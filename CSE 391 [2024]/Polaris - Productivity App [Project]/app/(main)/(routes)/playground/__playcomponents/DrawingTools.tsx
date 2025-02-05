// components/DrawingTools.tsx
import { Triangle , Circle , Square, PenLine, Eraser } from 'lucide-react';

interface DrawingToolsProps {
  selectedTool: 'pen' | 'eraser' | 'circle' | 'square' | 'triangle';
  onToolChange: (tool: 'pen' | 'eraser' | 'circle' | 'square' | 'triangle') => void;
}

export default function DrawingTools({ selectedTool, onToolChange }: DrawingToolsProps) {
  return (
    <div className='flex flex-col gap-2'>
      <button
        onClick={() => onToolChange('pen')}
        className={`p-2 text-white ${
          selectedTool === 'pen' ? 'bg-white/20' : 'hover:bg-white/20'
        } rounded-full`}
        title='Pen'
      >
        <PenLine />
      </button>

      <button
        onClick={() => onToolChange('eraser')}
        className={`p-2 text-white ${
          selectedTool === 'eraser' ? 'bg-white/20' : 'hover:bg-white/20'
        } rounded-full`}
        title='Eraser'
      >
        <Eraser />
      </button>

      <button
        onClick={() => onToolChange('circle')}
        className={`p-2 text-white ${
          selectedTool === 'circle' ? 'bg-white/20' : 'hover:bg-white/20'
        } rounded-full`}
        title='Circle'
      >
        <Circle />
      </button>

      <button
        onClick={() => onToolChange('square')}
        className={`p-2 text-white ${
          selectedTool === 'square' ? 'bg-white/20' : 'hover:bg-white/20'
        } rounded-full`}
        title='Square'
      >
        <Square />
      </button>

      <button
        onClick={() => onToolChange('triangle')}
        className={`p-2 text-white ${
          selectedTool === 'triangle' ? 'bg-white/20' : 'hover:bg-white/20'
        } rounded-full`}
        title='Triangle'
      >
        <Triangle />
      </button>
    </div>
  );
}