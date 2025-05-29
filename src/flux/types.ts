import { ObjectInfo, Mode } from "@/types/objects";

// Action Types
export enum ActionType {
  CREATE_SHAPE = "CREATE_SHAPE",
  MOVE_SHAPE = "MOVE_SHAPE",
  DELETE_SHAPE = "DELETE_SHAPE",
  UPDATE_SHAPE = "UPDATE_SHAPE",
  SELECT_SHAPES = "SELECT_SHAPES",
  CHANGE_MODE = "CHANGE_MODE",
  CLEAR_CANVAS = "CLEAR_CANVAS"
}

// Action Interfaces
export interface Action {
  type: ActionType;
  payload: any;
}

export interface CreateShapeAction extends Action {
  type: ActionType.CREATE_SHAPE;
  payload: ObjectInfo;
}

export interface MoveShapeAction extends Action {
  type: ActionType.MOVE_SHAPE;
  payload: {
    selectedIds: number[];
    deltaX: number;
    deltaY: number;
  };
}

export interface DeleteShapeAction extends Action {
  type: ActionType.DELETE_SHAPE;
  payload: number[]; // selectedIds
}

export interface UpdateShapeAction extends Action {
  type: ActionType.UPDATE_SHAPE;
  payload: ObjectInfo;
}

export interface SelectShapesAction extends Action {
  type: ActionType.SELECT_SHAPES;
  payload: number[]; // selectedIds
}

export interface ChangeModeAction extends Action {
  type: ActionType.CHANGE_MODE;
  payload: Mode;
}

export interface ClearCanvasAction extends Action {
  type: ActionType.CLEAR_CANVAS;
}

// Store State Interface
export interface CanvasState {
  objects: ObjectInfo[];
  selectedIds: number[];
  mode: Mode;
}

// Action Creators
export const ActionCreators = {
  createShape: (shape: ObjectInfo): CreateShapeAction => ({
    type: ActionType.CREATE_SHAPE,
    payload: shape
  }),

  moveShape: (selectedIds: number[], deltaX: number, deltaY: number): MoveShapeAction => ({
    type: ActionType.MOVE_SHAPE,
    payload: { selectedIds, deltaX, deltaY }
  }),

  deleteShape: (selectedIds: number[]): DeleteShapeAction => ({
    type: ActionType.DELETE_SHAPE,
    payload: selectedIds
  }),

  updateShape: (shape: ObjectInfo): UpdateShapeAction => ({
    type: ActionType.UPDATE_SHAPE,
    payload: shape
  }),

  selectShapes: (selectedIds: number[]): SelectShapesAction => ({
    type: ActionType.SELECT_SHAPES,
    payload: selectedIds
  }),

  changeMode: (mode: Mode): ChangeModeAction => ({
    type: ActionType.CHANGE_MODE,
    payload: mode
  }),

  clearCanvas: (): ClearCanvasAction => ({
    type: ActionType.CLEAR_CANVAS,
    payload: null
  })
}; 