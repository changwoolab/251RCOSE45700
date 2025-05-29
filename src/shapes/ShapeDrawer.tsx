import { ObjectInfo, Shape } from "@/types/objects";

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

// Abstract Factory Interface
export interface ShapeDrawerFactory {
  getDrawer(type: Shape): ShapeDrawer;
  registerDrawer(type: Shape, drawer: ShapeDrawer): void;
}

// Concrete Factory Implementation
export class ConcreteShapeDrawerFactory implements ShapeDrawerFactory {
  private static instance: ConcreteShapeDrawerFactory;
  private drawers: Map<Shape, ShapeDrawer>;

  private constructor() {
    this.drawers = new Map();
    // Register default drawers
    this.registerDrawer("line", new LineDrawer());
    this.registerDrawer("rectangle", new RectangleDrawer());
    this.registerDrawer("circle", new CircleDrawer());
  }

  public static getInstance(): ConcreteShapeDrawerFactory {
    if (!ConcreteShapeDrawerFactory.instance) {
      ConcreteShapeDrawerFactory.instance = new ConcreteShapeDrawerFactory();
    }
    return ConcreteShapeDrawerFactory.instance;
  }

  public getDrawer(type: Shape): ShapeDrawer {
    const drawer = this.drawers.get(type);
    if (!drawer) {
      throw new Error(`No drawer registered for shape type: ${type}`);
    }
    return drawer;
  }

  public registerDrawer(type: Shape, drawer: ShapeDrawer): void {
    this.drawers.set(type, drawer);
  }
}

// Export a singleton instance for convenience
export const shapeDrawerFactory = ConcreteShapeDrawerFactory.getInstance(); 