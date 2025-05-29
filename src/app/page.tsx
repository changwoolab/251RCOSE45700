'use client';

import { ObjectDetails } from "@/components/ObjectDetails";
import { Sidebar } from "@/components/Sidebar";
import { Mode, ObjectInfo, Shape } from "@/types/objects";
import { Box, ChakraProvider, defaultSystem, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DrawModeStrategy } from "@/strategies/DrawModeStrategy";
import { SelectModeStrategy } from "@/strategies/SelectModeStrategy";
import { CanvasModeStrategy } from "@/strategies/CanvasModeStrategy";
import { canvasModel, CanvasState } from "@/models/CanvasModel";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idRef = useRef<number>(1);
  const [state, setState] = useState<CanvasState>(canvasModel.getState());
  const [currentStrategy, setCurrentStrategy] = useState<CanvasModeStrategy | null>(null);

  // Subscribe to model changes
  useEffect(() => {
    const unsubscribe = canvasModel.subscribe((newState) => {
      setState(newState);
    });
    return () => unsubscribe();
  }, []);

  // Update strategy when mode changes
  useEffect(() => {
    if (state.mode === "select") {
      setCurrentStrategy(new SelectModeStrategy());
    } else if (state.mode === "line" || state.mode === "rectangle" || state.mode === "circle") {
      setCurrentStrategy(new DrawModeStrategy(state.mode as Shape));
    } else {
      setCurrentStrategy(null);
    }
  }, [state.mode]);

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
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

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

  // Re-render canvas when state changes
  useEffect(() => {
    renderCanvas();
  }, [state, renderCanvas]);

  const clear = useCallback(() => {
    canvasModel.deleteObjects(state.objects.map(obj => obj.id));
  }, [state.objects]);

  const updateObject = useCallback((updated: ObjectInfo) => {
    canvasModel.updateObject(updated);
  }, []);

  // Mouse event handler
  const onMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !currentStrategy) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const context = {
      model: canvasModel,
      view: {
        getCanvasRect: () => rect,
        getContext: () => ctx,
        saveImageData: () => ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height),
        restoreImageData: (imageData: ImageData) => ctx.putImageData(imageData, 0, 0)
      },
      idRef
    };

    const { onMouseMove, onMouseUp } = currentStrategy.onMouseDown(e, context);
    
    if (onMouseMove && onMouseUp) {
      canvasRef.current.addEventListener("mousemove", onMouseMove);
      canvasRef.current.addEventListener("mouseup", onMouseUp);
    }
  }, [currentStrategy]);

  // Get selected object for ObjectDetails
  const selectedObject = state.objects.find(obj => obj.id === state.selectedIds[0]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Flex bgColor="gray.700" flex={1} width="100vw" height="100vh">
        <Box borderRadius={10}>
          <Sidebar 
            setMode={(mode: Mode) => canvasModel.setMode(mode)} 
            clear={clear} 
          />
          <Text>{state.mode}</Text>
        </Box>
        <Box width="100%" height="100%">
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            style={{ backgroundColor: "white" }}
          />
        </Box>
        {selectedObject && (
          <Box 
            width="300px" 
            bg="white" 
            p={4} 
            boxShadow="md" 
            borderRadius="md"
            position="absolute"
            right="20px"
            top="20px"
          >
            <ObjectDetails 
              object={selectedObject} 
              onUpdate={updateObject} 
            />
          </Box>
        )}
      </Flex>
    </ChakraProvider>
  );
}
