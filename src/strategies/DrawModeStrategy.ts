import { CanvasModeStrategy, CanvasContext } from "./CanvasModeStrategy";
import { ObjectInfo, Point, Shape } from "@/types/objects";

export class DrawModeStrategy implements CanvasModeStrategy {
  constructor(private mode: Shape) {}

  private createNewObject(startPoint: Point, id: number): ObjectInfo {
    return {
      id,
      startPoint,
      currentPoint: { ...startPoint },
      color: "#000000",
      fillColor: "#ffffff",
      zIndex: 0,
      type: this.mode
    };
  }

  onMouseDown(e: React.MouseEvent<HTMLCanvasElement>, context: CanvasContext) {
    const { model, view, idRef } = context;
    const rect = view.getCanvasRect();
    const startPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Create new object
    const newObject = this.createNewObject(startPoint, idRef.current++);
    model.addObject(newObject);

    const onMouseMove = (e: MouseEvent) => {
      const currentMousePos: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Update the object's current point
      const updatedObject = {
        ...newObject,
        currentPoint: currentMousePos
      };
      model.updateObject(updatedObject);
    };

    const onMouseUp = () => {
      const canvas = e.target as HTMLCanvasElement;
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };

    return { onMouseMove, onMouseUp };
  }
} 