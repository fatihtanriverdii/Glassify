'use client'

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const iconMap = {
          default: <Info className="h-4 w-4 text-blue-600" />,
          destructive: <AlertCircle className="h-4 w-4 text-red-600" />,
          success: <CheckCircle className="h-4 w-4 text-green-600" />,
          info: <Info className="h-4 w-4 text-blue-600" />,
          warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
        }
        
        const icon = iconMap[variant || "default"]
        
        return (
          <Toast key={id} {...props} variant={variant}>
            <div className="flex gap-2 items-start">
              <div className="shrink-0 mt-1">
                {icon}
              </div>
              <div className="grid gap-0.5 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
              {action && <div className="shrink-0 ml-2">{action}</div>}
            </div>
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
} 