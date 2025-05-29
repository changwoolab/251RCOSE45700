import { ObjectInfo, Mode, Point } from "@/types/objects";

export interface CanvasState {
  objects: ObjectInfo[];
  selectedIds: number[];
  mode: Mode;
}

export class CanvasModel {
  private state: CanvasState = {
    objects: [],
    selectedIds: [],
    mode: "select"
  };

  private observers: ((state: CanvasState) => void)[] = [];

  // Observer management
  subscribe(observer: (state: CanvasState) => void): () => void {
    this.observers.push(observer);
    return () => {
      this.observers = this.observers.filter(obs => obs !== observer);
    };
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => observer(this.state));
  }

  // State management
  getState(): CanvasState {
    return { ...this.state };
  }

  // Mode management
  setMode(mode: Mode): void {
    this.state = { ...this.state, mode };
    this.notifyObservers();
  }

  // Object management
  addObject(object: ObjectInfo): void {
    this.state = {
      ...this.state,
      objects: [...this.state.objects, object]
    };
    this.notifyObservers();
  }

  updateObject(updatedObject: ObjectInfo): void {
    this.state = {
      ...this.state,
      objects: this.state.objects.map(obj => 
        obj.id === updatedObject.id ? updatedObject : obj
      )
    };
    this.notifyObservers();
  }

  deleteObjects(idsToDelete: number[]): void {
    const newObjects = this.state.objects.filter(obj => !idsToDelete.includes(obj.id));
    const newSelectedIds = this.state.selectedIds.filter(id => !idsToDelete.includes(id));
    
    this.state = {
      ...this.state,
      objects: newObjects,
      selectedIds: newSelectedIds
    };
    this.notifyObservers();
  }

  // Selection management
  setSelectedIds(selectedIds: number[]): void {
    this.state = { ...this.state, selectedIds };
    this.notifyObservers();
  }

  // Hit testing
  findObjectsAtPoint(point: Point): ObjectInfo[] {
    return this.state.objects.filter(obj => this.hitTest(point, obj));
  }

  private hitTest(point: Point, obj: ObjectInfo): boolean {
    switch (obj.type) {
      case "line":
        return this.hitTestLine(point, obj);
      case "rectangle":
        return this.hitTestRectangle(point, obj);
      case "circle":
        return this.hitTestCircle(point, obj);
      default:
        return false;
    }
  }

  private hitTestLine(point: Point, obj: ObjectInfo): boolean {
    const { startPoint, currentPoint } = obj;
    const lineLength = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
      Math.pow(currentPoint.y - startPoint.y, 2)
    );
    if (lineLength === 0) return false;

    const distance = Math.abs(
      (currentPoint.y - startPoint.y) * point.x -
      (currentPoint.x - startPoint.x) * point.y +
      currentPoint.x * startPoint.y -
      currentPoint.y * startPoint.x
    ) / lineLength;

    return distance < 5;
  }

  private hitTestRectangle(point: Point, obj: ObjectInfo): boolean {
    const { startPoint, currentPoint } = obj;
    const minX = Math.min(startPoint.x, currentPoint.x);
    const maxX = Math.max(startPoint.x, currentPoint.x);
    const minY = Math.min(startPoint.y, currentPoint.y);
    const maxY = Math.max(startPoint.y, currentPoint.y);

    return (
      point.x >= minX &&
      point.x <= maxX &&
      point.y >= minY &&
      point.y <= maxY
    );
  }

  private hitTestCircle(point: Point, obj: ObjectInfo): boolean {
    const { startPoint, currentPoint } = obj;
    const radius = Math.sqrt(
      Math.pow(currentPoint.x - startPoint.x, 2) +
      Math.pow(currentPoint.y - startPoint.y, 2)
    );
    const distance = Math.sqrt(
      Math.pow(point.x - startPoint.x, 2) +
      Math.pow(point.y - startPoint.y, 2)
    );

    return distance <= radius;
  }

  // Movement calculation
  calculateMoveDelta(startPoint: Point, currentPoint: Point): Point {
    return {
      x: currentPoint.x - startPoint.x,
      y: currentPoint.y - startPoint.y
    };
  }

  moveObjects(ids: number[], delta: Point): void {
    this.state = {
      ...this.state,
      objects: this.state.objects.map(obj => {
        if (ids.includes(obj.id)) {
          return {
            ...obj,
            startPoint: {
              x: obj.startPoint.x + delta.x,
              y: obj.startPoint.y + delta.y
            },
            currentPoint: {
              x: obj.currentPoint.x + delta.x,
              y: obj.currentPoint.y + delta.y
            }
          };
        }
        return obj;
      })
    };
    this.notifyObservers();
  }
}

// Singleton instance
export const canvasModel = new CanvasModel(); 