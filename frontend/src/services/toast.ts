import { useToast } from 'vue-toastification';

const toast = useToast();

export const BaseToast = {
  success(message: string) {
    toast.success(message);
  },
  error(message: string) {
    toast.error(message);
  },
  info(message: string) {
    toast.info(message);
  },
  warning(message: string) {
    toast.warning(message);
  },
};
