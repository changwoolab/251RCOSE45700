'use client';

import { ObjectDetails } from "@/components/ObjectDetails";
import { Sidebar } from "@/components/Sidebar";
import { Mode, ObjectInfo } from "@/types/objects";
import { Box, ChakraProvider, defaultSystem, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { shapeDrawerFactory } from "@/shapes/ShapeDrawer";
import { CreateShapeCommand, MoveShapeCommand, DeleteShapeCommand } from "@/commands/CanvasCommand";
import { canvasSubject } from "@/observers/CanvasObserver";
import { CanvasRenderer } from "@/observers/CanvasRenderer";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const idRef = useRef<number>(1);
  const [renderer, setRenderer] = useState<CanvasRenderer | null>(null);

  // Initialize canvas renderer
  useEffect(() => {
    if (canvasRef.current && !renderer) {
      const newRenderer = new CanvasRenderer(canvasRef.current);
      canvasSubject.attach(newRenderer);
      setRenderer(newRenderer);
    }
    return () => {
      if (renderer) {
        canvasSubject.detach(renderer);
      }
    };
  }, [renderer]);

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
    const command = new DeleteShapeCommand(
      canvasSubject.getObjects(),
      canvasSubject.getObjects().map(obj => obj.id)
    );
    command.execute();
  };

  // Update a single object (from ObjectDetails changes)
  const updateObject = (updated: ObjectInfo) => {
    const objects = canvasSubject.getObjects();
    const updatedObjects = objects.map((obj) => 
      obj.id === updated.id ? updated : obj
    );
    canvasSubject.setObjects(updatedObjects);
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

    const mode = canvasSubject.getMode();
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
        const command = new CreateShapeCommand(
          canvasSubject.getObjects(),
          newObj
        );
        command.execute();
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };
    } else if (mode === "select") {
      const clickedPoint = { x: startX, y: startY };
      const hitObjects = canvasSubject.getObjects().filter((obj) => hitTest(clickedPoint, obj));
      
      if (hitObjects.length === 0) {
        canvasSubject.setSelectedIds([]);
        return;
      }

      const topObject = hitObjects.reduce((prev, curr) =>
        prev.zIndex > curr.zIndex ? prev : curr
      );

      const intendedSelection = e.shiftKey
        ? Array.from(new Set([...canvasSubject.getSelectedIds(), topObject.id]))
        : [topObject.id];
      
      canvasSubject.setSelectedIds(intendedSelection);

      const moveStartX = startX;
      const moveStartY = startY;

      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const deltaX = currentX - moveStartX;
        const deltaY = currentY - moveStartY;

        const command = new MoveShapeCommand(
          canvasSubject.getObjects(),
          intendedSelection,
          deltaX,
          deltaY
        );
        command.execute();
      };

      onMouseUp = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const deltaX = currentX - moveStartX;
        const deltaY = currentY - moveStartY;

        const command = new MoveShapeCommand(
          canvasSubject.getObjects(),
          intendedSelection,
          deltaX,
          deltaY
        );
        command.execute();
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };
    } else {
      return;
    }

    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Flex bgColor={"gray.700"} flex={1} width={"100vw"} height={"100vh"}>
        <Box borderRadius={10}>
          <Sidebar 
            setMode={(mode) => canvasSubject.setMode(mode)} 
            clear={clear} 
          />
          <Text>{canvasSubject.getMode()}</Text>
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
