import Handlebars from "handlebars"
// import "./helpers"

const TEMPLATE_DIR = "src/templates/email"

const compiledCache = new Map<
  string,
  Handlebars.TemplateDelegate
>()

async function renderEmail(
  templateName: string,
  data: Record<string, unknown>
  ) {
  let template = compiledCache.get(templateName)

  if (!template) {
    const filePath = `${TEMPLATE_DIR}/${templateName}.html`
    const raw = await Bun.file(filePath).text()

    template = Handlebars.compile(raw, {
      noEscape: false, // important
      strict: true     // fail fast in prod
    })

    compiledCache.set(templateName, template)
  }

  return template(data)
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("/", "&#47;")
    .replaceAll("\\", "&#92;")
    .replaceAll("(", "&#40;")
    .replaceAll(")", "&#41;")
    .replaceAll("=", "&#61;")
    .replaceAll("@", "&#64;")
    .replaceAll("©", "&copy;")
    .replaceAll("®", "&reg;")
}

export { renderEmail, escapeHtml }