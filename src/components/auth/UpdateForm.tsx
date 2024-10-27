"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomFieldEmail, CustomFieldPassword } from "./CustomField";
import { useRouter } from "next/navigation";

export const formSchemaEmail = z.object({
  email: z.string().email(),
});
export const formSchemaPassword = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Musí být 8 nebože písmen dlouhé" })
    .max(255, { message: "Musí být méně než 255 písmen dlouhé" }),
  password: z
    .string()
    .min(8, { message: "Musi být nejkratě 8 znaků" })
    .max(255, { message: "Musi být měně než 255 znaků" }),
});

export function PasswordUpdateForm() {
  const form = useForm<z.infer<typeof formSchemaPassword>>({
    resolver: zodResolver(formSchemaPassword),
    defaultValues: {
      password: "",
      newPassword: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchemaPassword>) {
    console.log(values);
    const password = await fetch("/api/auth/settings/update-password", {
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
    if (passwordResponse.success) {
      console.log("Success", passwordResponse);
      router.push("/auth/settings");
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
          formLabel={"New Password"}
          render={({ field }) => (
            <Input type="password" value={field.value} {...field} />
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
export function EmailUpdateForm() {
  const form = useForm<z.infer<typeof formSchemaEmail>>({
    resolver: zodResolver(formSchemaEmail),
    defaultValues: {
      email: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchemaEmail>) {
    console.log(values);
    const email = await fetch("/api/auth/settings/update-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
      }),
    });
    const emailResponse = await email.json();
    if (emailResponse.redirect) router.push(emailResponse.redirect);
    if (emailResponse.success) {
      console.log("Success", emailResponse);
      router.push("/auth/settings");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <CustomFieldEmail
          control={form.control}
          name="email"
          formLabel={"Email"}
          render={({ field }) => (
            <Input type="email" value={field.value} {...field} />
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
