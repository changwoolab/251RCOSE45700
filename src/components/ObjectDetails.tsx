import { ObjectInfo } from "@/types/objects";
import { Box, Text, VStack } from "@chakra-ui/react";
import { CanvasObserver, canvasSubject } from "@/observers/CanvasObserver";
import { useEffect, useState } from "react";

interface ObjectDetailsProps {
  onUpdate: (updated: ObjectInfo) => void;
}

export function ObjectDetails({ onUpdate }: ObjectDetailsProps) {
  const [selectedObjects, setSelectedObjects] = useState<ObjectInfo[]>([]);

  useEffect(() => {
    const observer: CanvasObserver = {
      onObjectsChanged: (objects) => {
        // Update selected objects when objects change
        const selectedIds = canvasSubject.getSelectedIds();
        setSelectedObjects(objects.filter(obj => selectedIds.includes(obj.id)));
      },
      onSelectionChanged: (selectedIds) => {
        // Update selected objects when selection changes
        const objects = canvasSubject.getObjects();
        setSelectedObjects(objects.filter(obj => selectedIds.includes(obj.id)));
      },
      onModeChanged: () => {
        // No need to update on mode change
      }
    };

    // Initial setup
    const objects = canvasSubject.getObjects();
    const selectedIds = canvasSubject.getSelectedIds();
    setSelectedObjects(objects.filter(obj => selectedIds.includes(obj.id)));

    // Attach observer
    canvasSubject.attach(observer);

    // Cleanup
    return () => {
      canvasSubject.detach(observer);
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
