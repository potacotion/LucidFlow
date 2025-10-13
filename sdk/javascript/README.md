# LucidFlow JavaScript SDK

A lightweight, framework-agnostic JavaScript SDK for interacting with the LucidFlow workflow engine. This SDK simplifies the process of triggering workflows and receiving real-time events via WebSockets.

## Features

- **Promise-based API**: Modern `async/await` support for triggering workflows.
- **Event-driven**: Easily subscribe to real-time workflow events.
- **Framework-agnostic**: Use it with any frontend framework (Vue, React, Svelte, etc.) or plain JavaScript.
- **Auto-configuration**: Sensible defaults for server URLs.

## Installation

```bash
# Using pnpm
pnpm add @lucidflow/sdk-js

# Using npm
npm install @lucidflow/sdk-js

# Using yarn
yarn add @lucidflow/sdk-js
```

## Quick Start

Here's a complete example of how to use the SDK to trigger a workflow and listen for events.

```javascript
import { LucidFlowClient } from '@lucidflow/sdk-js';

// 1. Configure and create a client instance
const client = new LucidFlowClient({
  // The ID of the workflow you want to run
  workflowId: 'your-workflow-id-goes-here', 
  
  // (Optional) The base URL of your LucidFlow server.
  // If not provided, it defaults to the current page's origin.
  // baseUrl: 'http://localhost:8090' 
});

// 2. Set up event listeners to react to workflow events
client.on('connected', () => {
  console.log('Connection established. Waiting for workflow events...');
});

client.on('node:start', (payload) => {
  console.log(`Node [${payload.nodeId}] started.`);
  // e.g., document.getElementById(payload.nodeId).classList.add('running');
});

client.on('node:end', (payload) => {
  console.log(`Node [${payload.nodeId}] finished with status: ${payload.status}.`);
  // e.g., document.getElementById(payload.nodeId).classList.remove('running');
});

client.on('workflow:data', (payload) => {
  console.log(`Received data with tag "${payload.tag}":`, payload.data);
  // Handle custom data sent from your workflow
});

client.on('workflow:end', (payload) => {
  if (payload.status === 'completed') {
    console.log('Workflow finished successfully! Results:', payload.results);
  } else {
    console.error('Workflow failed:', payload.error);
  }
  // Disconnect after the workflow is done
  client.disconnect();
});

client.on('disconnected', () => {
  console.log('Real-time connection closed.');
});

client.on('error', (error, originalEvent) => {
    console.error("An error occurred in the SDK:", error, originalEvent);
});

// 3. Trigger the workflow
async function run() {
  try {
    console.log('Attempting to trigger workflow...');
    await client.trigger({
      // The tag of the specific trigger node you want to start from
      triggerTag: 'manual-start', 
      
      // (Optional) Initial data to pass to the workflow's trigger node
      initialData: { customerId: 12345 } 
    });
    console.log('Trigger request sent successfully.');
  } catch (error) {
    console.error('Failed to trigger workflow:', error.message);
  }
}

// Run the workflow
run();
```

## API Reference

### `new LucidFlowClient(config)`

Creates a new client instance.

- `config` `<Object>`
  - `workflowId` `<string>` **(Required)** The ID of the workflow.
  - `baseUrl` `<string>` (Optional) The base URL of the LucidFlow server (e.g., `http://localhost:8090`). Defaults to `window.location.origin`.
  - `triggerEndpoint` `<string>` (Optional) The template for the trigger API endpoint. Defaults to `/api/workflows/:workflowId/trigger`.

### `client.trigger(params)`

Initiates the workflow execution. This sends an HTTP request to the backend to get a `runId` and then automatically establishes a WebSocket connection.

- `params` `<Object>` (Optional)
  - `triggerTag` `<string>` The tag of the trigger node to start the execution from.
  - `initialData` `<any>` Any JSON-serializable data to be passed to the trigger node.

Returns a `Promise` that resolves if the trigger request is sent successfully, and rejects if there's an HTTP error or configuration issue.

### `client.disconnect()`

Manually closes the WebSocket connection and cleans up internal state.

### Events

You can listen to events using `client.on(eventName, callback)`.

- **`'connected'`**: Fired when the WebSocket connection is successfully established.
- **`'disconnected'`**: Fired when the WebSocket connection is closed.
- **`'error'`**: Fired on WebSocket or message parsing errors.
  - `callback(error, originalEvent)`
- **`'status:change'`**: Fired when the client's internal status changes.
  - `callback(newStatus)` where `newStatus` is one of `'idle'`, `'connecting'`, `'running'`, `'closed'`.
- **`'node:start'`**: Fired when a node begins execution.
  - `callback(payload)` where `payload` is `{ nodeId: string, archetype: string }`.
- **`'node:end'`**: Fired when a node finishes execution.
  - `callback(payload)` where `payload` is `{ nodeId: string, status: 'completed' | 'failed' }`.
- **`'workflow:data'`**: Fired when a `websocket:send` node is executed in the workflow.
  - `callback(payload)` where `payload` is `{ tag: string, data: any }`.
- **`'workflow:end'`**: Fired when the entire workflow completes or fails.
  - `callback(payload)` where `payload` is `{ status: 'completed' | 'failed', results?: any, error?: string }`.
