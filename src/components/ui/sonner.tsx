import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as sonnerToast } from "sonner"
import { X } from "lucide-react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      position="top-right"
      offset="80px"
      expand={false}
      richColors
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      closeButton
      duration={5000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:border-0 group-[.toast]:hover:bg-muted/30",
        },
      }}
      {...props}
    />
  )
}


const toast = {
  success: (message: string) => {
    sonnerToast.success(message, {
      dismissible: true,
      duration: 5000,
      closeButton: true
    });
  },
  error: (message: string) => {
    sonnerToast.error(message, {
      dismissible: true,
      duration: 5000,
      closeButton: true
    });
  },
  info: (message: string) => {
    sonnerToast.info(message, {
      dismissible: true,
      duration: 5000,
      closeButton: true
    });
  },
  warning: (message: string) => {
    sonnerToast.warning(message, {
      dismissible: true,
      duration: 5000,
      closeButton: true
    });
  }
};

export { Toaster, toast }
