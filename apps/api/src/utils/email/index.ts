import { renderEmail } from './render';

const TEMPLATE_DIR = 'src/templates/email';

async function _renderEmail(
  templateName: string,
  data: Record<string, string>
  ) {
  const filePath = TEMPLATE_DIR + '/' + `${templateName}.html`;

  let html = await Bun.file(filePath).text();

  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, escapeHtml(value));
  }

  return html;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}


export { renderEmail }