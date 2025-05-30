// types/objects.ts
export type Shape = "line" | "rectangle" | "circle";
export type Mode = Shape | "select";

export interface Point {
  x: number;
  y: number;
}

export interface ObjectInfo {
  id: number;
  startPoint: Point;
  currentPoint: Point;
  color: string;     // stroke color
  fillColor: string; // fill color
  zIndex: number;
  type: Shape;
}
