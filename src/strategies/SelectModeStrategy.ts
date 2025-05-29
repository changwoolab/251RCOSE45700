import { CanvasModeStrategy, CanvasContext, MousePosition } from "./CanvasModeStrategy";
import { Point } from "@/types/objects";

export class SelectModeStrategy implements CanvasModeStrategy {
  onMouseDown(e: React.MouseEvent<HTMLCanvasElement>, context: CanvasContext) {
    const { model, view } = context;
    const rect = view.getCanvasRect();
    const clickedPoint: Point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    // Find objects at clicked point using model's hit testing
    const hitObjects = model.findObjectsAtPoint(clickedPoint);

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
      let lastMousePos: Point = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      // Handle object movement
      const onMouseMove = (e: MouseEvent) => {
        const currentMousePos: Point = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };

        // Calculate movement delta using model's calculation method
        const delta = model.calculateMoveDelta(lastMousePos, currentMousePos);

        // Move objects using model's move method
        model.moveObjects(newSelectedIds, delta);

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