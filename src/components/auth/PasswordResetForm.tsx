"use client";
import { z } from "zod";
import { formSchemaPassword } from "./UpdateForm";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Form } from "../ui/form";
import { CustomFieldPassword, CustomFieldCode } from "./CustomField";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export function PasswordResetForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchemaPassword>>({
    resolver: zodResolver(formSchemaPassword),
    defaultValues: {
      password: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaPassword>) {
    console.log(values);
    const password = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password: values.password,
        newPassword: values.newPassword,
      }),
    });
    const passwordResponse = await password.json();
    if (passwordResponse.redirect) router.push(passwordResponse.redirect);
    {
      if (passwordResponse.success) {
        console.log("Success", passwordResponse);
        router.push("/auth/settings");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomFieldPassword
          control={form.control}
          name="password"
          formLabel={"Password"}
          render={({ field }) => (
            <Input type="password" value={field.value} {...field} />
          )}
        />
        <CustomFieldPassword
          control={form.control}
          name="newPassword"
          formLabel={"New password"}
          render={({ field }) => (
            <Input type="password" value={field.value} {...field} />
          )}
        />
        <Button type="submit">Reset password</Button>
      </form>
    </Form>
  );
}

export const formSchemaCode = z
  .object({
    code: z
      .string()
      .min(6, { message: "Code must be 6 characters or more" })
      .max(6, { message: "Code must be 6 characters or less" }),
  })
  .required();

export function PasswordResetTOTPForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchemaCode>>({
    resolver: zodResolver(formSchemaCode),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaCode>) {
    console.log(values);
    const password = await fetch("/api/auth/reset-password/2fa/totp-reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: values.code,
      }),
    });
    const twoFactorRes = await password.json();
    if (twoFactorRes.redirect) router.push(twoFactorRes.redirect);
    {
      if (twoFactorRes.success) {
        console.log("Success", twoFactorRes);
        router.push("/auth/reset-password");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomFieldCode
          control={form.control}
          name="code"
          formLabel={"Code"}
          render={({ field }) => (
            <Input type="text" value={field.value} {...field} />
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}

export function PasswordResetRecoveryCodeForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchemaCode>>({
    resolver: zodResolver(formSchemaCode),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaCode>) {
    console.log(values);
    const password = await fetch(
      "/api/auth/reset-password/2fa/2fa-with-recovery-code",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: values.code,
        }),
      },
    );
    const twoFactorRes = await password.json();
    if (twoFactorRes.redirect) router.push(twoFactorRes.redirect);
    {
      if (twoFactorRes.success) {
        console.log("Success", twoFactorRes);
        router.push("/auth/reset-password");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomFieldCode
          control={form.control}
          name="code"
          formLabel={"Recovery Code"}
          render={({ field }) => (
            <Input type="text" value={field.value} {...field} />
          )}
        />
        <Button type="submit">Verify</Button>
      </form>
    </Form>
  );
}

export function PasswordResetEmailVerificationForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchemaCode>>({
    resolver: zodResolver(formSchemaCode),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaCode>) {
    console.log(values);
    const password = await fetch("/api/auth/reset-password/verify-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: values.code,
      }),
    });
    const twoFactorRes = await password.json();
    if (twoFactorRes.redirect) router.push(twoFactorRes.redirect);
    {
      if (twoFactorRes.success) {
        console.log("Success", twoFactorRes);
        router.push("/auth/reset-password");
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomFieldCode
          control={form.control}
          name="code"
          formLabel={"Email Code"}
          render={({ field }) => (
            <Input type="text" value={field.value} {...field} />
          )}
        />
        <Button type="submit">Verify</Button>
      </form>
    </Form>
  );
}
