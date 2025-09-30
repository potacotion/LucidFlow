import { createApp, h } from 'vue';
import BaseConfirmComponent from '@/components/molecules/BaseConfirm.vue';

interface ConfirmOptions {
  title: string;
  message?: string;
}

const confirm = (options: ConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
      render() {
        return h(BaseConfirmComponent, {
          visible: true,
          ...options,
          onConfirm: () => {
            resolve(true);
            cleanup();
          },
          onCancel: () => {
            resolve(false);
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

export default confirm;
