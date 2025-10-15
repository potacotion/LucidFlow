import { NodeInstance } from "@src/models/workflow";
import { Signal } from "../types";
import { ExecutionState } from "./ExecutionState";
import { DataResolver } from "./DataResolver";
import { GraphWalker } from "../GraphWalker";

export interface IArchetypeHandler {
  handle(
    node: NodeInstance,
    signal: Signal,
    state: ExecutionState,
    graphWalker: GraphWalker,
    dataResolver: DataResolver,
  ): Promise<void>;
}