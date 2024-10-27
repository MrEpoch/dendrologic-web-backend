"use client";
import { useForm } from "react-hook-form";
import { formSchemaEmail } from "./UpdateForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form } from "../ui/form";
import { CustomFieldEmail } from "./CustomField";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useRouter } from "next/navigation";

export function ForgotPasswordForm() {
  const form = useForm<z.infer<typeof formSchemaEmail>>({
    resolver: zodResolver(formSchemaEmail),
    defaultValues: {
      email: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchemaEmail>) {
    console.log(values);
    const email = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: values.email,
      }),
    });
    const emailResponse = await email.json();
    if (emailResponse.success) {
      console.log("Success", emailResponse);
      router.push("/auth/reset-password/verify-email");
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
