import { useCallback, useEffect, useRef } from 'react';
import { CanvasModeStrategy, CanvasContext } from '@/strategies/CanvasModeStrategy';
import { canvasModel } from '@/models/CanvasModel';

// Import CanvasState type from CanvasModel
type CanvasState = ReturnType<typeof canvasModel.getState>;

interface UseCanvasProps {
  state: CanvasState;
  currentStrategy: CanvasModeStrategy | null;
}

interface UseCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  idRef: React.RefObject<number>;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
}

export function useCanvas({ state, currentStrategy }: UseCanvasProps): UseCanvasReturn {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idRef = useRef<number>(1);

  // Canvas rendering
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Sort objects by z-index
    const sortedObjects = [...state.objects].sort((a, b) => a.zIndex - b.zIndex);

    // Draw all objects
    sortedObjects.forEach(obj => {
      ctx.strokeStyle = obj.color;
      ctx.fillStyle = obj.fillColor;

      switch (obj.type) {
        case "line":
          ctx.beginPath();
          ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
          ctx.lineTo(obj.currentPoint.x, obj.currentPoint.y);
          ctx.stroke();
          break;
        case "rectangle": {
          const minX = Math.min(obj.startPoint.x, obj.currentPoint.x);
          const maxX = Math.max(obj.startPoint.x, obj.currentPoint.x);
          const minY = Math.min(obj.startPoint.y, obj.currentPoint.y);
          const maxY = Math.max(obj.startPoint.y, obj.currentPoint.y);
          ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
          ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
          break;
        }
        case "circle": {
          const radius = Math.sqrt(
            Math.pow(obj.currentPoint.x - obj.startPoint.x, 2) +
            Math.pow(obj.currentPoint.y - obj.startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(obj.startPoint.x, obj.startPoint.y, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          break;
        }
      }

      // Draw selection indicator if object is selected
      if (state.selectedIds.includes(obj.id)) {
        ctx.save();
        ctx.strokeStyle = "#0066ff";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        switch (obj.type) {
          case "line":
            ctx.beginPath();
            ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
            ctx.lineTo(obj.currentPoint.x, obj.currentPoint.y);
            ctx.stroke();
            break;
          case "rectangle": {
            const minX = Math.min(obj.startPoint.x, obj.currentPoint.x);
            const maxX = Math.max(obj.startPoint.x, obj.currentPoint.x);
            const minY = Math.min(obj.startPoint.y, obj.currentPoint.y);
            const maxY = Math.max(obj.startPoint.y, obj.currentPoint.y);
            ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
            break;
          }
          case "circle": {
            const radius = Math.sqrt(
              Math.pow(obj.currentPoint.x - obj.startPoint.x, 2) +
              Math.pow(obj.currentPoint.y - obj.startPoint.y, 2)
            );
            ctx.beginPath();
            ctx.arc(obj.startPoint.x, obj.startPoint.y, radius, 0, Math.PI * 2);
            ctx.stroke();
            break;
          }
        }

        ctx.restore();
      }
    });
  }, [state.objects, state.selectedIds]);

  // Update canvas size to match parent's dimensions
  const updateCanvasSize = useCallback(() => {
    if (canvasRef.current?.parentElement) {
      const { clientWidth, clientHeight } = canvasRef.current.parentElement;
      if (canvasRef.current) {
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        renderCanvas();
      }
    }
  }, [renderCanvas]);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  // Re-render canvas when state changes
  useEffect(() => {
    renderCanvas();
  }, [state, renderCanvas]);

  // Mouse event handler
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentStrategy) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const context: CanvasContext = {
      model: canvasModel,
      view: {
        getCanvasRect: () => rect,
        getContext: () => ctx,
        saveImageData: () => ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height),
        restoreImageData: (imageData: ImageData) => ctx.putImageData(imageData, 0, 0)
      },
      idRef
    };

    const { onMouseMove } = currentStrategy.onMouseDown(e, context);
    
    if (onMouseMove) {
      canvasRef.current.addEventListener("mousemove", onMouseMove);
      canvasRef.current.addEventListener("mouseup", () => {
        canvasRef.current?.removeEventListener("mousemove", onMouseMove);
        canvasRef.current?.removeEventListener("mouseup", () => {});
      });
    }
  }, [currentStrategy]);

  return {
    canvasRef,
    idRef,
    onMouseDown
  };
} 