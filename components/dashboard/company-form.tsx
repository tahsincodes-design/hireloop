"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Building2, Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import type { Company } from "@/types/user"

const fieldClass =
  "border-white/10 bg-black/20 text-white placeholder:text-white/25 focus-visible:border-indigo-400/40 focus-visible:ring-indigo-400/15 dark:bg-black/20"

export function CompanyForm({ company }: { company: Company | null }) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setFormError(null)
    const formData = new FormData(event.currentTarget)
    const name = String(formData.get("name") ?? "").trim()
    const website = String(formData.get("website") ?? "").trim()
    const industry = String(formData.get("industry") ?? "").trim()
    const size = String(formData.get("size") ?? "").trim()
    const location = String(formData.get("location") ?? "").trim()
    const description = String(formData.get("description") ?? "").trim()

    if (name.length < 2) {
      setFormError("Company name must be at least 2 characters.")
      return
    }

    if (website && !/^https?:\/\//i.test(website)) {
      setFormError("Website must start with http:// or https://.")
      return
    }

    setPending(true)

    try {
      await api.put(endpoints.company, {
        name,
        website: website || null,
        industry: industry || null,
        size: size || null,
        location: location || null,
        description: description || null,
      })
      notifySuccess("Company profile saved")
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not save the company profile.")
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not save the company profile."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" aria-busy={pending}>
      <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-400/10 text-violet-300">
          {company?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={company.logo}
              alt=""
              className="size-full rounded-xl object-cover"
            />
          ) : (
            <Building2 className="size-5" aria-hidden="true" />
          )}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            {company?.name ?? "Your company"}
          </p>
          <p className="text-[11px] text-white/35">
            This information appears on every job you publish.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="company-name" className="text-xs text-white/60">
            Company name <span className="text-rose-300">*</span>
          </Label>
          <Input
            id="company-name"
            name="name"
            defaultValue={company?.name ?? ""}
            placeholder="Acme Inc."
            required
            minLength={2}
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-website" className="text-xs text-white/60">
            Website
          </Label>
          <Input
            id="company-website"
            name="website"
            defaultValue={company?.website ?? ""}
            placeholder="https://acme.com"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-industry" className="text-xs text-white/60">
            Industry
          </Label>
          <Input
            id="company-industry"
            name="industry"
            defaultValue={company?.industry ?? ""}
            placeholder="Software"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-size" className="text-xs text-white/60">
            Company size
          </Label>
          <Input
            id="company-size"
            name="size"
            defaultValue={company?.size ?? ""}
            placeholder="51–200 employees"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="company-location" className="text-xs text-white/60">
            Headquarters
          </Label>
          <Input
            id="company-location"
            name="location"
            defaultValue={company?.location ?? ""}
            placeholder="Dhaka, Bangladesh"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label
            htmlFor="company-description"
            className="text-xs text-white/60"
          >
            About the company
          </Label>
          <Textarea
            id="company-description"
            name="description"
            defaultValue={company?.description ?? ""}
            placeholder="What your company does, its mission, and why candidates should join…"
            className={`min-h-32 ${fieldClass}`}
          />
        </div>
      </div>

      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-rose-400/20 bg-rose-400/[0.06] px-3 py-2 text-xs text-rose-200"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex items-center justify-end border-t border-white/6 pt-4">
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
          {pending ? "Saving company…" : "Save company"}
        </Button>
      </div>
    </form>
  )
}
