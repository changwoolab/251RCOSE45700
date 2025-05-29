import { ObjectInfo as CanvasObjectInfo } from "@/types/objects";
export type ObjectInfo = CanvasObjectInfo;
import { CanvasModel } from "@/models/CanvasModel";

export interface MousePosition {
  x: number;
  y: number;
}

export interface CanvasViewContext {
  getCanvasRect: () => DOMRect;
  getContext: () => CanvasRenderingContext2D;
  saveImageData: () => ImageData;
  restoreImageData: (imageData: ImageData) => void;
}

export interface CanvasContext {
  model: CanvasModel;
  view: CanvasViewContext;
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