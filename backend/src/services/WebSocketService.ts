import WebSocket from 'ws';
import logger from 'jet-logger';

type WebSocketMessage = {
  event: string;
  payload: any;
};

class ConnectionManager {
  // Key: runId, Value: Set of connected WebSockets
  private runSubscriptions: Map<string, Set<WebSocket>> = new Map();

  public add(runId: string, ws: WebSocket): void {
    if (!this.runSubscriptions.has(runId)) {
      this.runSubscriptions.set(runId, new Set());
    }
    this.runSubscriptions.get(runId)?.add(ws);
    logger.info(`WebSocket connection added for runId: ${runId}. Total connections for this run: ${this.runSubscriptions.get(runId)?.size}`);
  }

  public remove(runId: string, ws: WebSocket): void {
    const connections = this.runSubscriptions.get(runId);
    if (connections) {
      connections.delete(ws);
      logger.info(`WebSocket connection removed for runId: ${runId}. Remaining connections: ${connections.size}`);
      if (connections.size === 0) {
        this.runSubscriptions.delete(runId);
        logger.info(`No more connections for runId: ${runId}. Subscription group removed.`);
      }
    }
  }

  public broadcast(runId: string, message: WebSocketMessage): void {
    const connections = this.runSubscriptions.get(runId);
    if (connections) {
      const messageString = JSON.stringify(message);
      logger.info(`Broadcasting to ${connections.size} clients for runId ${runId}: ${messageString}`);
      connections.forEach(ws => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(messageString);
        }
      });
    }
  }
}

export const connectionManager = new ConnectionManager();