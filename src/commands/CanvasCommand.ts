import { ObjectInfo } from "@/types/objects";

// Command 인터페이스
export interface CanvasCommand {
  execute(): void;
}

// 도형 생성 Command
export class CreateShapeCommand implements CanvasCommand {
  constructor(
    private objects: ObjectInfo[],
    private setObjects: (objects: ObjectInfo[]) => void,
    private newObject: ObjectInfo
  ) {}

  execute(): void {
    this.setObjects([...this.objects, this.newObject]);
  }
}

// 도형 이동 Command
export class MoveShapeCommand implements CanvasCommand {
  constructor(
    private objects: ObjectInfo[],
    private setObjects: (objects: ObjectInfo[]) => void,
    private selectedIds: number[],
    private deltaX: number,
    private deltaY: number
  ) {}

  execute(): void {
    const movedObjects = this.objects.map(obj => {
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
    this.setObjects(movedObjects);
  }
}

// 도형 삭제 Command
export class DeleteShapeCommand implements CanvasCommand {
  constructor(
    private objects: ObjectInfo[],
    private setObjects: (objects: ObjectInfo[]) => void,
    private selectedIds: number[]
  ) {}

  execute(): void {
    this.setObjects(this.objects.filter(obj => !this.selectedIds.includes(obj.id)));
  }
} 