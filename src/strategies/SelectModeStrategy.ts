import { CanvasModeStrategy, CanvasContext, MousePosition, ObjectInfo } from "./CanvasModeStrategy";

export class SelectModeStrategy implements CanvasModeStrategy {
  private hitTest(mousePos: MousePosition, obj: ObjectInfo): boolean {
    switch (obj.type) {
      case "line":
        return this.hitTestLine(mousePos, obj);
      case "rectangle":
        return this.hitTestRectangle(mousePos, obj);
      case "circle":
        return this.hitTestCircle(mousePos, obj);
      default:
        return false;
    }
  }

  private hitTestLine(mousePos: MousePosition, obj: ObjectInfo): boolean {
    const { startPoint, currentPoint } = obj;
    const lineLength = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
      Math.pow(currentPoint.y - startPoint.y, 2)
    );
    if (lineLength === 0) return false;

    const distance = Math.abs(
      (currentPoint.y - startPoint.y) * mousePos.x -
      (currentPoint.x - startPoint.x) * mousePos.y +
      currentPoint.x * startPoint.y -
      currentPoint.y * startPoint.x
    ) / lineLength;

    return distance < 5;
  }

  private hitTestRectangle(mousePos: MousePosition, obj: ObjectInfo): boolean {
    const { startPoint, currentPoint } = obj;
    const minX = Math.min(startPoint.x, currentPoint.x);
    const maxX = Math.max(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const maxY = Math.max(startPoint.y, currentPoint.y);

    return (
      mousePos.x >= minX &&
      mousePos.x <= maxX &&
      mousePos.y >= minY &&
      mousePos.y <= maxY
    );
  }

  private hitTestCircle(mousePos: MousePosition, obj: ObjectInfo): boolean {
    const { startPoint, currentPoint } = obj;
    const radius = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
      Math.pow(currentPoint.y - startPoint.y, 2)
    );
    const distance = Math.sqrt(
      Math.pow(mousePos.x - startPoint.x, 2) +
      Math.pow(mousePos.y - startPoint.y, 2)
    );

    return distance <= radius;
  }

  onMouseDown(e: React.MouseEvent<HTMLCanvasElement>, context: CanvasContext) {
    const { model, view } = context;
    const rect = view.getCanvasRect();
    const clickedPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Get objects from state
    const objects = model.getState().objects;
    const hitObjects = objects.filter(obj => this.hitTest(clickedPoint, obj));

    if (hitObjects.length > 0) {
      const hitObject = hitObjects[hitObjects.length - 1]; // Get the topmost object
      const currentSelectedIds = model.getState().selectedIds;

      let newSelectedIds: number[];
      if (e.shiftKey) {
        // Toggle selection if shift is pressed
        if (currentSelectedIds.includes(hitObject.id)) {
          newSelectedIds = currentSelectedIds.filter(id => id !== hitObject.id);
        } else {
          newSelectedIds = [...currentSelectedIds, hitObject.id];
        }
      } else {
        // Select only the clicked object if shift is not pressed
        newSelectedIds = [hitObject.id];
      }

      model.setSelectedIds(newSelectedIds);

      // Track the last mouse position for relative movement
      let lastMousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Handle object movement
      const onMouseMove = (e: MouseEvent) => {
        const currentMousePos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };

        // Calculate the relative movement since last mouse position
        const deltaX = currentMousePos.x - lastMousePos.x;
        const deltaY = currentMousePos.y - lastMousePos.y;

        // Update objects with the relative movement
        model.moveObjects(newSelectedIds, deltaX, deltaY);

        // Update last mouse position
        lastMousePos = currentMousePos;
      };

      const onMouseUp = () => {
        const canvas = e.target as HTMLCanvasElement;
        canvas.removeEventListener("mousemove", onMouseMove);
        canvas.removeEventListener("mouseup", onMouseUp);
      };

      return { onMouseMove, onMouseUp };
    } else if (!e.shiftKey) {
      // Clear selection if clicking on empty space without shift
      model.setSelectedIds([]);
    }

    return {};
  }
} 