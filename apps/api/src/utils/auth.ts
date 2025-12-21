import {
  admin as adminPlugin,
  magicLink,
  openAPI
} from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "~/utils/database/client";

const PREFIX = "/auth";

const auth = betterAuth({
  basePath: PREFIX,
  database: prismaAdapter(db, {
    provider: "postgresql" // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true
  },
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID as string,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //   },
  // },
  advanced: {
    disableOriginCheck: false,
    disableCSRFCheck: false,
    cookiePrefix: "better-auth",
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: ".plates.simmons.studio"
    }
  },
  trustedOrigins: ["https://plates.simmons.studio"],
  plugins: [openAPI(), adminPlugin()],
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

const OpenAPI = {
  getPaths: (prefix = PREFIX) =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path]

        for (const method of Object.keys(paths[path])) {
          const operation = (reference[key] as any)[method];

          operation.tags = ["Better Auth"];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;

export { OpenAPI, auth };
