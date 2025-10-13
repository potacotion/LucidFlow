/**
 * A tiny event emitter class.
 */
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(eventName, listener) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
    return () => this.off(eventName, listener); // Return an unsubscribe function
  }

  off(eventName, listener) {
    if (!this.events[eventName]) {
      return;
    }
    this.events[eventName] = this.events[eventName].filter(l => l !== listener);
  }

  emit(eventName, ...args) {
    if (!this.events[eventName]) {
      return;
    }
    this.events[eventName].forEach(listener => listener(...args));
  }
}


/**
 * LucidFlowClient handles the communication with the LucidFlow backend for a specific workflow.
 * It manages the HTTP requests to trigger the workflow and the WebSocket connection for real-time events.
 */
export class LucidFlowClient extends EventEmitter {
  /**
   * @param {object} config
   * @param {string} config.workflowId - The ID of the workflow to interact with.
   * @param {string} [config.baseUrl] - The base URL of the LucidFlow server. Defaults to the current window location.
   * @param {string} [config.triggerEndpoint] - The API endpoint for triggering workflows.
   */
  constructor(config) {
    super();

    if (!config.workflowId) {
      throw new Error('`workflowId` is required in the LucidFlowClient configuration.');
    }

    this.workflowId = config.workflowId;
    this.baseUrl = config.baseUrl || `${window.location.protocol}//${window.location.host}`;
    this.triggerEndpoint = config.triggerEndpoint || '/api/workflows/:workflowId/trigger';
    
    this.runId = null;
    this.ws = null;
    this.status = 'idle'; // idle, connecting, running, closed
  }

  /**
   * Triggers the workflow execution and establishes a WebSocket connection.
   * @param {object} [params]
   * @param {string} [params.triggerTag] - The unique tag of the trigger node to start from.
   * @param {any} [params.initialData] - The initial data to pass to the trigger node.
   * @returns {Promise<void>} A promise that resolves when the trigger request is successfully sent.
   */
  async trigger(params = {}) {
    if (this.status !== 'idle' && this.status !== 'closed') {
      return Promise.reject(new Error(`Cannot trigger workflow in '${this.status}' state.`));
    }

    this.status = 'connecting';
    this.emit('status:change', this.status);

    const endpoint = this.triggerEndpoint.replace(':workflowId', this.workflowId);
    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          triggerTag: params.triggerTag,
          initialData: params.initialData,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      if (!data.runId) {
        throw new Error('`runId` was not returned from the trigger API.');
      }

      this.runId = data.runId;
      this._connect(); // Connect to WebSocket after getting runId

    } catch (error) {
      this.status = 'idle';
      this.emit('status:change', this.status);
      this.emit('error', error);
      throw error; // Re-throw the error for the caller to handle
    }
  }
  
  /**
   * Disconnects the WebSocket connection.
   */
  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
    this._cleanup();
  }

  /**
   * Establishes the WebSocket connection and sets up event listeners.
   * @private
   */
  _connect() {
    if (!this.runId) {
      throw new Error('Cannot connect without a `runId`.');
    }

    const protocol = this.baseUrl.startsWith('https') ? 'wss:' : 'ws:';
    const host = this.baseUrl.split('//')[1];
    const wsUrl = `${protocol}//${host}/ws/workflow/${this.runId}`;

    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.status = 'running';
      this.emit('status:change', this.status);
      this.emit('connected');
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.event) {
          this.emit(message.event, message.payload);
        }
      } catch (error) {
        this.emit('error', new Error('Failed to parse WebSocket message.'), error);
      }
    };

    this.ws.onerror = (event) => {
      this.emit('error', new Error('WebSocket connection error.'), event);
      this._cleanup();
    };

    this.ws.onclose = () => {
      this.emit('disconnected');
      this._cleanup();
    };
  }
  
  /**
   * Resets the client's state.
   * @private
   */
  _cleanup() {
    this.ws = null;
    this.runId = null;
    this.status = 'closed';
    this.emit('status:change', this.status);
  }
}