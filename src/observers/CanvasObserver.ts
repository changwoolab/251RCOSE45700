import { ObjectInfo, Mode } from "@/types/objects";

// Observer interface
export interface CanvasObserver {
  onObjectsChanged: (objects: ObjectInfo[]) => void;
}

// Subject class
export class CanvasSubject {
  private observers: CanvasObserver[] = [];
  private objects: ObjectInfo[] = [];
  private selectedIds: number[] = [];
  private mode: Mode = "select";

  // Observer management
  attach(observer: CanvasObserver): void {
    this.observers.push(observer);
  }

  detach(observer: CanvasObserver): void {
    this.observers = this.observers.filter(obs => obs !== observer);
  }

  // Public methods for state changes
  setObjects(objects: ObjectInfo[]): void {
    this.objects = objects;
    this.notifyObservers();
  }

  setSelectedIds(selectedIds: number[]): void {
    this.selectedIds = selectedIds;
    this.notifyObservers();
  }

  setMode(mode: Mode): void {
    this.mode = mode;
    this.notifyObservers();
  }

  // Getters
  getObjects(): ObjectInfo[] {
    return this.objects;
  }

  getSelectedIds(): number[] {
    return this.selectedIds;
  }

  getMode(): Mode {
    return this.mode;
  }

  private notifyObservers(): void {
    this.observers.forEach(observer => {
      observer.onObjectsChanged(this.objects);
    });
  }
}

// Singleton instance
export const canvasSubject = new CanvasSubject(); 