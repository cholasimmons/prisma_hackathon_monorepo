import {
  admin as adminPlugin,
  emailOTP,
  magicLink,
  openAPI
} from "better-auth/plugins";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import db from "~utils/database/client";
import { addEmailJob } from "./queues/email";

const PREFIX = "/auth";

const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  basePath: PREFIX,
  database: prismaAdapter(db, {
    provider: "postgresql" // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,

    sendResetPassword: async ({ user, url, token }, request) => {
      const link = `${process.env.ORIGIN_URL}/auth/reset-password?token=${token}`;
 			const html = `
        <small>Plates</small>
				<h2>Password reset</h2>
				<p>
 					Reset your password by clicking
 					<a href="${link}">here</a>.
				</p>

				<small>
					If you did not request a password reset, please ignore this email.
				</small>
 			`;

      void addEmailJob({
        to: user.email,
        subject: "Plates | Password Reset",
        html
      });
    },
    onPasswordReset: async ({ user }, request) => {
      console.log(`Password for user ${user.email} has been reset.`);
      const link = `${process.env.ORIGIN_URL}/auth/login`;
      const html = `
        <small>Plates</small>
				<h2>Password successfully reset</h2>
				<p>
   					You can now log in to Plates with your new password, sign in by clicking
   					<a href="${link}">here</a>.
				</p>

				<small>
					Be sure to <a href="https://github.com/cholasimmons/prisma_hackathon_monorepo/issues">report any bugs</a> or <a href="mailto://apps@simmons.studio">feature suggestions</a> to us.
				</small>
   			`;

        void addEmailJob({
          to: user.email,
          subject: "Plates | Password Reset",
          html
        });
    },
    minPasswordLength: 6,
    maxPasswordLength: 24,
    autoSignIn: true
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: false,
    autoSignInAfterVerification: true,

    sendVerificationEmail: async ({ user, url, token }, request) => {
      const link = url; // `${process.env.ORIGIN_URL}/auth/verify-email?token=${token}`;
      const html = `
				<small>Plates</small>
				<h2>Verify your email</h2>
				<p>Hello ${user.name ?? 'there'},</p>
				<p>
					<a href="${link}">Click here</a> to verify your email.
				</p>
			`;

      void addEmailJob({
        to: user.email,
        subject: "Plates | Email Verification",
        html
      });

      // const token = await auth.emailVerification.generateToken(user.id);
      // await auth.emailVerification.sendEmail(user.email, token);
    },

    async afterEmailVerification(user, request) {
      const html = `
				<small>Plates</small>
				<h2>Welcome!</h2>
				<p>Hello again ${user.name ?? ''},</p>
				<p>
					Thank you for taking the time to verify your email.<br>
					You can now enjoy all the features of Plates.
				</p>
				<p>
					<a href="https://plates.simmons.studio/about"><strong>Plates</strong></a> is a crowd-source database for vehicle registration numbers, nothing else to it.<br/>
					Just a small project putting together all the tools, knowledge and expertise we have.<br/>
					We hope you enjoy it!
				</p>
			`;

      void addEmailJob({
        to: user.email,
        subject: "Welcome to Plates | ZM",
        html
      });
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
