'use client';

import { useActionState } from 'react';
import { Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfirmSubmit } from '@/components/app/ConfirmSubmit';
import { FormMessage, TextField } from '@/components/app/form';
import { initialFormState, type FormState } from '@/lib/freelanceos/forms';

export default function DeleteAccountCard({ action }: { action: (prev: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <Card className="border-destructive/40">
      <CardHeader>
        <CardTitle>Delete account</CardTitle>
        <CardDescription>
          Permanently deletes your NexusDigitalLabs account and your FreelanceOS workspace — clients, projects,
          invoices, payments and expenses — plus saved tool drafts and game scores. This can&apos;t be undone, so
          download any invoice PDFs you need first.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4 sm:max-w-sm">
          <TextField name="confirm" label="Type DELETE to confirm" state={state} defaultValue="" />
          <div className="flex flex-wrap items-center gap-3">
            <ConfirmSubmit
              variant="destructive"
              title="Delete your account permanently?"
              description="Your account, FreelanceOS workspace and all of its clients, projects, invoices, payments and expenses will be deleted immediately. This can't be undone."
              confirmLabel="Yes, delete everything"
            >
              <Trash2 aria-hidden="true" />
              Delete my account
            </ConfirmSubmit>
            <FormMessage state={state} />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
