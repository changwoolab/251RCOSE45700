import { ObjectInfo, Mode } from "@/types/objects";

// Observer interface
export interface CanvasObserver {
  onObjectsChanged(objects: ObjectInfo[]): void;
  onSelectionChanged(selectedIds: number[]): void;
  onModeChanged(mode: Mode): void;
}

// Subject class
export class CanvasSubject {
  private observers: CanvasObserver[] = [];
  private objects: ObjectInfo[] = [];
  private selectedIds: number[] = [];
  private currentMode: Mode = "select";

  // Observer management
  attach(observer: CanvasObserver): void {
    this.observers.push(observer);
  }

  detach(observer: CanvasObserver): void {
    const index = this.observers.indexOf(observer);
    if (index !== -1) {
      this.observers.splice(index, 1);
    }
  }

  // State management
  setObjects(objects: ObjectInfo[]): void {
    this.objects = objects;
    this.notifyObjectsChanged();
  }

  setSelectedIds(ids: number[]): void {
    this.selectedIds = ids;
    this.notifySelectionChanged();
  }

  setMode(mode: Mode): void {
    this.currentMode = mode;
    this.notifyModeChanged();
  }

  getObjects(): ObjectInfo[] {
    return this.objects;
  }

  getSelectedIds(): number[] {
    return this.selectedIds;
  }

  getMode(): Mode {
    return this.currentMode;
  }

  // Notification methods
  private notifyObjectsChanged(): void {
    this.observers.forEach(observer => observer.onObjectsChanged(this.objects));
  }

  private notifySelectionChanged(): void {
    this.observers.forEach(observer => observer.onSelectionChanged(this.selectedIds));
  }

  private notifyModeChanged(): void {
    this.observers.forEach(observer => observer.onModeChanged(this.currentMode));
  }
}

// Singleton instance
export const canvasSubject = new CanvasSubject(); 