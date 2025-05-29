import { ObjectInfo } from "@/types/objects";
import { Box, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { canvasStore } from "@/flux/CanvasStore";

interface ObjectDetailsProps {
  onUpdate: (updated: ObjectInfo) => void;
}

export function ObjectDetails({ onUpdate }: ObjectDetailsProps) {
  const [selectedObjects, setSelectedObjects] = useState<ObjectInfo[]>([]);

  useEffect(() => {
    const handleChange = () => {
      const state = canvasStore.getState();
      setSelectedObjects(
        state.objects.filter(obj => state.selectedIds.includes(obj.id))
      );
    };

    // Initial setup
    handleChange();

    // Subscribe to store changes
    canvasStore.addChangeListener(handleChange);
    return () => {
      canvasStore.removeChangeListener(handleChange);
    };
  }, []);

  if (selectedObjects.length === 0) {
    return (
      <Box p={4} bgColor="gray.100" width="200px">
        <Text>No object selected</Text>
      </Box>
    );
  }

  return (
    <Box p={4} bgColor="gray.100" width="200px">
      <VStack align="stretch" gap={4}>
        {selectedObjects.map((obj) => (
          <Box key={obj.id} p={2} borderWidth={1} borderRadius="md">
            <Text>Type: {obj.type}</Text>
            <Text>
              Color:{" "}
              <input
                type="color"
                value={obj.color}
                onChange={(e) =>
                  onUpdate({ ...obj, color: e.target.value })
                }
              />
            </Text>
            <Text>
              Fill:{" "}
              <input
                type="color"
                value={obj.fillColor}
                onChange={(e) =>
                  onUpdate({ ...obj, fillColor: e.target.value })
                }
              />
            </Text>
            {obj.type === "rectangle" && (
              <>
                <Text>
                  Width:{" "}
                  {Math.abs(obj.currentPoint.x - obj.startPoint.x).toFixed(0)}px
                </Text>
                <Text>
                  Height:{" "}
                  {Math.abs(obj.currentPoint.y - obj.startPoint.y).toFixed(0)}px
                </Text>
              </>
            )}
            {obj.type === "circle" && (
              <Text>
                Radius:{" "}
                {Math.sqrt(
                  Math.pow(obj.currentPoint.x - obj.startPoint.x, 2) +
                    Math.pow(obj.currentPoint.y - obj.startPoint.y, 2)
                ).toFixed(0)}
                px
              </Text>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
}
