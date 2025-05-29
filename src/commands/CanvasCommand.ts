import { ObjectInfo } from "@/types/objects";
import { canvasSubject } from "@/observers/CanvasObserver";

// Command 인터페이스
export abstract class CanvasCommand {
  abstract execute(): void;
  abstract undo(): void;
}

// 도형 생성 Command
export class CreateShapeCommand extends CanvasCommand {
  constructor(
    private objects: ObjectInfo[],
    private newObject: ObjectInfo
  ) {
    super();
  }

  execute(): void {
    const newObjects = [...this.objects, this.newObject];
    canvasSubject.setObjects(newObjects);
  }

  undo(): void {
    const newObjects = this.objects.filter(obj => obj.id !== this.newObject.id);
    canvasSubject.setObjects(newObjects);
  }
}

// 도형 이동 Command
export class MoveShapeCommand extends CanvasCommand {
  constructor(
    private objects: ObjectInfo[],
    private selectedIds: number[],
    private deltaX: number,
    private deltaY: number
  ) {
    super();
  }

  execute(): void {
    const newObjects = this.objects.map(obj => {
      if (this.selectedIds.includes(obj.id)) {
        return {
          ...obj,
          startPoint: {
            x: obj.startPoint.x + this.deltaX,
            y: obj.startPoint.y + this.deltaY
          },
          currentPoint: {
            x: obj.currentPoint.x + this.deltaX,
            y: obj.currentPoint.y + this.deltaY
          }
        };
      }
      return obj;
    });
    canvasSubject.setObjects(newObjects);
  }

  undo(): void {
    const newObjects = this.objects.map(obj => {
      if (this.selectedIds.includes(obj.id)) {
        return {
          ...obj,
          startPoint: {
            x: obj.startPoint.x - this.deltaX,
            y: obj.startPoint.y - this.deltaY
          },
          currentPoint: {
            x: obj.currentPoint.x - this.deltaX,
            y: obj.currentPoint.y - this.deltaY
          }
        };
      }
      return obj;
    });
    canvasSubject.setObjects(newObjects);
  }
}

// 도형 삭제 Command
export class DeleteShapeCommand extends CanvasCommand {
  constructor(
    private objects: ObjectInfo[],
    private idsToDelete: number[]
  ) {
    super();
  }

  execute(): void {
    const newObjects = this.objects.filter(obj => !this.idsToDelete.includes(obj.id));
    canvasSubject.setObjects(newObjects);
    // Clear selection when objects are deleted
    canvasSubject.setSelectedIds([]);
  }

  undo(): void {
    canvasSubject.setObjects(this.objects);
  }
}

export class UpdateShapeCommand extends CanvasCommand {
  constructor(
    private objects: ObjectInfo[],
    private updatedObject: ObjectInfo
  ) {
    super();
  }

  execute(): void {
    const newObjects = this.objects.map(obj => 
      obj.id === this.updatedObject.id ? this.updatedObject : obj
    );
    canvasSubject.setObjects(newObjects);
  }

  undo(): void {
    const newObjects = this.objects.map(obj => 
      obj.id === this.updatedObject.id ? this.objects.find(o => o.id === obj.id)! : obj
    );
    canvasSubject.setObjects(newObjects);
  }
} 