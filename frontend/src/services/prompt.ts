import { createApp, h } from 'vue';
import BasePromptComponent from '@/components/molecules/BasePrompt.vue';

interface PromptOptions {
  title: string;
  message?: string;
  defaultValue?: string;
}

const prompt = (options: PromptOptions): Promise<string | null> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(BasePromptComponent, {
          visible: true,
          ...options,
          onConfirm: (value: string) => {
            resolve(value);
            cleanup();
          },
          onCancel: () => {
            resolve(null);
            cleanup();
          },
        });
      },
    });

    const cleanup = () => {
      app.unmount();
      document.body.removeChild(container);
    };

    app.mount(container);
  });
};

export default prompt;
