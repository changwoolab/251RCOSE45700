import { ObjectInfo } from "@/types/objects";
import { CanvasModeStrategy, CanvasContext, MousePosition } from "./CanvasModeStrategy";
import { CreateShapeCommand } from "@/commands/CanvasCommand";
import { shapeDrawerFactory } from "@/shapes/ShapeDrawer";
import { canvasSubject } from "@/observers/CanvasObserver";

export class DrawModeStrategy implements CanvasModeStrategy {
  constructor(private mode: "line" | "rectangle" | "circle") {}

  private createNewObject(startPos: MousePosition, id: number): ObjectInfo {
    return {
      id,
      startPoint: { x: startPos.x, y: startPos.y },
      currentPoint: { x: startPos.x, y: startPos.y },
      color: "black",
      fillColor: "transparent",
      zIndex: id,
      type: this.mode,
    };
  }

  onMouseDown(e: React.MouseEvent<HTMLCanvasElement>, context: CanvasContext) {
    const { canvas, ctx, savedImageData, idRef } = context;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const newObj = this.createNewObject({ x: startX, y: startY }, idRef.current++);

    const onMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      ctx.putImageData(savedImageData, 0, 0);
      ctx.strokeStyle = newObj.color;
      const drawer = shapeDrawerFactory.getDrawer(newObj.type);
      newObj.currentPoint = { x: currentX, y: currentY };
      drawer.draw(ctx, newObj);
    };

    const onMouseUp = (e: MouseEvent) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      newObj.currentPoint = { x: currentX, y: currentY };
      const command = new CreateShapeCommand(
        canvasSubject.getObjects(),
        newObj
      );
      command.execute();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };

    return { onMouseMove, onMouseUp };
  }
} 