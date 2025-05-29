import { CanvasObserver } from "./CanvasObserver";
import { ObjectInfo, Mode } from "@/types/objects";
import { shapeDrawerFactory } from "@/shapes/ShapeDrawer";

export class CanvasRenderer implements CanvasObserver {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.updateCanvasSize();
    window.addEventListener("resize", () => this.updateCanvasSize());
  }

  private updateCanvasSize(): void {
    if (this.canvas && this.canvas.parentElement) {
      this.canvas.width = this.canvas.parentElement.clientWidth;
      this.canvas.height = this.canvas.parentElement.clientHeight;
    }
  }

  onObjectsChanged(objects: ObjectInfo[]): void {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Sort objects by z-index and draw
    const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);
    sortedObjects.forEach((obj) => {
      this.ctx!.strokeStyle = obj.color;
      const drawer = shapeDrawerFactory.getDrawer(obj.type);
      drawer.draw(this.ctx!, obj);
    });
  }

  onSelectionChanged(selectedIds: number[]): void {
    // Selection visualization could be implemented here
    // For example, drawing selection handles around selected objects
  }

  onModeChanged(mode: Mode): void {
    // Mode change visualization could be implemented here
    // For example, changing cursor style based on mode
  }
} 