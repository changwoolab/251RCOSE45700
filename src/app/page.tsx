'use client';

import { ObjectDetails } from "@/components/ObjectDetails";
import { Sidebar } from "@/components/Sidebar";
import { Mode, ObjectInfo } from "@/types/objects";
import { Box, ChakraProvider, defaultSystem, Flex, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<Mode>("line");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Store all drawn objects.
  const [objects, setObjects] = useState<ObjectInfo[]>([]);
  // Store IDs of selected objects.
  const [selectedObjectIds, setSelectedObjectIds] = useState<number[]>([]);
  const idRef = useRef<number>(0);

  // Update canvas size to match parent's dimensions.
  const updateCanvasSize = () => {
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
      redrawObjects();
    }
  };

  // Redraw all objects.
  const redrawObjects = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach((obj) => {
      ctx.strokeStyle = obj.color;
      if (obj.type === "line") {
        ctx.beginPath();
        ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
        ctx.lineTo(obj.currentPoint.x, obj.currentPoint.y);
        ctx.stroke();
      } else if (obj.type === "rectangle") {
        const width = obj.currentPoint.x - obj.startPoint.x;
        const height = obj.currentPoint.y - obj.startPoint.y;
        ctx.beginPath();
        ctx.rect(obj.startPoint.x, obj.startPoint.y, width, height);
        ctx.stroke();
      } else if (obj.type === "circle") {
        const radius = Math.sqrt(
          Math.pow(obj.currentPoint.x - obj.startPoint.x, 2) +
          Math.pow(obj.currentPoint.y - obj.startPoint.y, 2)
        );
        ctx.beginPath();
        ctx.arc(obj.startPoint.x, obj.startPoint.y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    });
  };

  useEffect(() => {
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, [objects]);

  const clear = () => {
    setObjects([]);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
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
      ) / Math.hypot(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x);
    return distance < 5; // threshold (adjust as needed)
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

    // Save current canvas state for drawing previews.
    const savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let onMouseMove: (e: MouseEvent) => void;
    let onMouseUp: (e: MouseEvent) => void;

    if (mode === "line" || mode === "rectangle" || mode === "circle") {
      // Create a new object to be drawn.
      const newObj: ObjectInfo = {
        id: idRef.current++,
        startPoint: { x: startX, y: startY },
        currentPoint: { x: startX, y: startY },
        color: "black",
        type: mode,
      };

      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        ctx.putImageData(savedImageData, 0, 0);
        ctx.strokeStyle = newObj.color;

        if (mode === "line") {
          ctx.beginPath();
          ctx.moveTo(newObj.startPoint.x, newObj.startPoint.y);
          ctx.lineTo(currentX, currentY);
          ctx.stroke();
        } else if (mode === "rectangle") {
          const width = currentX - newObj.startPoint.x;
          const height = currentY - newObj.startPoint.y;
          ctx.beginPath();
          ctx.rect(newObj.startPoint.x, newObj.startPoint.y, width, height);
          ctx.stroke();
        } else if (mode === "circle") {
          const radius = Math.sqrt(
            Math.pow(currentX - newObj.startPoint.x, 2) +
            Math.pow(currentY - newObj.startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(newObj.startPoint.x, newObj.startPoint.y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      };

      onMouseUp = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        newObj.currentPoint = { x: currentX, y: currentY };
        setObjects((prev) => [...prev, newObj]);
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };

    }  else if (mode === "select") {
      // In select mode, perform hit testing.
      const clickedPoint = { x: startX, y: startY };
      let hitIds: number[] = [];
      objects.forEach((obj) => {
        if (hitTest(clickedPoint, obj)) {
          hitIds.push(obj.id);
        }
      });
      // If no object was hit (background click), clear selection and exit.
      if (hitIds.length === 0) {
        setSelectedObjectIds([]);
        return;
      }
      
      // Build the intended selection (shift‑click adds to existing selection).
      const intendedSelection = e.shiftKey
        ? Array.from(new Set([...selectedObjectIds, ...hitIds]))
        : hitIds;
      setSelectedObjectIds(intendedSelection);
    
      // Record original positions for the selected objects.
      const originalPositions = objects
        .filter((obj) => intendedSelection.includes(obj.id))
        .map((obj) => ({
          id: obj.id,
          startPoint: { ...obj.startPoint },
          currentPoint: { ...obj.currentPoint },
        }));
      const moveStartX = startX;
      const moveStartY = startY;
    
      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const deltaX = currentX - moveStartX;
        const deltaY = currentY - moveStartY;
        // Compute new positions for all selected objects.
        const movedObjects = objects.map((obj) => {
          if (intendedSelection.includes(obj.id)) {
            const original = originalPositions.find((o) => o.id === obj.id);
            if (original) {
              return {
                ...obj,
                startPoint: {
                  x: original.startPoint.x + deltaX,
                  y: original.startPoint.y + deltaY,
                },
                currentPoint: {
                  x: original.currentPoint.x + deltaX,
                  y: original.currentPoint.y + deltaY,
                },
              };
            }
          }
          return obj;
        });
        // Update state in real time so that ObjectDetails reflects the new positions.
        setObjects(movedObjects);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        movedObjects.forEach((obj) => {
          ctx.strokeStyle = obj.color;
          if (obj.type === "line") {
            ctx.beginPath();
            ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
            ctx.lineTo(obj.currentPoint.x, obj.currentPoint.y);
            ctx.stroke();
          } else if (obj.type === "rectangle") {
            const width = obj.currentPoint.x - obj.startPoint.x;
            const height = obj.currentPoint.y - obj.startPoint.y;
            ctx.beginPath();
            ctx.rect(obj.startPoint.x, obj.startPoint.y, width, height);
            ctx.stroke();
          } else if (obj.type === "circle") {
            const radius = Math.sqrt(
              Math.pow(obj.currentPoint.x - obj.startPoint.x, 2) +
              Math.pow(obj.currentPoint.y - obj.startPoint.y, 2)
            );
            ctx.beginPath();
            ctx.arc(obj.startPoint.x, obj.startPoint.y, radius, 0, 2 * Math.PI);
            ctx.stroke();
          }
        });
      };
    
      onMouseUp = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        const deltaX = currentX - moveStartX;
        const deltaY = currentY - moveStartY;
        const updatedObjects = objects.map((obj) => {
          if (intendedSelection.includes(obj.id)) {
            const original = originalPositions.find((o) => o.id === obj.id);
            if (original) {
              return {
                ...obj,
                startPoint: {
                  x: original.startPoint.x + deltaX,
                  y: original.startPoint.y + deltaY,
                },
                currentPoint: {
                  x: original.currentPoint.x + deltaX,
                  y: original.currentPoint.y + deltaY,
                },
              };
            }
          }
          return obj;
        });
        setObjects(updatedObjects);
        redrawObjects();
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      }
     } else {
      return;
    }
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
  };

  // Redraw when objects update.
  useEffect(() => {
    redrawObjects();
  }, [objects]);

  return (
    <ChakraProvider value={defaultSystem}>
      <Flex bgColor={"gray.700"} flex={1} width={"100vw"} height={"100vh"}>
        <Box borderRadius={10}>
          <Sidebar setMode={setMode} clear={clear} />
          <Text>{mode}</Text>
        </Box>
        <Box width={"100%"} height={"100%"}>
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            style={{ backgroundColor: "white" }}
          />
        </Box>
        {/* Pass selected objects for property changes (e.g. re-coloring) */}
        <ObjectDetails
          objects={objects.filter((obj) => selectedObjectIds.includes(obj.id))}
        />
      </Flex>
    </ChakraProvider>
  );
}
