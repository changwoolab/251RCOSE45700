import { ObjectInfo, Mode } from "@/types/objects";

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

  setMode(mode: Mode): void {
    this.state = { ...this.state, mode };
    this.notifyObservers();
  }

  // Object manipulation
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

  moveObjects(ids: number[], deltaX: number, deltaY: number): void {
    this.state = {
      ...this.state,
      objects: this.state.objects.map(obj => {
        if (ids.includes(obj.id)) {
          return {
            ...obj,
            startPoint: {
              x: obj.startPoint.x + deltaX,
              y: obj.startPoint.y + deltaY
            },
            currentPoint: {
              x: obj.currentPoint.x + deltaX,
              y: obj.currentPoint.y + deltaY
            }
          };
        }
        return obj;
      })
    };
    this.notifyObservers();
  }

  setSelectedIds(selectedIds: number[]): void {
    this.state = { ...this.state, selectedIds };
    this.notifyObservers();
  }
}

// Singleton instance
export const canvasModel = new CanvasModel(); 