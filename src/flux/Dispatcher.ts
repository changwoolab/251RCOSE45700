import { Action } from "./types";

type Callback = (action: Action) => void;

class Dispatcher {
  private callbacks: Callback[] = [];
  private isDispatching: boolean = false;
  private pendingAction: Action | null = null;

  register(callback: Callback): string {
    const id = Math.random().toString(36).substring(2);
    this.callbacks.push(callback);
    return id;
  }

  unregister(id: string): void {
    const index = this.callbacks.findIndex(cb => cb.toString() === id);
    if (index !== -1) {
      this.callbacks.splice(index, 1);
    }
  }

  dispatch(action: Action): void {
    if (this.isDispatching) {
      throw new Error("Cannot dispatch in the middle of a dispatch");
    }

    this.isDispatching = true;
    this.pendingAction = action;

    try {
      this.callbacks.forEach(callback => {
        callback(action);
      });
    } finally {
      this.isDispatching = false;
      this.pendingAction = null;
    }
  }

  isDispatchingAction(): boolean {
    return this.isDispatching;
  }

  getPendingAction(): Action | null {
    return this.pendingAction;
  }
}

// Singleton instance
export const dispatcher = new Dispatcher(); 