import Handlebars from "handlebars"

Handlebars.registerHelper("eq", (a, b) => a === b)
Handlebars.registerHelper("uppercase", (v) => String(v).toUpperCase())
Handlebars.registerHelper("year", () => new Date().getFullYear())

const partialsDir = "src/templates/email/partials"

const glob = new Bun.Glob("*.html");

for await (const filePath of glob.scan(partialsDir)) {
  const fileName = filePath.split("/").pop()!;
  const name = fileName.replace(".html", "");
  const content = await Bun.file(filePath).text();

  Handlebars.registerPartial(name, content);
}
