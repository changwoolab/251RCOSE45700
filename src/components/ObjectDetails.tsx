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
  const { id, startPoint, currentPoint, color, fillColor, zIndex, type } = objectInfo;

  // Prepare size input fields based on the shape type.
  let sizeFields = null;
  if (type === "line") {
    // For a line, let the user update the end point coordinates.
    sizeFields = (
      <>
        <Text>
          End X:{" "}
          <input
            type="number"
            value={currentPoint.x}
            onChange={(e) => {
              const newX = parseFloat(e.target.value);
              onUpdate({
                ...objectInfo,
                currentPoint: { ...currentPoint, x: newX },
              });
            }}
          />
        </Text>
        <Text>
          End Y:{" "}
          <input
            type="number"
            value={currentPoint.y}
            onChange={(e) => {
              const newY = parseFloat(e.target.value);
              onUpdate({
                ...objectInfo,
                currentPoint: { ...currentPoint, y: newY },
              });
            }}
          />
        </Text>
      </>
    );
  } else if (type === "rectangle") {
    // For a rectangle, calculate width and height.
    const width = currentPoint.x - startPoint.x;
    const height = currentPoint.y - startPoint.y;
    sizeFields = (
      <>
        <Text>
          Width:{" "}
          <input
            type="number"
            value={width}
            onChange={(e) => {
              const newWidth = parseFloat(e.target.value);
              onUpdate({
                ...objectInfo,
                currentPoint: { x: startPoint.x + newWidth, y: currentPoint.y },
              });
            }}
          />
        </Text>
        <Text>
          Height:{" "}
          <input
            type="number"
            value={height}
            onChange={(e) => {
              const newHeight = parseFloat(e.target.value);
              onUpdate({
                ...objectInfo,
                currentPoint: { x: currentPoint.x, y: startPoint.y + newHeight },
              });
            }}
          />
        </Text>
      </>
    );
  } else if (type === "circle") {
    // For a circle, compute the radius.
    const radius = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
        Math.pow(currentPoint.y - startPoint.y, 2)
    );
    sizeFields = (
      <Text>
        Radius:{" "}
        <input
          type="number"
          value={radius}
          onChange={(e) => {
            const newRadius = parseFloat(e.target.value);
            // We update currentPoint horizontally relative to startPoint.
            onUpdate({
              ...objectInfo,
              currentPoint: { x: startPoint.x + newRadius, y: startPoint.y },
            });
          }}
        />
      </Text>
    );
  }

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
        <input type="color" value={color} onChange={(e) => onUpdate({ ...objectInfo, color: e.target.value })} />
      </Text>
      <Text>
        Fill Color:{" "}
        <input type="color" value={fillColor} onChange={(e) => onUpdate({ ...objectInfo, fillColor: e.target.value })} />
      </Text>
      <Text>
        Z-Index:{" "}
        <input type="number" value={zIndex} onChange={(e) => onUpdate({ ...objectInfo, zIndex: parseInt(e.target.value, 10) || 0 })} />
      </Text>
      {sizeFields}
    </Box>
  );
}