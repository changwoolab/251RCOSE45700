import { ObjectInfo } from "@/types/objects";

// Shape Drawing Strategy Interface
export interface ShapeDrawer {
  draw(ctx: CanvasRenderingContext2D, obj: ObjectInfo): void;
}

// Line Drawing Strategy
export class LineDrawer implements ShapeDrawer {
  draw(ctx: CanvasRenderingContext2D, obj: ObjectInfo): void {
    ctx.beginPath();
    ctx.moveTo(obj.startPoint.x, obj.startPoint.y);
    ctx.lineTo(obj.currentPoint.x, obj.currentPoint.y);
    ctx.stroke();
  }
}

// Rectangle Drawing Strategy
export class RectangleDrawer implements ShapeDrawer {
  draw(ctx: CanvasRenderingContext2D, obj: ObjectInfo): void {
    const width = obj.currentPoint.x - obj.startPoint.x;
    const height = obj.currentPoint.y - obj.startPoint.y;
    ctx.beginPath();
    ctx.rect(obj.startPoint.x, obj.startPoint.y, width, height);
    ctx.fillStyle = obj.fillColor;
    ctx.fill();
    ctx.stroke();
  }
}

// Circle Drawing Strategy
export class CircleDrawer implements ShapeDrawer {
  draw(ctx: CanvasRenderingContext2D, obj: ObjectInfo): void {
    const radius = Math.sqrt(
      Math.pow(obj.currentPoint.x - obj.startPoint.x, 2) +
      Math.pow(obj.currentPoint.y - obj.startPoint.y, 2)
    );
    ctx.beginPath();
    ctx.arc(obj.startPoint.x, obj.startPoint.y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = obj.fillColor;
    ctx.fill();
    ctx.stroke();
  }
}

// Shape Drawer Factory
export class ShapeDrawerFactory {
  private static drawers: Record<string, ShapeDrawer> = {
    line: new LineDrawer(),
    rectangle: new RectangleDrawer(),
    circle: new CircleDrawer()
  };

  static getDrawer(type: string): ShapeDrawer {
    const drawer = this.drawers[type];
    if (!drawer) {
      throw new Error(`No drawer registered for shape type: ${type}`);
    }
    return drawer;
  }
} 