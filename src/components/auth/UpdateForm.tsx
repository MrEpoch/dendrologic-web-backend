"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CustomFieldEmail, CustomFieldPassword } from "./CustomField";
import { useRouter } from "next/navigation";
import { MuseoModerno } from "next/font/google";

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

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-museo-moderno",
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
          formLabel={"Heslo"}
          render={({ field }) => (
            <Input type="password" value={field.value} {...field} />
          )}
        />
        <CustomFieldPassword
          control={form.control}
          name="newPassword"
          formLabel={"Nové heslo"}
          render={({ field }) => (
            <Input type="password" value={field.value} {...field} />
          )}
        />
        <Button
          className={`bg-main-background-300 px-10 ${museoModerno.className} font-medium border py-2 text-main-text-100 hover:bg-transparent hover:text-black hover:border-main-100 hover:border rounded-[--radius] text-lg shadow`}
          type="submit"
        >
          Změnit heslo
        </Button>
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
        <Button
          className={`bg-main-background-300 px-10 ${museoModerno.className} font-medium border py-2 text-main-text-100 hover:bg-transparent hover:text-black hover:border-main-100 hover:border rounded-[--radius] text-lg shadow`}
          type="submit"
        >
          Změnit email
        </Button>
      </form>
    </Form>
  );
}
