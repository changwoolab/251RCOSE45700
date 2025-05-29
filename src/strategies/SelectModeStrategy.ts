import { CanvasModeStrategy, CanvasContext, MousePosition } from "./CanvasModeStrategy";
import { MoveShapeCommand } from "@/commands/CanvasCommand";
import { canvasSubject } from "@/observers/CanvasObserver";
import { ObjectInfo } from "@/types/objects";

export class SelectModeStrategy implements CanvasModeStrategy {
  private hitTest(p: MousePosition, obj: ObjectInfo): boolean {
    if (obj.type === "line") return this.isPointNearLine(p, obj);
    if (obj.type === "rectangle") return this.isPointInRect(p, obj);
    if (obj.type === "circle") return this.isPointInCircle(p, obj);
    return false;
  }

  private isPointNearLine(p: MousePosition, line: ObjectInfo): boolean {
    const { startPoint, currentPoint } = line;
    const distance =
      Math.abs(
        (currentPoint.y - startPoint.y) * p.x -
          (currentPoint.x - startPoint.x) * p.y +
          currentPoint.x * startPoint.y -
          currentPoint.y * startPoint.x
      ) /
      Math.hypot(currentPoint.y - startPoint.y, currentPoint.x - startPoint.x);
    return distance < 5;
  }

  private isPointInRect(p: MousePosition, rectObj: ObjectInfo): boolean {
    const { startPoint, currentPoint } = rectObj;
    const minX = Math.min(startPoint.x, currentPoint.x);
    const maxX = Math.max(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const maxY = Math.max(startPoint.y, currentPoint.y);
    return p.x >= minX && p.x <= maxX && p.y >= minY && p.y <= maxY;
  }

  private isPointInCircle(p: MousePosition, circle: ObjectInfo): boolean {
    const { startPoint, currentPoint } = circle;
    const radius = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
        Math.pow(currentPoint.y - startPoint.y, 2)
    );
    const dist = Math.hypot(p.x - startPoint.x, p.y - startPoint.y);
    return dist <= radius;
  }

  onMouseDown(e: React.MouseEvent<HTMLCanvasElement>, context: CanvasContext) {
    const { canvas } = context;
    const rect = canvas.getBoundingClientRect();
    const startX = e.clientX - rect.left;
    const startY = e.clientY - rect.top;

    const clickedPoint = { x: startX, y: startY };
    const hitObjects = canvasSubject.getObjects().filter((obj) => this.hitTest(clickedPoint, obj));
    
    if (hitObjects.length === 0) {
      canvasSubject.setSelectedIds([]);
      return {};
    }

    const topObject = hitObjects.reduce((prev, curr) =>
      prev.zIndex > curr.zIndex ? prev : curr
    );

    const intendedSelection = e.shiftKey
      ? Array.from(new Set([...canvasSubject.getSelectedIds(), topObject.id]))
      : [topObject.id];
    
    canvasSubject.setSelectedIds(intendedSelection);

    const moveStartX = startX;
    const moveStartY = startY;

    const onMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      const deltaX = currentX - moveStartX;
      const deltaY = currentY - moveStartY;

      const command = new MoveShapeCommand(
        canvasSubject.getObjects(),
        intendedSelection,
        deltaX,
        deltaY
      );
      command.execute();
    };

    const onMouseUp = (e: MouseEvent) => {
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;
      const deltaX = currentX - moveStartX;
      const deltaY = currentY - moveStartY;

      const command = new MoveShapeCommand(
        canvasSubject.getObjects(),
        intendedSelection,
        deltaX,
        deltaY
      );
      command.execute();
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
    };

    return { onMouseMove, onMouseUp };
  }
} 