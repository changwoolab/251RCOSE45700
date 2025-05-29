'use client';

import { ObjectDetails } from "@/components/ObjectDetails";
import { Sidebar } from "@/components/Sidebar";
import { Mode, ObjectInfo } from "@/types/objects";
import { Box, ChakraProvider, defaultSystem, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { shapeDrawerFactory } from "@/shapes/ShapeDrawer";
import { canvasStore } from "@/flux/CanvasStore";
import { ActionCreators } from "@/flux/types";
import { dispatcher } from "@/flux/Dispatcher";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idRef = useRef<number>(1);
  const [state, setState] = useState(canvasStore.getState());

  // Subscribe to store changes
  useEffect(() => {
    const handleChange = () => {
      setState(canvasStore.getState());
    };

    canvasStore.addChangeListener(handleChange);
    return () => {
      canvasStore.removeChangeListener(handleChange);
    };
  }, []);

  // Update canvas size to match parent's dimensions
  const updateCanvasSize = useCallback(() => {
    if (canvasRef.current && canvasRef.current.parentElement) {
      canvasRef.current.width = canvasRef.current.parentElement.clientWidth;
      canvasRef.current.height = canvasRef.current.parentElement.clientHeight;
    }
  }, []);

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [updateCanvasSize]);

  const clear = () => {
    dispatcher.dispatch(ActionCreators.clearCanvas());
  };

  // Update a single object (from ObjectDetails changes)
  const updateObject = (updated: ObjectInfo) => {
    dispatcher.dispatch(ActionCreators.updateShape(updated));
  };

  // --- Hit-testing helpers ---
  const isPointNearLine = (p: { x: number; y: number }, line: ObjectInfo) => {
    const { startPoint, currentPoint } = line;
    const distance =
      Math.abs(
        (currentPoint.y - startPoint.y) * p.x -
          (currentPoint.x - startPoint.x) * p.y +
          currentPoint.x * startPoint.y -
          currentPoint.y * startPoint.x
      ) /
      Math.hypot(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x);
    return distance < 5;
  };

  const isPointInRect = (p: { x: number; y: number }, rectObj: ObjectInfo) => {
    const { startPoint, currentPoint } = rectObj;
    const minX = Math.min(startPoint.x, currentPoint.x);
    const maxX = Math.max(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const maxY = Math.max(startPoint.y, currentPoint.y);
    return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  };

  const isPointInCircle = (p: { x: number; y: number }, circle: ObjectInfo) => {
    const { startPoint, currentPoint } = circle;
    const radius = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
        Math.pow(currentPoint.y - startPoint.y, 2)
    );
    const dist = Math.hypot(p.x - startPoint.x, p.y - startPoint.y);
    return dist <= radius;
  };

  const hitTest = (p: { x: number; y: number }, obj: ObjectInfo) => {
    if (obj.type === "line") return isPointNearLine(p, obj);
    if (obj.type === "rectangle") return isPointInRect(p, obj);
    if (obj.type === "circle") return isPointInCircle(p, obj);
    return false;
  };

  // --- Mouse event handler ---
  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let onMouseMove: (e: MouseEvent) => void;
    let onMouseUp: (e: MouseEvent) => void;

    const mode = state.mode;
    if (mode === "line" || mode === "rectangle" || mode === "circle") {
      const newObj: ObjectInfo = {
        id: idRef.current++,
        startPoint: { x: startX, y: startY },
        currentPoint: { x: startX, y: startY },
        color: "black",
        fillColor: "transparent",
        zIndex: idRef.current,
        type: mode,
      };

      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        ctx.putImageData(savedImageData, 0, 0);
        ctx.strokeStyle = newObj.color;
        const drawer = shapeDrawerFactory.getDrawer(newObj.type);
        newObj.currentPoint = { x: currentX, y: currentY };
        drawer.draw(ctx, newObj);
      };

      onMouseUp = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        newObj.currentPoint = { x: currentX, y: currentY };
        dispatcher.dispatch(ActionCreators.createShape(newObj));
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };
    } else if (mode === "select") {
      const clickedPoint = { x: startX, y: startY };
      const hitObjects = state.objects.filter((obj) => hitTest(clickedPoint, obj));
      
      if (hitObjects.length === 0) {
        dispatcher.dispatch(ActionCreators.selectShapes([]));
        return;
      }

      const topObject = hitObjects.reduce((prev, curr) =>
        prev.zIndex > curr.zIndex ? prev : curr
      );

      const intendedSelection = e.shiftKey
        ? Array.from(new Set([...state.selectedIds, topObject.id]))
        : [topObject.id];
      
      dispatcher.dispatch(ActionCreators.selectShapes(intendedSelection));

      const moveStartX = startX;
      const moveStartY = startY;

      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const deltaX = currentX - moveStartX;
        const deltaY = currentY - moveStartY;

        dispatcher.dispatch(ActionCreators.moveShape(intendedSelection, deltaX, deltaY));
      };

      onMouseUp = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const deltaX = currentX - moveStartX;
        const deltaY = currentY - moveStartY;

        dispatcher.dispatch(ActionCreators.moveShape(intendedSelection, deltaX, deltaY));
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };
    } else {
      return;
    }
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
  };

  // Redraw canvas when state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sort objects by z-index and draw
    const sortedObjects = [...state.objects].sort((a, b) => a.zIndex - b.zIndex);
    sortedObjects.forEach((obj) => {
      ctx.strokeStyle = obj.color;
      const drawer = shapeDrawerFactory.getDrawer(obj.type);
      drawer.draw(ctx, obj);
    });
  }, [state.objects]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Flex bgColor={"gray.700"} flex={1} width={"100vw"} height={"100vh"}>
        <Box borderRadius={10}>
          <Sidebar 
            setMode={(mode) => dispatcher.dispatch(ActionCreators.changeMode(mode))} 
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
        <ObjectDetails onUpdate={updateObject} />
      </Flex>
    </ChakraProvider>
  );
}
