'use client';
import { useRef, useState, useEffect } from 'react';

import { RotateCcw, RotateCw , Trash ,SlidersVertical, Save } from 'lucide-react';

import DrawingTools from './DrawingTools';

const COLORS = [
  '#FFFFFF', // white
  '#000000', // black
  '#FF4D4D', // mid red
  '#52eb34', // parrot green
  '#eded15', // lite yellow
  '#1081eb', // sky blue
  '#eb1076', // lite pink
  '#9010eb', // lite violet
];

interface DrawAction {
  type: 'path' | 'circle' | 'square' | 'triangle';
  points: { x: number; y: number }[];
  color: string;
  lineWidth: number;
  width?: number;
  height?: number;
  id?: string;
}

export default function Canvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [lineWidth, setLineWidth] = useState(5);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'circle' | 'square' | 'triangle'>('pen');
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [undoStack, setUndoStack] = useState<DrawAction[]>([]);
  const [redoStack, setRedoStack] = useState<DrawAction[]>([]);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(null);
  const [currentShape, setCurrentShape] = useState<DrawAction | null>(null);
  const [isSliderVisible, setIsSliderVisible] = useState(false);

  const updateContextStyle = (ctx: CanvasRenderingContext2D) => {
    if (tool === 'eraser') {
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = lineWidth * 2;
    } else {
      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
    }
  };

  useEffect(() => {
    const ctx = contextRef.current;
    if (!ctx) return;
    updateContextStyle(ctx);
  }, [tool, selectedColor, lineWidth]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !contextRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (['circle', 'square', 'triangle'].includes(tool)) {
      setShapeStart({ x, y });
      setCurrentShape({
        type: tool as 'circle' | 'square' | 'triangle',
        points: [{ x, y }],
        color: selectedColor,
        lineWidth: lineWidth,
        id: Date.now().toString(),
      });
    } else {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
      setCurrentPath([{ x, y }]);
    }
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !contextRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (['circle', 'square', 'triangle'].includes(tool) && shapeStart) {
      const ctx = contextRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      redrawCanvas();

      ctx.strokeStyle = selectedColor;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      const width = x - shapeStart.x;
      const height = y - shapeStart.y;

      if (tool === 'circle') {
        const radius = Math.sqrt(width * width + height * height);
        ctx.arc(shapeStart.x, shapeStart.y, radius, 0, 2 * Math.PI);
      } else if (tool === 'square') {
        ctx.rect(shapeStart.x, shapeStart.y, width, height);
      } else if (tool === 'triangle') {
        ctx.moveTo(shapeStart.x, shapeStart.y + height);
        ctx.lineTo(shapeStart.x + width / 2, shapeStart.y);
        ctx.lineTo(shapeStart.x + width, shapeStart.y + height);
        ctx.closePath();
      }
      
      ctx.stroke();
      setCurrentShape(prev => prev ? {
        ...prev,
        points: [{ x: shapeStart.x, y: shapeStart.y }, { x, y }],
        width,
        height,
      } : null);
    } else {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
      setCurrentPath(prev => [...prev, { x, y }]);
    }
  };

  const stopDrawing = () => {
    if (!isDrawing || !contextRef.current) return;

    if (currentShape) {
      setUndoStack(prev => [...prev, currentShape]);
      setCurrentShape(null);
      setShapeStart(null);
    } else if (currentPath.length > 0) {
      setUndoStack(prev => [
        ...prev,
        {
          type: 'path',
          points: currentPath,
          color: tool === 'eraser' ? '#FFFFFF' : selectedColor,
          lineWidth: lineWidth,
        },
      ]);
    }
    setCurrentPath([]);
    setRedoStack([]);
    setIsDrawing(false);
  };

  const undo = () => {
    if (undoStack.length === 0) return;
  
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
  
    // Pop the last action from undoStack
    const lastAction = undoStack[undoStack.length - 1];
    const newUndoStack = undoStack.slice(0, -1);
  
    // Add to redoStack
    setRedoStack(prev => [...prev, lastAction]);
    setUndoStack(newUndoStack);
  
    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Redraw only the actions from the new undoStack
    newUndoStack.forEach((action) => {
      ctx.beginPath();
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.lineWidth;
  
      if (action.type === 'path') {
        action.points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
      } else if (action.type === 'circle' && action.points.length === 2) {
        const radius = Math.sqrt(
          Math.pow(action.points[1].x - action.points[0].x, 2) +
          Math.pow(action.points[1].y - action.points[0].y, 2)
        );
        ctx.arc(action.points[0].x, action.points[0].y, radius, 0, 2 * Math.PI);
      } else if (action.type === 'square' && action.width && action.height) {
        ctx.rect(
          action.points[0].x,
          action.points[0].y,
          action.width,
          action.height
        );
      } else if (action.type === 'triangle' && action.width && action.height) {
        const startX = action.points[0].x;
        const startY = action.points[0].y;
        ctx.moveTo(startX, startY + action.height);
        ctx.lineTo(startX + action.width / 2, startY);
        ctx.lineTo(startX + action.width, startY + action.height);
        ctx.closePath();
      }
  
      ctx.stroke();
      ctx.closePath();
    });
  };

  const redo = () => {
    if (redoStack.length === 0) return;
  
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;
  
    // Pop the last action from redoStack
    const lastAction = redoStack[redoStack.length - 1];
    const newRedoStack = redoStack.slice(0, -1);
  
    // Add to undoStack
    setUndoStack(prev => [...prev, lastAction]);
    setRedoStack(newRedoStack);
  
    // Redraw the last action
    ctx.beginPath();
    ctx.strokeStyle = lastAction.color;
    ctx.lineWidth = lastAction.lineWidth;
  
    if (lastAction.type === 'path') {
      lastAction.points.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
    } else if (lastAction.type === 'circle' && lastAction.points.length === 2) {
      const radius = Math.sqrt(
        Math.pow(lastAction.points[1].x - lastAction.points[0].x, 2) +
        Math.pow(lastAction.points[1].y - lastAction.points[0].y, 2)
      );
      ctx.arc(lastAction.points[0].x, lastAction.points[0].y, radius, 0, 2 * Math.PI);
    } else if (lastAction.type === 'square' && lastAction.width && lastAction.height) {
      ctx.rect(
        lastAction.points[0].x,
        lastAction.points[0].y,
        lastAction.width,
        lastAction.height
      );
    } else if (lastAction.type === 'triangle' && lastAction.width && lastAction.height) {
      const startX = lastAction.points[0].x;
      const startY = lastAction.points[0].y;
      ctx.moveTo(startX, startY + lastAction.height);
      ctx.lineTo(startX + lastAction.width / 2, startY);
      ctx.lineTo(startX + lastAction.width, startY + lastAction.height);
      ctx.closePath();
    }
  
    ctx.stroke();
    ctx.closePath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setUndoStack([]);
    setRedoStack([]);
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      tempCtx.drawImage(canvas, 0, 0);

      const link = document.createElement('a');
      link.download = 'drawing.png';
      link.href = tempCanvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error downloading canvas:', error);
    }
  };

  const redrawCanvas = () => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    // Redraw all actions in the undoStack
    undoStack.forEach((action) => {
        ctx.beginPath();
        ctx.strokeStyle = action.color;
        ctx.lineWidth = action.lineWidth;

        if (action.type === 'path') {
            action.points.forEach((point, i) => {
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
        } else if (action.type === 'circle') {
            const radius = Math.sqrt(
                Math.pow(action.points[1].x - action.points[0].x, 2) +
                Math.pow(action.points[1].y - action.points[0].y, 2)
            );
            ctx.arc(action.points[0].x, action.points[0].y, radius, 0, 2 * Math.PI);
        } else if (action.type === 'square') {
            ctx.rect(
                action.points[0].x,
                action.points[0].y,
                action.width || 0,
                action.height || 0
            );
        } else if (action.type === 'triangle') {
            const startX = action.points[0].x;
            const startY = action.points[0].y;
            const width = action.width || 0;
            const height = action.height || 0;

            ctx.moveTo(startX, startY + height);
            ctx.lineTo(startX + width / 2, startY);
            ctx.lineTo(startX + width, startY + height);
            ctx.closePath();
        }

        ctx.stroke();
        ctx.closePath();
    });
};
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    updateContextStyle(ctx);

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    contextRef.current = ctx;

    const handleResize = () => {
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;
      tempCtx.drawImage(canvas, 0, 0);

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      ctx.drawImage(tempCanvas, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      updateContextStyle(ctx);
      ctx.fillStyle = '#1a1a1a';
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`bg-[#1a1a1a] min-h-screen ${
      isDrawing ? 'cursor-crosshair' : 'cursor-default'
    }`}>
      <div className='relat'></div>
      <div className="fixed top-8 right-4 bg-white/10 backdrop-blur-md rounded-full p-4 flex flex-col items-center gap-2.5 w-17">
        <DrawingTools selectedTool={tool} onToolChange={setTool} />

        <div className='h-8 w-px bg-white/20' />

        <div className='flex flex-col gap-2'>
          {COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-6 h-6 rounded-full ${
                selectedColor === color
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-black'
                  : ''
              }`}
              style={{ background: color }}
            />
          ))}
        </div>

        <button
          onClick={() => setIsSliderVisible(!isSliderVisible)}
          className='p-2 text-white hover:bg-white/20 rounded-full'
          title='Toggle Line Width'
        >
          <SlidersVertical />
        </button>

        {isSliderVisible && (
          <input
            type='range'
            min='1'
            max='20'
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className='w-32 transform rotate-[-90deg] absolute right-[-50px] left-[-80px] top-[620px]' 
            title='Line width'
          />
        )}

        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className={`p-2 text-white ${
            undoStack.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white/20'
          } rounded-full`}
          title='Undo'
        >
          <RotateCcw />
        </button>

        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className={`p-2 text-white ${
            redoStack.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:bg-white/20'
          } rounded-full`}
          title='Redo'
        >
          <RotateCw />
        </button>

        <button
          onClick={clearCanvas}
          className='p-2 text-white hover:bg-white/20 rounded-full'
          title='Clear canvas'
        >
          <Trash />
        </button>

        <button
          onClick={downloadCanvas}
          className='p-2 text-white hover:bg-white/20 rounded-full'
          title='Download drawing'
        >
          <Save />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className='touch-none'
      />
    </div>
  );
};
