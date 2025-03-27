export type Shape = "line" | "rectangle" | "circle";
export type Mode = Shape | "select";

export type Point = { x: number; y: number };
export type ObjectInfo = {
  id: number;
  startPoint: Point;
  currentPoint: Point;
  color: string;
  type: Shape;
};
