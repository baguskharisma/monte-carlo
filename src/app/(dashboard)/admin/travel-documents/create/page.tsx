'use client'

import { useRouter } from 'next/navigation'
import { useCreateTravelDocument } from '@/hooks/useTravelDocuments'
import { TravelDocumentForm } from '@/components/travel-document/TravelDocumentForm'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Info } from 'lucide-react'
import type { CreateTravelDocumentFormData } from '@/types/travel-document.types'

export default function CreateTravelDocumentPage() {
  const router = useRouter()
  const createMutation = useCreateTravelDocument()

  const onSubmit = async (data: CreateTravelDocumentFormData) => {
    await createMutation.mutateAsync(data)
    router.push('/admin/travel-documents')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Travel Document</h1>
          <p className="text-muted-foreground">Create a new draft travel document (Surat Jalan)</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Creating a draft document does <strong>NOT</strong> deduct coins. Coins will only be
          deducted when you <strong>ISSUE</strong> the document (changing status from DRAFT to
          ISSUED).
        </AlertDescription>
      </Alert>

      {/* Form */}
      <TravelDocumentForm onSubmit={onSubmit} isLoading={createMutation.isPending} />
    </div>
  )
}
