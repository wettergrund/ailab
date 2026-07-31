import * as React from 'react';
import {
  Toast as ToastPrimitive,
  ToastClose as ToastClosePrimitive,
  ToastDescription as ToastDescriptionPrimitive,
  ToastProvider as ToastProviderPrimitive,
  ToastTitle as ToastTitlePrimitive,
  ToastViewport as ToastViewportPrimitive,
} from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

const ToastProvider = ToastProviderPrimitive;

const Toast = ToastPrimitive;

const ToastClose = ToastClosePrimitive;

const ToastTitle = ToastTitlePrimitive;

const ToastDescription = ToastDescriptionPrimitive;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastViewportPrimitive>,
  React.ComponentPropsWithoutRef<typeof ToastViewportPrimitive>
>(({ className, ...props }, ref) => (
  <ToastViewportPrimitive
    ref={ref}
    className={cn(
      'fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastViewportPrimitive.displayName;

export {
  ToastProvider,
  Toast,
  ToastClose,
  ToastTitle,
  ToastDescription,
  ToastViewport,
};
