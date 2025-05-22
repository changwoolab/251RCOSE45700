import { ObjectInfo } from "@/types/objects";
import { getShapeEditor } from "@/shapes/ShapeEditors";
import { Box, Text } from "@chakra-ui/react";
import React from "react";

export function ObjectDetails({ objects, onUpdate }: { objects: ObjectInfo[]; onUpdate: (updated: ObjectInfo) => void; }) {
  if (!objects || objects.length === 0) {
    return (
      <Box minW={300} p={2} bg="gray.700">
        No objects available.
      </Box>
    );
  }

  // 선택된 객체들 중 z-index가 가장 높은 객체만 보여줌.
  const highestZIndexObject = objects.reduce((prev, curr) =>
    prev.zIndex > curr.zIndex ? prev : curr
  );

  return (
    <Box minW={300} p={2} bg="gray.700">
      <ObjectDetail
        key={highestZIndexObject.id}
        objectInfo={highestZIndexObject}
        onUpdate={onUpdate}
      />
    </Box>
  );
}

function ObjectDetail({ objectInfo, onUpdate }: { objectInfo: ObjectInfo; onUpdate: (updated: ObjectInfo) => void; }) {
  const { id, startPoint, currentPoint, color, fillColor, zIndex, type } = objectInfo;

  // 전략 패턴을 사용하여 도형 타입에 맞는 에디터 가져오기
  const shapeEditor = getShapeEditor(type);
  const sizeFields = shapeEditor.renderSizeFields(objectInfo, onUpdate);

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
        <input
          type="color"
          value={color}
          onChange={(e) => onUpdate({ ...objectInfo, color: e.target.value })}
        />
      </Text>
      <Text>
        Fill Color:{" "}
        <input
          type="color"
          value={fillColor}
          onChange={(e) =>
            onUpdate({ ...objectInfo, fillColor: e.target.value })
          }
        />
      </Text>
      <Text>
        Z-Index:{" "}
        <input
          type="number"
          value={zIndex}
          onChange={(e) =>
            onUpdate({
              ...objectInfo,
              zIndex: parseInt(e.target.value, 10) || 0,
            })
          }
        />
      </Text>
      {sizeFields}
    </Box>
  );
}
