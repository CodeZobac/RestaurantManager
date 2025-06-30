import { toast as sonnerToast } from "sonner"

type ToastType = "success" | "error" | "info" | "warning";

const useToast = () => {
  const showToast = (
    type: ToastType,
    message: string,
    description?: string
  ) => {
    sonnerToast[type](message, {
      description: description,
    });
  };

  return {
    toast: showToast,
  };
};

export { useToast };
