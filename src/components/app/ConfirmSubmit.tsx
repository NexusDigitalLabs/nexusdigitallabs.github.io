'use client';

import { useRef, type ReactNode } from 'react';
import { useFormStatus } from 'react-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

type ButtonVariant = 'default' | 'outline' | 'destructive' | 'ghost' | 'secondary';
type ButtonSize = 'default' | 'sm' | 'icon' | 'icon-sm';

/**
 * A form submit button that asks first. Place it inside a <form> (server
 * action forms included): the trigger opens an accessible dialog, and only
 * "Confirm" submits — via a hidden submit button, so `name`/`value` (e.g. an
 * intent) are sent exactly as a normal submit would.
 */
export function ConfirmSubmit({
  children,
  title,
  description,
  confirmLabel,
  destructive = true,
  variant = 'outline',
  size = 'default',
  name,
  value,
  ariaLabel,
}: {
  children: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  /** Red confirm button for irreversible actions. */
  destructive?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
  name?: string;
  value?: string;
  ariaLabel?: string;
}) {
  const submitRef = useRef<HTMLButtonElement>(null);
  const { pending } = useFormStatus();

  return (
    <>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant={variant} size={size} disabled={pending} aria-label={ariaLabel}>
            {children}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction variant={destructive ? 'destructive' : 'default'} onClick={() => submitRef.current?.click()}>
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <button ref={submitRef} type="submit" name={name} value={value} hidden tabIndex={-1} aria-hidden="true" />
    </>
  );
}

/** Same dialog for client-side removals that don't submit a form. */
export function ConfirmAction({
  children,
  title,
  description,
  confirmLabel,
  onConfirm,
  variant = 'ghost',
  size = 'icon',
  ariaLabel,
  disabled,
}: {
  children: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  ariaLabel?: string;
  disabled?: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={variant} size={size} aria-label={ariaLabel} disabled={disabled}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
