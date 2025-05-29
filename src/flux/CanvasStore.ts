import { EventEmitter } from "events";
import { Action, ActionType, CanvasState } from "./types";
import { dispatcher } from "./Dispatcher";
import { ObjectInfo, Mode } from "@/types/objects";

const CHANGE_EVENT = "change";

class CanvasStore extends EventEmitter {
  private state: CanvasState = {
    objects: [],
    selectedIds: [],
    mode: "select"
  };

  constructor() {
    super();
    this.registerWithDispatcher();
  }

  private registerWithDispatcher(): void {
    dispatcher.register((action: Action) => {
      switch (action.type) {
        case ActionType.CREATE_SHAPE:
          this.handleCreateShape(action.payload);
          break;
        case ActionType.MOVE_SHAPE:
          this.handleMoveShape(action.payload);
          break;
        case ActionType.DELETE_SHAPE:
          this.handleDeleteShape(action.payload);
          break;
        case ActionType.UPDATE_SHAPE:
          this.handleUpdateShape(action.payload);
          break;
        case ActionType.SELECT_SHAPES:
          this.handleSelectShapes(action.payload);
          break;
        case ActionType.CHANGE_MODE:
          this.handleChangeMode(action.payload);
          break;
        case ActionType.CLEAR_CANVAS:
          this.handleClearCanvas();
          break;
      }
      this.emitChange();
    });
  }

  private handleCreateShape(shape: ObjectInfo): void {
    this.state.objects = [...this.state.objects, shape];
  }

  private handleMoveShape(payload: { selectedIds: number[]; deltaX: number; deltaY: number }): void {
    const { selectedIds, deltaX, deltaY } = payload;
    this.state.objects = this.state.objects.map(obj => {
      if (selectedIds.includes(obj.id)) {
        return {
          ...obj,
          startPoint: {
            x: obj.startPoint.x + deltaX,
            y: obj.startPoint.y + deltaY
          },
          currentPoint: {
            x: obj.currentPoint.x + deltaX,
            y: obj.currentPoint.y + deltaY
          }
        };
      }
      return obj;
    });
  }

  private handleDeleteShape(selectedIds: number[]): void {
    this.state.objects = this.state.objects.filter(obj => !selectedIds.includes(obj.id));
    this.state.selectedIds = [];
  }

  private handleUpdateShape(updatedShape: ObjectInfo): void {
    this.state.objects = this.state.objects.map(obj =>
      obj.id === updatedShape.id ? updatedShape : obj
    );
  }

  private handleSelectShapes(selectedIds: number[]): void {
    this.state.selectedIds = selectedIds;
  }

  private handleChangeMode(mode: Mode): void {
    this.state.mode = mode;
  }

  private handleClearCanvas(): void {
    this.state.objects = [];
    this.state.selectedIds = [];
  }

  // Public methods
  getState(): CanvasState {
    return this.state;
  }

  getObjects(): ObjectInfo[] {
    return this.state.objects;
  }

  getSelectedIds(): number[] {
    return this.state.selectedIds;
  }

  getMode(): Mode {
    return this.state.mode;
  }

  // Event handling
  addChangeListener(callback: () => void): void {
    this.on(CHANGE_EVENT, callback);
  }

  removeChangeListener(callback: () => void): void {
    this.removeListener(CHANGE_EVENT, callback);
  }

  private emitChange(): void {
    this.emit(CHANGE_EVENT);
  }
}

// Singleton instance
export const canvasStore = new CanvasStore(); 