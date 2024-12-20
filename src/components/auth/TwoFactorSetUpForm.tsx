"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { CustomFieldCode } from "./CustomField";
import { Form } from "../ui/form";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { z } from "zod";
import { formSchemaTOTPCode } from "./PasswordResetForm";

export function TwoFactorSetUpForm({ encodedTOTPKey }) {
  const [recoveryCode, setRecoveryCode] = useState("");
  const form = useForm<z.infer<typeof formSchemaTOTPCode>>({
    resolver: zodResolver(formSchemaTOTPCode),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchemaTOTPCode>) {
    console.log(values);
    const twoFactor = await fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: values.code,
        key: encodedTOTPKey,
      }),
    });
    const twoFactorRes = await twoFactor.json();
    console.log(twoFactorRes);
    if (twoFactorRes.success) {
      console.log("Success", twoFactorRes);
      setRecoveryCode(twoFactorRes.recoveryCode);
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
      {recoveryCode && <p>Recovery code: {recoveryCode}</p>}
    </Form>
  );
}

export function TwoFactorVerificationForm() {
  const form = useForm<z.infer<typeof formSchemaTOTPCode>>({
    resolver: zodResolver(formSchemaTOTPCode),
    defaultValues: {
      code: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchemaTOTPCode>) {
    console.log(values);
    const twoFactor = await fetch("/api/auth/2fa", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: values.code,
      }),
    });
    const twoFactorRes = await twoFactor.json();
    if (twoFactorRes.success) {
      router.push("/");
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
            <Input
              autoComplete="one-time-code"
              id="form-totp.code"
              type="text"
              value={field.value}
              {...field}
            />
          )}
        />
        <Button type="submit">Verify</Button>
      </form>
    </Form>
  );
}

export function TwoFactorResetForm() {
  const form = useForm<z.infer<typeof formSchemaTOTPCode>>({
    resolver: zodResolver(formSchemaTOTPCode),
    defaultValues: {
      code: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchemaTOTPCode>) {
    console.log(values);
    const twoFactor = await fetch("/api/auth/2fa/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: values.code,
      }),
    });
    const twoFactorRes = await twoFactor.json();
    if (twoFactorRes.success) {
      router.push("/auth/2fa/setup");
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
            <Input
              autoComplete="one-time-code"
              id="form-totp.code"
              type="text"
              value={field.value}
              {...field}
            />
          )}
        />
        <Button type="submit">Verify</Button>
      </form>
    </Form>
  );
}
