"use client";

import Head from "next/head";
import { onThirdPartyLogin } from "@/lib/superTokenUtils";
import Link from "next/link";
import { AUTH_MODE } from "@/lib/config";
import { AuthLayout } from "@/components/authLayout";
import { RegisterForm } from "./forms/RegisterForm";
import TextDivider from "@/components/textDivider";
import { AppleButton, GoogleButton } from "@/components/socialButtons";
import { LoginComponent } from "@/components/auth/Login";

const ThirdPartyEmailPasswordRegister = () => {
  return (
    <>
      <Head>
        <title>Sign In - Supertokens</title>
      </Head>
      <AuthLayout>
        <div className="flex flex-col">
          <p className="mt-2 text-sm text-gray-700">
            <Link
              href="/"
              className="font-medium text-blue-600 hover:underline"
            >
              Go back to home{" "}
            </Link>{" "}
          </p>
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-900">
              Get started for free
            </h2>
            <p className="mt-2 text-sm text-gray-700">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Sign in
              </Link>{" "}
              to your account.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div>
            <div>
              <p className="text-sm font-medium text-gray-700">Register with</p>
              <div className="flex flex-col mt-2 space-y-6">
                <GoogleButton
                  onClick={() =>
                    onThirdPartyLogin({
                      provider: "google",
                      platform: "WEB",
                    })
                  }
                />
                <AppleButton
                  onClick={() =>
                    onThirdPartyLogin({
                      provider: "apple",
                      platform: "WEB",
                    })
                  }
                />
              </div>
            </div>

            <div className="mt-6">
              <TextDivider text="Or register with" />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <RegisterForm />
        </div>
      </AuthLayout>
    </>
  );
};

const EmailPasswordRegister = () => (
  <>
    <Head>
      <title>Sign In - Supertokens</title>
    </Head>
    <AuthLayout>
      <div className="flex flex-col">
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900">
            Get started for free
          </h2>
          <p className="mt-2 text-sm text-gray-700">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign in
            </Link>{" "}
            to your account.
          </p>
        </div>
      </div>
      <div className="mt-6">
        <RegisterForm />
      </div>
    </AuthLayout>
  </>
);

export const RegisterComponent = () => {
  if (AUTH_MODE === "emailpassword") {
    return <EmailPasswordRegister />;
  }

  // These do not need a separate register flow
  if (
    AUTH_MODE === "thirdparty" ||
    AUTH_MODE === "passwordless" ||
    AUTH_MODE === "thirdpartypasswordless"
  ) {
    return <LoginComponent />;
  }

  return <ThirdPartyEmailPasswordRegister />;
};
