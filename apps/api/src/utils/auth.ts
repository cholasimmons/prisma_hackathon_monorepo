import {
  admin as adminPlugin,
  emailOTP,
  magicLink,
  openAPI
} from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "~/utils/database/client";
import { addEmailJob } from "./queues/email";

const PREFIX = "/auth";

const auth = betterAuth({
  basePath: PREFIX,
  database: prismaAdapter(db, {
    provider: "postgresql" // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url, token }, request) => {
 			const html = `
				<h2>Password reset</h2>
				<p>
 					Reset your password by clicking
 					<a href="${url}">here</a>.
				</p>
 			`;

      void addEmailJob({
        to: user.email,
        subject: "Reset your password",
        html
      });
    }
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url, token }, request) => {
      const html = `
				<h2>Verify your email</h2>
				<p>Hello ${user.name ?? 'there'},</p>
				<p>
					Click <a href="${url}">here</a> to verify your email.
				</p>
			`;

      void addEmailJob({
        to: user.email,
        subject: "Verify your email address",
        html
      });

      // const token = await auth.emailVerification.generateToken(user.id);
      // await auth.emailVerification.sendEmail(user.email, token);
    },

    async afterEmailVerification(user, request) {
      // Your custom logic here, e.g., grant access to premium features
      console.log(`${user.email} has been successfully verified!`);
    }
  },

  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID as string,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //   },
  // },
  session: {
    updateAge: 60 * 60 * 24 * 30 // 30 days
  },
  advanced: {
    disableOriginCheck: false,
    disableCSRFCheck: false,
    cookiePrefix: "better-auth",
    useSecureCookies: true,
    crossSubDomainCookies: {
      enabled: true,
      domain: ".plates.simmons.studio"
    },
    cookies: {
      session_token: {
        name: "session_token",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30 // 30 days
      }
    },

  },
  trustedOrigins: [process.env.ORIGIN_URL!],
  plugins: [
    openAPI(),
    adminPlugin({adminRoles: ["admin"]}),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
          if (type === "sign-in") {
              // Send the OTP for sign in
          } else if (type === "email-verification") {
              // Send the OTP for email verification
          } else {
              // Send the OTP for password reset
          }
      },
    })
  ],
});

let _schema: ReturnType<typeof auth.api.generateOpenAPISchema>;
const getSchema = async () => (_schema ??= auth.api.generateOpenAPISchema());

const OpenAPI = {
  getPaths: (prefix = PREFIX) =>
    getSchema().then(({ paths }) => {
      const reference: typeof paths = Object.create(null);

      for (const path of Object.keys(paths)) {
        const key = prefix + path;
        reference[key] = paths[path]!

        for (const method of Object.keys(paths[path]!)) {
          const operation = (reference[key] as any)[method];

          operation.tags = ["Better Auth"];
        }
      }

      return reference;
    }) as Promise<any>,
  components: getSchema().then(({ components }) => components) as Promise<any>,
} as const;

export { OpenAPI, auth };
