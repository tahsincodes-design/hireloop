"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import { titleCase } from "@/lib/format"
import { JOB_TYPES } from "@/types/job"
import type { Job, JobInput } from "@/types/job"

const TYPE_ITEMS = JOB_TYPES.map((type) => ({
  value: type,
  label: titleCase(type),
}))

const CURRENCY_ITEMS = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
]

const fieldClass =
  "border-white/10 bg-black/20 text-white placeholder:text-white/25 focus-visible:border-indigo-400/40 focus-visible:ring-indigo-400/15 dark:bg-black/20"

export function JobForm({
  job,
  onSuccess,
}: {
  job?: Job
  onSuccess?: () => void
}) {
  const router = useRouter()
  const [type, setType] = useState(job?.type ?? "full-time")
  const [currency, setCurrency] = useState(job?.salaryCurrency ?? "USD")
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const editing = Boolean(job)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setFormError(null)

    const formData = new FormData(event.currentTarget)
    const title = String(formData.get("title") ?? "").trim()
    const location = String(formData.get("location") ?? "").trim()
    const category = String(formData.get("category") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()
    const requirements = String(formData.get("requirements") ?? "")
      .split("\n")
      .map((requirement) => requirement.trim())
      .filter(Boolean)
    const salaryMinRaw = String(formData.get("salaryMin") ?? "").trim()
    const salaryMaxRaw = String(formData.get("salaryMax") ?? "").trim()
    const deadline = String(formData.get("deadline") ?? "").trim()

    if (title.length < 3) {
      setFormError("Job title must be at least 3 characters.")
      return
    }
    if (!location) {
      setFormError("Location is required.")
      return
    }
    if (description.length < 20) {
      setFormError("Please add a job description of at least 20 characters.")
      return
    }

    const salaryMin = salaryMinRaw ? Number(salaryMinRaw) : undefined
    const salaryMax = salaryMaxRaw ? Number(salaryMaxRaw) : undefined

    if (
      (salaryMin !== undefined &&
        (!Number.isFinite(salaryMin) || salaryMin < 0)) ||
      (salaryMax !== undefined &&
        (!Number.isFinite(salaryMax) || salaryMax < 0))
    ) {
      setFormError("Salary values must be positive numbers.")
      return
    }
    if (
      salaryMin !== undefined &&
      salaryMax !== undefined &&
      salaryMin > salaryMax
    ) {
      setFormError("Minimum salary cannot be greater than maximum salary.")
      return
    }

    const payload: JobInput = {
      title,
      location,
      type,
      category: category || undefined,
      salaryMin,
      salaryMax,
      salaryCurrency: currency,
      description,
      requirements,
      deadline: deadline || undefined,
    }

    setPending(true)

    try {
      if (editing && job) {
        await api.patch(endpoints.job(job.id), payload)
        notifySuccess("Job updated", `${title} has been updated.`)
      } else {
        await api.post(endpoints.jobs, payload)
        notifySuccess(
          "Job posted",
          `${title} has been submitted to the Express API.`
        )
      }

      router.refresh()
      onSuccess?.()
      if (!editing) router.push("/dashboard/recruiter/jobs")
    } catch (error) {
      notifyApiError(error, "Could not save the job.")
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save the job. Please try again."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={pending}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="job-title" className="text-xs text-white/60">
            Job title <span className="text-rose-300">*</span>
          </Label>
          <Input
            id="job-title"
            name="title"
            defaultValue={job?.title}
            placeholder="Senior Frontend Engineer"
            required
            minLength={3}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="job-location" className="text-xs text-white/60">
            Location <span className="text-rose-300">*</span>
          </Label>
          <Input
            id="job-location"
            name="location"
            defaultValue={job?.location}
            placeholder="Remote · Dhaka, BD"
            required
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="job-category" className="text-xs text-white/60">
            Category
          </Label>
          <Input
            id="job-category"
            name="category"
            defaultValue={job?.category ?? ""}
            placeholder="Engineering"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Employment type</Label>
          <Select
            items={TYPE_ITEMS}
            value={type}
            onValueChange={(value) => {
              if (typeof value === "string") setType(value)
            }}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
              {TYPE_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="job-deadline" className="text-xs text-white/60">
            Application deadline
          </Label>
          <Input
            id="job-deadline"
            name="deadline"
            type="date"
            defaultValue={job?.deadline?.slice(0, 10) ?? ""}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="salary-min" className="text-xs text-white/60">
            Salary minimum
          </Label>
          <Input
            id="salary-min"
            name="salaryMin"
            type="number"
            min={0}
            step={500}
            defaultValue={job?.salaryMin ?? ""}
            placeholder="60000"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="salary-max" className="text-xs text-white/60">
            Salary maximum
          </Label>
          <Input
            id="salary-max"
            name="salaryMax"
            type="number"
            min={0}
            step={500}
            defaultValue={job?.salaryMax ?? ""}
            placeholder="90000"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-white/60">Currency</Label>
          <Select
            items={CURRENCY_ITEMS}
            value={currency}
            onValueChange={(value) => {
              if (typeof value === "string") setCurrency(value)
            }}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border border-white/10 bg-[#0d0d16] text-white">
              {CURRENCY_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="job-description" className="text-xs text-white/60">
          Job description <span className="text-rose-300">*</span>
        </Label>
        <Textarea
          id="job-description"
          name="description"
          defaultValue={job?.description}
          placeholder="Describe the role, responsibilities, and what success looks like…"
          required
          minLength={20}
          className={`min-h-32 ${fieldClass}`}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="job-requirements" className="text-xs text-white/60">
          Requirements
        </Label>
        <Textarea
          id="job-requirements"
          name="requirements"
          defaultValue={job?.requirements.join("\n")}
          placeholder={"5+ years of React experience\nStrong TypeScript skills"}
          className={`min-h-24 ${fieldClass}`}
        />
        <p className="text-[11px] text-white/30">
          One requirement per line. These become skill chips on the job card.
        </p>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-200"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex items-center justify-end gap-2 border-t border-white/6 pt-4">
        <Button
          type="submit"
          disabled={pending}
          className="bg-indigo-500 text-white hover:bg-indigo-400"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="size-4" aria-hidden="true" />
          )}
          {pending
            ? editing
              ? "Saving changes…"
              : "Posting job…"
            : editing
              ? "Save changes"
              : "Post job"}
        </Button>
      </div>
    </form>
  )
}
