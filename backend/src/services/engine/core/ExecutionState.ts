import { NodeOutput, Signal, JoinState } from "../types";
import { EngineHooks } from "@src/models/workflow";

/**
 * Manages all the mutable state for a single graph execution run.
 * This object centralizes state management, making the engine itself stateless
 * and easier to reason about.
 */
export class ExecutionState {
  private executionQueue: Signal[] = [];
  private resultsCache: Map<string, NodeOutput> = new Map();
  private activeJoins: Map<string, JoinState> = new Map();
  private activeAsyncTasks: Map<string, any> = new Map();
  private _asyncTaskCounter = 0;
  
  public readonly runId: string;
  public readonly hooks?: EngineHooks;

  constructor(runId: string, initialData: any, hooks?: EngineHooks) {
    this.runId = runId;
    this.hooks = hooks;
    this.resultsCache.set('context', { runId, hooks });
    if (initialData) {
      this.resultsCache.set('initialData', initialData);
    }
  }

  // --- Queue Management ---
  public enqueue(signal: Signal): void {
    this.executionQueue.push(signal);
  }

  public dequeue(): Signal | undefined {
    return this.executionQueue.shift();
  }

  public isQueueEmpty(): boolean {
    return this.executionQueue.length === 0;
  }

  // --- Task Management ---
  public hasActiveTasks(): boolean {
    return !this.isQueueEmpty() || this.activeAsyncTasks.size > 0;
  }

  public addAsyncTask(task: any): string {
    const taskId = `task_${this._asyncTaskCounter++}`;
    this.activeAsyncTasks.set(taskId, task);
    return taskId;
  }

  public removeAsyncTask(taskId: string): void {
    this.activeAsyncTasks.delete(taskId);
  }

  // --- Cache Management ---
  public getCache(nodeId: string): NodeOutput | undefined {
    return this.resultsCache.get(nodeId);
  }
  
  public setCache(nodeId: string, output: NodeOutput): void {
    this.resultsCache.set(nodeId, output);
  }

  public hasCache(nodeId: string): boolean {
    return this.resultsCache.has(nodeId);
  }

  // --- Join State Management ---
  public getJoinState(nodeId: string): JoinState | undefined {
    return this.activeJoins.get(nodeId);
  }

  public setJoinState(nodeId: string, state: JoinState): void {
    this.activeJoins.set(nodeId, state);
  }

  public clearJoinState(nodeId: string): void {
    this.activeJoins.delete(nodeId);
  }
}