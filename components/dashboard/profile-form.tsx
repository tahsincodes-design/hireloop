"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { api } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"
import { notifyApiError, notifySuccess } from "@/lib/client/api-feedback"
import type { Profile, ProfileEducation, ProfileExperience } from "@/types/user"

const fieldClass =
  "border-white/10 bg-black/20 text-white placeholder:text-white/25 focus-visible:border-indigo-400/40 focus-visible:ring-indigo-400/15 dark:bg-black/20"

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `local-${Math.random().toString(36).slice(2)}`
}

type ExperienceDraft = ProfileExperience & { key: string }
type EducationDraft = ProfileEducation & { key: string }

function toExperienceDrafts(profile: Profile | null): ExperienceDraft[] {
  return (profile?.experience ?? []).map((item) => ({
    ...item,
    key: item.id || newId(),
  }))
}

function toEducationDrafts(profile: Profile | null): EducationDraft[] {
  return (profile?.education ?? []).map((item) => ({
    ...item,
    key: item.id || newId(),
  }))
}

export function ProfileForm({
  profile,
  userName,
  email,
}: {
  profile: Profile | null
  userName: string
  email: string
}) {
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [experience, setExperience] = useState<ExperienceDraft[]>(() =>
    toExperienceDrafts(profile)
  )
  const [education, setEducation] = useState<EducationDraft[]>(() =>
    toEducationDrafts(profile)
  )

  function updateExperience(key: string, patch: Partial<ExperienceDraft>) {
    setExperience((items) =>
      items.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  function updateEducation(key: string, patch: Partial<EducationDraft>) {
    setEducation((items) =>
      items.map((item) => (item.key === key ? { ...item, ...patch } : item))
    )
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pending) return

    setFormError(null)
    const formData = new FormData(event.currentTarget)
    const headline = String(formData.get("headline") ?? "").trim()
    const bio = String(formData.get("bio") ?? "").trim()
    const location = String(formData.get("location") ?? "").trim()
    const phone = String(formData.get("phone") ?? "").trim()
    const website = String(formData.get("website") ?? "").trim()
    const skills = String(formData.get("skills") ?? "")
      .split(",")
      .map((skill) => skill.trim())
      .filter(Boolean)

    if (website && !/^https?:\/\//i.test(website)) {
      setFormError("Website must start with http:// or https://.")
      return
    }

    setPending(true)

    try {
      await api.put(endpoints.profile, {
        headline: headline || null,
        bio: bio || null,
        location: location || null,
        phone: phone || null,
        website: website || null,
        skills,
        experience: experience.map((item) => ({
          id: item.id,
          company: item.company,
          title: item.title,
          location: item.location,
          startDate: item.startDate,
          endDate: item.endDate,
          current: item.current,
          description: item.description,
        })),
        education: education.map((item) => ({
          id: item.id,
          school: item.school,
          degree: item.degree,
          fieldOfStudy: item.fieldOfStudy,
          startDate: item.startDate,
          endDate: item.endDate,
        })),
      })
      notifySuccess("Profile saved", "Your changes are now live.")
      router.refresh()
    } catch (error) {
      notifyApiError(error, "Could not save your profile.")
      setFormError(
        error instanceof Error ? error.message : "Could not save your profile."
      )
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={pending}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-name" className="text-xs text-white/60">
            Full name
          </Label>
          <Input
            id="profile-name"
            value={userName}
            readOnly
            disabled
            className={fieldClass}
          />
          <p className="text-[11px] text-white/30">
            Your name is managed by Better Auth. Update it from Settings.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-email" className="text-xs text-white/60">
            Email
          </Label>
          <Input
            id="profile-email"
            value={email}
            readOnly
            disabled
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-headline" className="text-xs text-white/60">
            Professional headline
          </Label>
          <Input
            id="profile-headline"
            name="headline"
            defaultValue={profile?.headline ?? ""}
            placeholder="Senior Product Designer"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-location" className="text-xs text-white/60">
            Location
          </Label>
          <Input
            id="profile-location"
            name="location"
            defaultValue={profile?.location ?? ""}
            placeholder="Dhaka, Bangladesh"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="profile-phone" className="text-xs text-white/60">
            Phone
          </Label>
          <Input
            id="profile-phone"
            name="phone"
            defaultValue={profile?.phone ?? ""}
            placeholder="+880 1XXX XXXXXX"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-website" className="text-xs text-white/60">
            Website / Portfolio
          </Label>
          <Input
            id="profile-website"
            name="website"
            defaultValue={profile?.website ?? ""}
            placeholder="https://yourportfolio.com"
            className={fieldClass}
          />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-skills" className="text-xs text-white/60">
            Skills
          </Label>
          <Input
            id="profile-skills"
            name="skills"
            defaultValue={profile?.skills.join(", ") ?? ""}
            placeholder="React, TypeScript, Product Design"
            className={fieldClass}
          />
          <p className="text-[11px] text-white/30">
            Separate each skill with a comma.
          </p>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="profile-bio" className="text-xs text-white/60">
            About you
          </Label>
          <Textarea
            id="profile-bio"
            name="bio"
            defaultValue={profile?.bio ?? ""}
            placeholder="A short summary of your experience and what you are looking for…"
            className={`min-h-28 ${fieldClass}`}
          />
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium text-white">Experience</h3>
            <p className="text-[11px] text-white/35">
              Add the roles that best demonstrate your background.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setExperience((items) => [
                ...items,
                {
                  key: newId(),
                  id: "",
                  company: "",
                  title: "",
                  location: null,
                  startDate: null,
                  endDate: null,
                  current: false,
                  description: null,
                },
              ])
            }
            className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            Add role
          </Button>
        </div>

        {experience.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-white/30">
            No experience added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {experience.map((item, index) => (
              <div
                key={item.key}
                className="space-y-3 rounded-xl border border-white/8 bg-white/[0.02] p-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-white/50">Company</Label>
                    <Input
                      value={item.company}
                      onChange={(event) =>
                        updateExperience(item.key, {
                          company: event.target.value,
                        })
                      }
                      placeholder="Acme Inc."
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-white/50">Title</Label>
                    <Input
                      value={item.title}
                      onChange={(event) =>
                        updateExperience(item.key, {
                          title: event.target.value,
                        })
                      }
                      placeholder="Product Designer"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-white/50">
                      Start date
                    </Label>
                    <Input
                      type="date"
                      value={item.startDate?.slice(0, 10) ?? ""}
                      onChange={(event) =>
                        updateExperience(item.key, {
                          startDate: event.target.value || null,
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-white/50">
                      End date
                    </Label>
                    <Input
                      type="date"
                      value={item.endDate?.slice(0, 10) ?? ""}
                      disabled={item.current}
                      onChange={(event) =>
                        updateExperience(item.key, {
                          endDate: event.target.value || null,
                        })
                      }
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-white/50">
                    Description
                  </Label>
                  <Textarea
                    value={item.description ?? ""}
                    onChange={(event) =>
                      updateExperience(item.key, {
                        description: event.target.value || null,
                      })
                    }
                    placeholder="Highlights, responsibilities, and outcomes…"
                    className={`min-h-20 ${fieldClass}`}
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-2 text-[11px] text-white/50">
                    <input
                      type="checkbox"
                      checked={item.current}
                      onChange={(event) =>
                        updateExperience(item.key, {
                          current: event.target.checked,
                          endDate: event.target.checked ? null : item.endDate,
                        })
                      }
                      className="size-3.5 accent-indigo-500"
                    />
                    I currently work here
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setExperience((items) =>
                        items.filter((entry) => entry.key !== item.key)
                      )
                    }
                    className="h-7 text-[11px] text-rose-300/70 hover:bg-rose-400/10 hover:text-rose-300"
                  >
                    Remove
                  </Button>
                </div>
                <span className="sr-only">Experience {index + 1}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium text-white">Education</h3>
            <p className="text-[11px] text-white/35">
              Degrees, certifications, and relevant training.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setEducation((items) => [
                ...items,
                {
                  key: newId(),
                  id: "",
                  school: "",
                  degree: null,
                  fieldOfStudy: null,
                  startDate: null,
                  endDate: null,
                },
              ])
            }
            className="border-white/10 bg-transparent text-white/70 hover:bg-white/[0.06] hover:text-white"
          >
            Add education
          </Button>
        </div>

        {education.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-[11px] text-white/30">
            No education added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {education.map((item) => (
              <div
                key={item.key}
                className="space-y-3 rounded-xl border border-white/8 bg-white/[0.02] p-3"
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-white/50">School</Label>
                    <Input
                      value={item.school}
                      onChange={(event) =>
                        updateEducation(item.key, {
                          school: event.target.value,
                        })
                      }
                      placeholder="University of Dhaka"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-white/50">Degree</Label>
                    <Input
                      value={item.degree ?? ""}
                      onChange={(event) =>
                        updateEducation(item.key, {
                          degree: event.target.value || null,
                        })
                      }
                      placeholder="BSc Computer Science"
                      className={fieldClass}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-white/50">
                      Field of study
                    </Label>
                    <Input
                      value={item.fieldOfStudy ?? ""}
                      onChange={(event) =>
                        updateEducation(item.key, {
                          fieldOfStudy: event.target.value || null,
                        })
                      }
                      placeholder="Computer Science"
                      className={fieldClass}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-white/50">Start</Label>
                      <Input
                        type="date"
                        value={item.startDate?.slice(0, 10) ?? ""}
                        onChange={(event) =>
                          updateEducation(item.key, {
                            startDate: event.target.value || null,
                          })
                        }
                        className={fieldClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] text-white/50">End</Label>
                      <Input
                        type="date"
                        value={item.endDate?.slice(0, 10) ?? ""}
                        onChange={(event) =>
                          updateEducation(item.key, {
                            endDate: event.target.value || null,
                          })
                        }
                        className={fieldClass}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setEducation((items) =>
                        items.filter((entry) => entry.key !== item.key)
                      )
                    }
                    className="h-7 text-[11px] text-rose-300/70 hover:bg-rose-400/10 hover:text-rose-300"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
          {pending ? "Saving profile…" : "Save profile"}
        </Button>
      </div>
    </form>
  )
}
