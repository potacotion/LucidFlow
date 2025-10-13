/**
 * @typedef {Object} Listener
 * @property {(tag: string, callback: (data: any) => void) => Listener} listen - Registers a callback for a specific tag and allows chaining.
 * @property {() => void} close - Closes the WebSocket connection.
 */

/**
 * Creates and initializes the LucidFlow SDK for browser environments.
 * @param {object} config - The SDK configuration.
 * @param {string} config.apiBaseUrl - The base URL of the LucidFlow backend API (e.g., "http://localhost:8090/api").
 * @param {string} config.wsBaseUrl - The base URL of the LucidFlow WebSocket server (e.g., "ws://localhost:8090").
 * @returns {{ trigger: (triggerTag: string, initialData?: any) => Promise<Listener> }}
 */
export function createLucidFlow(config) {
  const { apiBaseUrl, wsBaseUrl } = config;

  if (!apiBaseUrl || !wsBaseUrl) {
    throw new Error('apiBaseUrl and wsBaseUrl are required in configuration.');
  }

  return {
    /**
     * Triggers a workflow and returns a listener object.
     * @param {string} triggerTag - The tag of the trigger node.
     * @param {any} [initialData] - Optional data to pass to the trigger node.
     * @returns {Promise<Listener>} A promise that resolves to a listener object.
     */
    async trigger(triggerTag, initialData = {}) {
      try {
        // 1. Register the execution to get a runId
        const registerResponse = await fetch(`${apiBaseUrl}/v1/executions`, { method: 'POST' });
        if (!registerResponse.ok) {
            const errorData = await registerResponse.json();
            throw new Error(`Failed to register execution: ${errorData.message || registerResponse.statusText}`);
        }
        const registerData = await registerResponse.json();
        const runId = registerData.runId;

        if (!runId) {
          throw new Error('Failed to retrieve runId from the server.');
        }

        const wsUrl = `${wsBaseUrl}/ws/v1/executions/${runId}/ws`;
        const ws = new WebSocket(wsUrl);
        const listeners = new Map();

        return new Promise((resolve, reject) => {
            ws.onopen = () => {
                console.log(`[LucidFlow SDK] WebSocket connection established for runId: ${runId}`);
                // 2. Start the execution after WebSocket is connected
                fetch(`${apiBaseUrl}/v1/executions/${runId}/trigger`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ triggerTag, initialData }),
                }).catch(err => {
                    console.error('[LucidFlow SDK] Error triggering execution:', err.message);
                    ws.close();
                    reject(new Error(`Error triggering execution: ${err.message}`));
                });

                resolve({
                    listen(tag, callback) {
                        if (!listeners.has(tag)) {
                            listeners.set(tag, []);
                        }
                        listeners.get(tag).push(callback);
                        return this; // Allow chaining
                    },
                    close() {
                        ws.close();
                    }
                });
            };

            ws.onmessage = (event) => {
                try {
                    const parsed = JSON.parse(event.data);
                    if (parsed.event === 'workflow:data' && parsed.payload) {
                        const { tag, data } = parsed.payload;
                        if (listeners.has(tag)) {
                            listeners.get(tag).forEach(callback => callback(data));
                        }
                    } else if (parsed.event === 'workflow:end') {
                        console.log(`[LucidFlow SDK] Workflow finished with status: ${parsed.payload.status}`);
                        ws.close();
                    }
                } catch (error) {
                    console.error('[LucidFlow SDK] Error parsing WebSocket message:', error);
                }
            };

            ws.onerror = (error) => {
                console.error('[LucidFlow SDK] WebSocket error:', error);
                reject(new Error('WebSocket connection error.'));
            };
            
            ws.onclose = () => {
                console.log(`[LucidFlow SDK] WebSocket connection closed for runId: ${runId}`);
                listeners.clear();
            };
        });

      } catch (error) {
        const errorMessage = error.message || 'An unknown error occurred.';
        console.error('[LucidFlow SDK] Failed to trigger workflow:', errorMessage);
        throw new Error(`Failed to trigger workflow: ${errorMessage}`);
      }
    },
  };
}