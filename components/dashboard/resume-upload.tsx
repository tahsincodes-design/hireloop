"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  Upload,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import type { Profile } from "@/types/user"

const MAX_BYTES = 5 * 1024 * 1024
const ACCEPTED = [".pdf", ".doc", ".docx"]

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function ResumeUpload({ profile }: { profile: Profile | null }) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [pending, setPending] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState(false)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    setError(null)
    const selected = event.target.files?.[0] ?? null

    if (!selected) {
      setFile(null)
      return
    }

    const extension = selected.name
      .slice(selected.name.lastIndexOf("."))
      .toLowerCase()

    if (!ACCEPTED.includes(extension)) {
      setError("Upload a PDF, DOC, or DOCX file.")
      setFile(null)
      return
    }

    if (selected.size > MAX_BYTES) {
      setError("The file must be 5 MB or smaller.")
      setFile(null)
      return
    }

    setFile(selected)
  }

  async function upload() {
    if (!file || pending) return
    setPending(true)
    setError(null)

    const body = new FormData()
    body.append("resume", file)

    try {
      await api.post(endpoints.resume, body)
      notifySuccess("Resume uploaded", "Recruiters can now view this file.")
      setFile(null)
      if (inputRef.current) inputRef.current.value = ""
      router.refresh()
    } catch (requestError) {
      notifyApiError(requestError, "Could not upload your resume.")
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not upload your resume."
      )
    } finally {
      setPending(false)
    }
  }

  async function remove() {
    if (removing) return
    setRemoving(true)

    try {
      await api.delete(endpoints.resume)
      notifySuccess("Resume removed")
      setConfirmRemove(false)
      router.refresh()
    } catch (requestError) {
      notifyApiError(requestError, "Could not remove your resume.")
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-400/10 text-indigo-300">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {profile?.resumeName ?? "No resume on file"}
            </p>
            <p className="text-[11px] text-white/35">
              {profile?.resumeUrl
                ? "This file is attached to your job applications."
                : "Upload a CV so recruiters can review your experience."}
            </p>
          </div>
        </div>
        {profile?.resumeUrl ? (
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
              render={
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="size-3.5" aria-hidden="true" />
                  Open
                </a>
              }
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmRemove(true)}
              disabled={removing}
              className="text-rose-300/70 hover:bg-rose-400/10 hover:text-rose-300"
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              Remove
            </Button>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-dashed border-white/12 bg-white/[0.015] p-5">
        <label
          htmlFor="resume-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg px-4 py-6 text-center transition-colors hover:bg-white/[0.02]"
        >
          <span className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/45">
            <Upload className="size-4" aria-hidden="true" />
          </span>
          <span className="text-sm font-medium text-white">
            Choose a resume file
          </span>
          <span className="text-[11px] text-white/35">
            PDF, DOC, or DOCX · up to 5 MB
          </span>
          <input
            ref={inputRef}
            id="resume-file"
            type="file"
            accept={ACCEPTED.join(",")}
            onChange={handleFileChange}
            disabled={pending}
            className="sr-only"
          />
        </label>

        {file ? (
          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-white/8 bg-black/20 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="min-w-0 truncate text-xs text-white/60">
              {file.name}{" "}
              <span className="text-white/30">· {formatBytes(file.size)}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null)
                  if (inputRef.current) inputRef.current.value = ""
                }}
                disabled={pending}
                className="h-7 text-[11px] text-white/45 hover:bg-white/[0.06] hover:text-white"
              >
                Clear
              </Button>
              <Button
                size="sm"
                onClick={upload}
                disabled={pending}
                className="h-7 bg-indigo-500 text-[11px] text-white hover:bg-indigo-400"
              >
                {pending ? (
                  <Loader2 className="size-3 animate-spin" aria-hidden="true" />
                ) : (
                  <Upload className="size-3" aria-hidden="true" />
                )}
                {pending ? "Uploading…" : "Upload resume"}
              </Button>
            </div>
          </div>
        ) : null}

        {error ? (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-200"
          >
            {error}
          </p>
        ) : null}
      </div>

      <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
        <AlertDialogContent className="border border-white/10 bg-[#0d0d16] text-white ring-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-white">
              <AlertTriangle
                className="size-4 text-amber-300"
                aria-hidden="true"
              />
              Remove your resume?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/45">
              Recruiters will no longer be able to download your CV from new
              applications.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="-mx-4 -mb-4 border-white/8 bg-white/[0.02]">
            <AlertDialogCancel
              disabled={removing}
              className="border-white/10 bg-transparent text-white hover:bg-white/[0.06]"
            >
              Keep resume
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              disabled={removing}
              className="bg-rose-500 text-white hover:bg-rose-400"
            >
              {removing ? (
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
              ) : null}
              Remove resume
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
