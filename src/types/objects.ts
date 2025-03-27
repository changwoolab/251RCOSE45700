export type Object = "line" | "rectangle" | "circle";
export type Mode = Object | "select";
export type Point = { x: number; y: number };
export type InfoObject = {
  id: number;
  startPoint: Point;
  currentPoint: Point;
  fillColor: string;
};

