export type Object = "line" | "rectangle" | "circle";
export type Mode = Object | "select";

export type Point = { x: number; y: number };
export type ObjectInfo = {
  id: number;
  startPoint: Point;
  currentPoint: Point;
  color: string;
};
