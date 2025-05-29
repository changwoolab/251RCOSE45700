'use client';

import { ObjectDetails } from "@/components/ObjectDetails";
import { Sidebar } from "@/components/Sidebar";
import { Mode, ObjectInfo } from "@/types/objects";
import { Box, ChakraProvider, defaultSystem, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DrawModeStrategy } from "@/strategies/DrawModeStrategy";
import { SelectModeStrategy } from "@/strategies/SelectModeStrategy";
import { CanvasModeStrategy } from "@/strategies/CanvasModeStrategy";
import { canvasModel, CanvasState } from "@/models/CanvasModel";
import { shapeDrawerFactory } from "@/shapes/ShapeDrawer";

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
      setCurrentStrategy(new DrawModeStrategy(state.mode));
    } else {
      setCurrentStrategy(null);
    }
  }, [state.mode]);

  // Update canvas size to match parent's dimensions
  const updateCanvasSize = useCallback(() => {
    if (canvasRef.current && canvasRef.current.parentElement) {
      const { clientWidth, clientHeight } = canvasRef.current.parentElement;
      canvasRef.current.width = clientWidth;
      canvasRef.current.height = clientHeight;
      renderCanvas(); // Re-render after resize
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
      const drawer = shapeDrawerFactory.getDrawer(obj.type);
      ctx.strokeStyle = obj.color;
      ctx.fillStyle = obj.fillColor;
      drawer.draw(ctx, obj);

      // Draw selection indicator if object is selected
      if (state.selectedIds.includes(obj.id)) {
        drawSelectionIndicator(ctx, obj);
      }
    });
  }, [state.objects, state.selectedIds]);

  // Draw selection indicator
  const drawSelectionIndicator = useCallback((ctx: CanvasRenderingContext2D, obj: ObjectInfo) => {
    const { startPoint, currentPoint } = obj;
    ctx.save();
    ctx.strokeStyle = "#0066ff";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);

    if (obj.type === "line") {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    } else if (obj.type === "rectangle") {
      const minX = Math.min(startPoint.x, currentPoint.x);
      const maxX = Math.max(startPoint.x, currentPoint.x);
      const minY = Math.min(startPoint.y, currentPoint.y);
      const maxY = Math.max(startPoint.y, currentPoint.y);
      ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    } else if (obj.type === "circle") {
      const radius = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) +
        Math.pow(currentPoint.y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }, []);

  // Re-render canvas when state changes
  useEffect(() => {
    renderCanvas();
  }, [state, renderCanvas]);

  const clear = () => {
    canvasModel.deleteObjects(state.objects.map(obj => obj.id));
  };

  const updateObject = (updated: ObjectInfo) => {
    canvasModel.updateObject(updated);
  };

  // Mouse event handler
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !currentStrategy) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const context = {
      model: canvasModel,
      view: {
        getCanvasRect: () => rect,
        getContext: () => ctx,
        saveImageData: () => savedImageData,
        restoreImageData: (imageData: ImageData) => ctx.putImageData(imageData, 0, 0)
      },
      idRef
    };

    const { onMouseMove, onMouseUp } = currentStrategy.onMouseDown(e, context);
    
    if (onMouseMove && onMouseUp) {
      canvas.addEventListener("mousemove", onMouseMove);
      canvas.addEventListener("mouseup", onMouseUp);
    }
  };

  // Get selected object for ObjectDetails
  const selectedObject = state.objects.find(obj => obj.id === state.selectedIds[0]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Flex bgColor={"gray.700"} flex={1} width={"100vw"} height={"100vh"}>
        <Box borderRadius={10}>
          <Sidebar 
            setMode={(mode) => canvasModel.setMode(mode)} 
            clear={clear} 
          />
          <Text>{state.mode}</Text>
        </Box>
        <Box width={"100%"} height={"100%"}>
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
