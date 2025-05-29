import { Box, Input, Stack, Text } from "@chakra-ui/react";
import { ObjectInfo } from "@/types/objects";
import { useEffect, useState } from "react";

export interface ObjectDetailsProps {
  object: ObjectInfo;
  onUpdate: (updated: ObjectInfo) => void;
}

export function ObjectDetails({ object, onUpdate }: ObjectDetailsProps) {
  const [localObject, setLocalObject] = useState<ObjectInfo>(object);

  // Update local state when object prop changes
  useEffect(() => {
    setLocalObject(object);
  }, [object]);

  const handleChange = (field: keyof ObjectInfo, value: unknown) => {
    const updated = { ...localObject, [field]: value };
    setLocalObject(updated);
    onUpdate(updated);
  };

  return (
    <Stack gap={4}>
      <Text fontSize="lg" fontWeight="bold">Object Details</Text>
      
      <Box>
        <Text mb={2}>Type</Text>
        <select
          value={localObject.type}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleChange("type", e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #E2E8F0",
            backgroundColor: "white"
          }}
        >
          <option value="line">Line</option>
          <option value="rectangle">Rectangle</option>
          <option value="circle">Circle</option>
        </select>
      </Box>

      <Box>
        <Text mb={2}>Stroke Color</Text>
        <Input
          type="color"
          value={localObject.color}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("color", e.target.value)}
        />
      </Box>

      <Box>
        <Text mb={2}>Fill Color</Text>
        <Input
          type="color"
          value={localObject.fillColor}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("fillColor", e.target.value)}
        />
      </Box>

      <Box>
        <Text fontWeight="medium" mb={2}>Position</Text>
        <Stack direction="row" gap={2}>
          <Box>
            <Text mb={1}>X</Text>
            <Input
              type="number"
              value={localObject.startPoint.x}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("startPoint", {
                ...localObject.startPoint,
                x: Number(e.target.value)
              })}
            />
          </Box>
          <Box>
            <Text mb={1}>Y</Text>
            <Input
              type="number"
              value={localObject.startPoint.y}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("startPoint", {
                ...localObject.startPoint,
                y: Number(e.target.value)
              })}
            />
          </Box>
        </Stack>
      </Box>

      <Box>
        <Text fontWeight="medium" mb={2}>Size</Text>
        <Stack direction="row" gap={2}>
          <Box>
            <Text mb={1}>Width</Text>
            <Input
              type="number"
              value={Math.abs(localObject.currentPoint.x - localObject.startPoint.x)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("currentPoint", {
                ...localObject.currentPoint,
                x: localObject.startPoint.x + Number(e.target.value)
              })}
            />
          </Box>
          <Box>
            <Text mb={1}>Height</Text>
            <Input
              type="number"
              value={Math.abs(localObject.currentPoint.y - localObject.startPoint.y)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange("currentPoint", {
                ...localObject.currentPoint,
                y: localObject.startPoint.y + Number(e.target.value)
              })}
            />
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
}
