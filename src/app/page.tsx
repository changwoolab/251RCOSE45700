'use client';

import { Sidebar } from "@/components/Sidebar";
import { Mode } from "@/types/objects";
import { ChakraProvider, defaultSystem, Text } from "@chakra-ui/react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<Mode>("line")
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [infoObject, setInfoObject] = useState<{
    id: number;
    startPoint: { x: number; y: number };
    currentPoint: { x: number; y: number };
  } |
  null>(null);
  const idRef = useRef<number>(0);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;
  
    // Save starting information for the shape being drawn.
    setInfoObject({
      id: idRef.current++,
      startPoint: { x: startX, y: startY },
      currentPoint: { x: startX, y: startY },
    });
  
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
  
    // Save the current canvas state to preserve existing drawings.
    const savedImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  
    // Define a generic mousemove handler that will be customized based on mode.
    let onMouseMove: (e: MouseEvent) => void;
    let onMouseUp: () => void;
  
    if (mode === "line") {
      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
  
        // Restore the previous drawing without clearing the canvas
        ctx.putImageData(savedImageData, 0, 0);
  
        // Draw a preview of a straight line from the start point to the current mouse position.
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();
  
        // Update currentPoint in case you want to use it later.
        setInfoObject((prev: any)=> ({
          ...prev,
          currentPoint: { x: currentX, y: currentY },
        }));
      };
  
      onMouseUp = () => {
        // Remove event listeners once drawing is complete.
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };
    } else if (mode === "rectangle") {
      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
  
        ctx.putImageData(savedImageData, 0, 0);
  
        // Calculate width and height from the starting point to the current position.
        const width = currentX - startX;
        const height = currentY - startY;
  
        ctx.beginPath();
        ctx.rect(startX, startY, width, height);
        ctx.stroke();
  
        setInfoObject((prev: any) => ({
          ...prev,
          currentPoint: { x: currentX, y: currentY },
        }));
      };
  
      onMouseUp = () => {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };
    } else if (mode === "circle") {
      onMouseMove = (e: MouseEvent) => {
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
  
        ctx.putImageData(savedImageData, 0, 0);
  
        // Calculate radius as the distance from the starting point to the current mouse position.
        const radius = Math.sqrt(Math.pow(currentX - startX, 2) + Math.pow(currentY - startY, 2));
  
        ctx.beginPath();
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
  
        setInfoObject((prev: any) => ({
          ...prev,
          currentPoint: { x: currentX, y: currentY },
        }));
      };
  
      onMouseUp = () => {
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };
    } else if (mode === "select") {
      // TODO
      console.log("select");
      return;
    } else {
      return;
    }
  
    // Attach the temporary event listeners.
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
  };
  
  return (
    <ChakraProvider value={defaultSystem}>
      <div className="bg-[#2b2b2b] flex h-screen">
        <div className="flex flex-col">
          <Sidebar setMode={setMode} clear={clear} />
          <Text>{mode}</Text>
        </div>
        <div>
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            width={850}
            height={650}
            className="bg-white border border-black rounded-md"
          />
        </div>
        {/* <ObjectDetails
          mode={mode}
          startPoint={infoObject?.startPoint}
          endPoint={infoObject?.currentPoint}
          zOrder={infoObject?.id}
          color={infoObject?.fillColor}
        /> */}
      </div>
    </ChakraProvider>
  );
}
