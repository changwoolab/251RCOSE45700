import { ObjectInfo } from "@/types/objects";
import { CanvasCommand } from "@/commands/CanvasCommand";

export interface MousePosition {
  x: number;
  y: number;
}

export interface CanvasContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  savedImageData: ImageData;
  idRef: { current: number };
}

export interface CanvasModeStrategy {
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>, context: CanvasContext) => {
    onMouseMove?: (e: MouseEvent) => void;
    onMouseUp?: (e: MouseEvent) => void;
  };
  onMouseMove?: (e: MouseEvent, context: CanvasContext) => void;
  onMouseUp?: (e: MouseEvent, context: CanvasContext) => void;
} 