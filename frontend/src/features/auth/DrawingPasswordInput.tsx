// DrawingPasswordInput.tsx
import React, { useEffect, useRef, useState } from 'react';

interface DrawingPasswordInputProps {
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: boolean;
  helperText?: string | false;
}

const DrawingPasswordInput: React.FC<DrawingPasswordInputProps> = ({
  onChange,
  onBlur,
  error,
  helperText
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [isCanvasVisible, setIsCanvasVisible] = useState<boolean>(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const ctx = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.width = 300;
      canvasRef.current.height = 150;
      ctx.current = canvasRef.current.getContext('2d');
      if (ctx.current) {
        ctx.current.lineWidth = 3;
        ctx.current.strokeStyle = '#000000';
        ctx.current.lineCap = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    if (e.button === 2 && ctx.current) {
      setIsDrawing(true);
      ctx.current.beginPath();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        ctx.current.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>): void => {
    e.preventDefault();
    if (isDrawing && ctx.current) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        ctx.current.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.current.stroke();
      }
    }
  };

  const stopDrawing = (): void => {
    if (isDrawing && ctx.current && canvasRef.current) {
      setIsDrawing(false);
      const newPassword = password + '*';
      setPassword(newPassword);
      onChange(newPassword);
      
      // Clear canvas
      ctx.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  const handleStartDrawing = (): void => {
    setIsCanvasVisible(true);
  };

  const handleKeyDown = (e: KeyboardEvent): void => {
    const step = 10;
    switch (e.key) {
      case 'ArrowLeft':
        setPosition(prev => ({ ...prev, x: prev.x - step }));
        break;
      case 'ArrowRight':
        setPosition(prev => ({ ...prev, x: prev.x + step }));
        break;
      case 'ArrowUp':
        setPosition(prev => ({ ...prev, y: prev.y - step }));
        break;
      case 'ArrowDown':
        setPosition(prev => ({ ...prev, y: prev.y + step }));
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="px-4 py-2 text-sm border rounded"
          onClick={handleStartDrawing}
        >
          Draw Password
        </button>
        
        {isCanvasVisible && (
          <canvas
            ref={canvasRef}
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              border: '2px solid black',
              backgroundColor: 'white',
              cursor: 'crosshair',
              boxShadow: '0 0 10px rgba(0,0,0,0.2)',
              zIndex: 1000
            }}
            onContextMenu={(e) => e.preventDefault()}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        )}
        
        <div className="mt-1 text-sm">
          Password: {password.replace(/./g, '*')}
        </div>
        
        {error && helperText && (
          <div className="text-red-500 text-sm">
            {helperText}
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingPasswordInput