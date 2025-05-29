import { CanvasModel } from "@/models/CanvasModel";

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
} 