export function checkEnvVariables(requiredVars: string[]): void {
  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    console.error("❌ Missing required environment variables:");
    console.error(missingVars.map((v) => `  - ${v}`).join("\n"));
    process.exit(1); // Exit with error code
  }

  console.log("✅ All required environment variables are present");
}
