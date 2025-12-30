import { readFile } from 'node:fs/promises';
import path from 'node:path';

const TEMPLATE_DIR = path.join(process.cwd(), 'src/emails/templates');

async function renderEmail(
  templateName: string,
  data: Record<string, string>
) {
  const filePath = path.join(TEMPLATE_DIR, `${templateName}.html`);

  let html = await readFile(filePath, 'utf8');

  for (const [key, value] of Object.entries(data)) {
    html = html.replaceAll(`{{${key}}}`, value);
  }

  return html;
}

export { renderEmail }