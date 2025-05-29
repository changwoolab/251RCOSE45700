import { ObjectInfo } from "@/types/objects";
import { shapeDrawerFactory } from "@/shapes/ShapeDrawer";
import { CanvasModel } from "@/models/CanvasModel";

export class CanvasView {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to get canvas context");
    }
    this.ctx = context;
  }

  // Rendering methods
  render(model: CanvasModel): void {
    this.clear();
    const objects = model.getObjects();
    const selectedIds = model.getSelectedIds();

    // Sort objects by z-index
    const sortedObjects = [...objects].sort((a, b) => a.zIndex - b.zIndex);

    // Draw all objects
    sortedObjects.forEach(obj => {
      const drawer = shapeDrawerFactory.getDrawer(obj.type);
      this.ctx.strokeStyle = obj.color;
      this.ctx.fillStyle = obj.fillColor;
      drawer.draw(this.ctx, obj);

      // Draw selection indicator if object is selected
      if (selectedIds.includes(obj.id)) {
        this.drawSelectionIndicator(obj);
      }
    });
  }

  private clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private drawSelectionIndicator(obj: ObjectInfo): void {
    const { startPoint, currentPoint } = obj;
    this.ctx.save();
    this.ctx.strokeStyle = "#0066ff";
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);

    if (obj.type === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(startPoint.x, startPoint.y);
      this.ctx.lineTo(currentPoint.x, currentPoint.y);
      this.ctx.stroke();
    } else if (obj.type === "rectangle") {
      const minX = Math.min(startPoint.x, currentPoint.x);
      const maxX = Math.max(startPoint.x, currentPoint.x);
      const minY = Math.min(startPoint.y, currentPoint.y);
      const maxY = Math.max(startPoint.y, currentPoint.y);
      this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    } else if (obj.type === "circle") {
      const radius = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) +
        Math.pow(currentPoint.y - startPoint.y, 2)
      );
      this.ctx.beginPath();
      this.ctx.arc(startPoint.x, startPoint.y, radius, 0, Math.PI * 2);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // Utility methods
  getCanvasRect(): DOMRect {
    return this.canvas.getBoundingClientRect();
  }

  getContext(): CanvasRenderingContext2D {
    return this.ctx;
  }

  saveImageData(): ImageData {
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }

  restoreImageData(imageData: ImageData): void {
    this.ctx.putImageData(imageData, 0, 0);
  }

  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }
} 