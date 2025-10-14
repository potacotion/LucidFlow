import { NodeDefinition, PropertyDefinition, PortDefinition, RunParams, ISubscribable, ISubscriber, ISubscription } from '@src/models/workflow';
import { ReadableStreamDefaultReader } from 'stream/web';

// --- Port Definitions ---
const ports: PortDefinition[] = [
    // Control Ports
    { name: 'in', type: 'control', direction: 'in', label: 'In' },
    { name: 'onDone', type: 'control', direction: 'out', label: 'On Done' },
    { name: 'onError', type: 'control', direction: 'out', label: 'On Error' },
    // Data Input Ports
    { name: 'baseUrl', type: 'data', direction: 'in', label: 'Base URL', dataType: 'string' },
    { name: 'apiKey', type: 'data', direction: 'in', label: 'API Key', dataType: 'string' },
    { name: 'prompt', type: 'data', direction: 'in', label: 'Prompt', dataType: 'string' },
    // Data Output Ports
    { name: 'chunk', type: 'data', direction: 'out', label: 'Chunk', dataType: 'string' },
];

// --- Property Definitions ---
const properties: PropertyDefinition[] = [
    {
        name: 'model',
        label: 'Model',
        type: 'string',
        defaultValue: 'gpt-3.5-turbo',
        description: 'The model to use for the completion.'
    }
];

// --- Core Execution Logic ---
const run = (params: RunParams): ISubscribable => {
    const { input, params: nodeParams } = params;

    // The run function for a stream-action returns a subscribable object.
    return {
        subscribe: (subscriber: ISubscriber): ISubscription => {
            const abortController = new AbortController();

            const execute = async () => {
                const { baseUrl, apiKey, prompt } = input;
                const { model } = nodeParams;

                if (!baseUrl || !apiKey || !prompt) {
                    subscriber.onError('chunk', new Error('Missing required inputs: baseUrl, apiKey, or prompt.'));
                    return;
                }

                try {
                    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [{ role: 'user', content: prompt }],
                            stream: true,
                        }),
                        signal: abortController.signal,
                    });

                    if (!response.ok) {
                        const errorBody = await response.text();
                        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
                    }

                    const reader = response.body?.getReader();
                    if (!reader) {
                        throw new Error('Failed to get readable stream reader.');
                    }
                    
                    const decoder = new TextDecoder();

                    // Process the stream
                    while (!abortController.signal.aborted) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunkStr = decoder.decode(value);
                        const lines = chunkStr.split('\n').filter(line => line.trim());

                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const dataStr = line.substring(6);
                                if (dataStr === '[DONE]') {
                                    break;
                                }
                                try {
                                    const parsed = JSON.parse(dataStr);
                                    const content = parsed.choices?.[0]?.delta?.content;
                                    if (content) {
                                        subscriber.onData('chunk', content);
                                    }
                                } catch (e) {
                                    console.warn('[LLM Node] Failed to parse stream chunk:', dataStr);
                                }
                            }
                        }
                    }

                    if (abortController.signal.aborted) {
                         console.log('[LLM Node] Stream aborted by user.');
                    } else {
                        subscriber.onDone('chunk');
                    }

                } catch (error: any) {
                     if (error.name !== 'AbortError') {
                        subscriber.onError('chunk', error);
                    }
                }
            };

            execute();

            // Return an unsubscribe method.
            return {
                unsubscribe: () => {
                    abortController.abort();
                },
            };
        },
    };
};

// --- Node Definition ---
const OpenAiLlmNode: NodeDefinition = {
    type: 'llm/openai',
    label: 'OpenAI LLM Stream',
    description: 'Streams a response from an OpenAI-compatible LLM API.',
    archetype: 'stream-action',
    version: '1.0.0',
    ports,
    properties,
    run,
};

export default OpenAiLlmNode;