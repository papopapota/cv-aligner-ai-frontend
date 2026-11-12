import type { PersonalInfo } from "@/entities/cv"
import type { CvBlock } from "@/features/edit-cv"
import { Badge } from "@/shared/ui"

interface CvOriginalPanelProps {
  personalInfo?: PersonalInfo
  blocks: CvBlock[]
}

function buildContactLine(personalInfo: PersonalInfo): string {
  const location = [personalInfo.location?.city, personalInfo.location?.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(", ")
  const links = [
    personalInfo.links?.linkedin,
    personalInfo.links?.github,
    personalInfo.links?.portfolio,
  ].filter((value): value is string => Boolean(value && value.trim()))

  return [personalInfo.email, personalInfo.phone, location, ...links]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(" · ")
}

export function CvOriginalPanel({ personalInfo, blocks }: CvOriginalPanelProps) {
  const contact = personalInfo ? buildContactLine(personalInfo) : ""

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg text-ink">CV original</h2>
        <Badge variant="muted">Solo lectura</Badge>
      </div>

      <div className="flex flex-col gap-1 border border-line bg-canvas p-4">
        {personalInfo?.full_name ? (
          <p className="text-lg text-ink">{personalInfo.full_name}</p>
        ) : null}
        {personalInfo?.headline ? (
          <p className="text-sm text-muted-foreground">
            {personalInfo.headline}
          </p>
        ) : null}
        {contact.length > 0 ? (
          <p className="text-xs text-muted-foreground">{contact}</p>
        ) : null}
      </div>

      {blocks.length > 0 ? (
        blocks.map((block) => (
          <section
            key={block.id}
            aria-label={`Original: ${block.heading}`}
            className="flex flex-col gap-2 border border-line bg-card p-4"
          >
            <h3 className="text-base text-ink">{block.heading}</h3>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {block.body}
            </p>
          </section>
        ))
      ) : (
        <p className="border border-dashed border-line bg-canvas p-4 text-sm text-muted-foreground">
          No pudimos reconstruir el CV original. El editor seguirá disponible
          con el contenido optimizado.
        </p>
      )}
    </div>
  )
}
