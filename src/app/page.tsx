'use client';

import { Sidebar } from "@/components/Sidebar";
import { Mode } from "@/types/objects";
import { ChakraProvider, defaultSystem, Text } from "@chakra-ui/react";
import Image from "next/image";
import { useRef, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<Mode>("line")
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const clear = () => {}
  
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
            // onMouseDown={onMouseDown}
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
