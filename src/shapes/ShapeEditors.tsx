import { ObjectInfo, Shape } from "@/types/objects";
import { Text } from "@chakra-ui/react";
import React from "react";

// Shape Editor Strategy Interface
export interface ShapeEditor {
  renderSizeFields: (
    objectInfo: ObjectInfo, 
    onUpdate: (updated: ObjectInfo) => void
  ) => React.ReactNode;
}

// Shape Editor Registry - stores all available shape editors
const shapeEditorRegistry: Record<Shape, ShapeEditor> = {} as Record<Shape, ShapeEditor>;

// Register a shape editor
export function registerShapeEditor(shapeType: Shape, strategy: ShapeEditor): void {
  shapeEditorRegistry[shapeType] = strategy;
}

// Get a shape editor
export function getShapeEditor(shapeType: Shape): ShapeEditor {
  const editor = shapeEditorRegistry[shapeType];
  if (!editor) {
    throw new Error(`No editor registered for shape type: ${shapeType}`);
  }
  return editor;
}

// Line Editor Strategy
const lineEditor: ShapeEditor = {
  renderSizeFields: (objectInfo, onUpdate) => {
    const { currentPoint } = objectInfo;
    
    return (
      <>
        <Text>
          End X: <input
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
          End Y: <input
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
  }
};

// Rectangle Editor Strategy
const rectangleEditor: ShapeEditor = {
  renderSizeFields: (objectInfo, onUpdate) => {
    const { startPoint, currentPoint } = objectInfo;
    const width = currentPoint.x - startPoint.x;
    const height = currentPoint.y - startPoint.y;
    
    return (
      <>
        <Text>
          Width: <input
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
          Height: <input
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
  }
};

// Circle Editor Strategy
const circleEditor: ShapeEditor = {
  renderSizeFields: (objectInfo, onUpdate) => {
    const { startPoint, currentPoint } = objectInfo;
    const radius = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
      Math.pow(currentPoint.y - startPoint.y, 2)
    );
    
    return (
      <Text>
        Radius: <input
          type="number"
          value={radius}
          onChange={(e) => {
            const newRadius = parseFloat(e.target.value);
            onUpdate({
              ...objectInfo,
              currentPoint: { x: startPoint.x + newRadius, y: startPoint.y },
            });
          }}
        />
      </Text>
    );
  }
};

// Register all shape editors
registerShapeEditor("line", lineEditor);
registerShapeEditor("rectangle", rectangleEditor);
registerShapeEditor("circle", circleEditor);
