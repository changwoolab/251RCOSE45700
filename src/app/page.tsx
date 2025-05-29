'use client';

import { ObjectDetails } from "@/components/ObjectDetails";
import { Sidebar } from "@/components/Sidebar";
import { Mode, ObjectInfo, Shape } from "@/types/objects";
import { Box, ChakraProvider, defaultSystem, Flex, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { DrawModeStrategy } from "@/strategies/DrawModeStrategy";
import { SelectModeStrategy } from "@/strategies/SelectModeStrategy";
import { CanvasModeStrategy } from "@/strategies/CanvasModeStrategy";
import { canvasModel } from "@/models/CanvasModel";
import { useCanvas } from "@/hooks/useCanvas";

export default function Home() {
  const [state, setState] = useState(canvasModel.getState());
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

  const { canvasRef, onMouseDown } = useCanvas({ state, currentStrategy });

  const clear = useCallback(() => {
    canvasModel.deleteObjects(state.objects.map(obj => obj.id));
  }, [state.objects]);

  const updateObject = useCallback((updated: ObjectInfo) => {
    canvasModel.updateObject(updated);
  }, []);

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
