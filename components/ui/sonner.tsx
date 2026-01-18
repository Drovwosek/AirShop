"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        style: {
          border: "none",
        },
        classNames: {
          success: "!bg-emerald-600 !text-white",
          error: "!bg-red-600 !text-white",
          info: "!bg-neutral-900 !text-white",
          warning: "!bg-amber-500 !text-white",
          default: "!bg-neutral-900 !text-white",
        },
      }}
      style={
        {
          "--border-radius": "0.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
