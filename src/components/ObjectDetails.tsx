import { ObjectInfo } from "@/types/objects";
import { Box, Text } from "@chakra-ui/react";
import React from "react";

export function ObjectDetails({ objects, onUpdate }: { objects: ObjectInfo[]; onUpdate: (updated: ObjectInfo) => void; }) {
  return (
    <Box minW={300} p={2} bg="gray.700">
      {objects.map((object) => (
        <ObjectDetail key={object.id} objectInfo={object} onUpdate={onUpdate} />
      ))}
    </Box>
  );
}

function ObjectDetail({ objectInfo, onUpdate }: { objectInfo: ObjectInfo; onUpdate: (updated: ObjectInfo) => void; }) {
  const { id, startPoint, currentPoint, color, fillColor, zIndex } = objectInfo;

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...objectInfo, color: e.target.value });
  };

  const handleFillColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...objectInfo, fillColor: e.target.value });
  };

  const handleZIndexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({ ...objectInfo, zIndex: parseInt(e.target.value, 10) || 0 });
  };

  return (
    <Box minW={300} border="1px solid gray" p={2} mb={2}>
      <Text>Object Id: {id}</Text>
      <Text>
        Start Point: ({startPoint.x}, {startPoint.y})
      </Text>
      <Text>
        Current Point: ({currentPoint.x}, {currentPoint.y})
      </Text>
      <Text>
        Stroke Color:{" "}
        <input type="color" value={color} onChange={handleColorChange} />
      </Text>
      <Text>
        Fill Color:{" "}
        <input type="color" value={fillColor} onChange={handleFillColorChange} />
      </Text>
      <Text>
        Z-Index:{" "}
        <input type="number" value={zIndex} onChange={handleZIndexChange} />
      </Text>
    </Box>
  );
}
