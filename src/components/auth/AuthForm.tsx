"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomField from "./CustomField";
import { useRouter } from "next/navigation";
import { MuseoModerno } from "next/font/google";

const museoModerno = MuseoModerno({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-museo-moderno",
});

export const formSchema = z
  .object({
    username: z
      .string()
      .min(1, { message: "Musi být nejkratě 1 znak" })
      .max(255, { message: "Musi být měně než 255 znaků" })
      .optional(),
    email: z.string().email(),
    password: z
      .string()
      .min(8, { message: "Musí být 8 nebo více písmen dlouhé" })
      .max(200, { message: "Musí být méně než 250 písmen dlouhé" }),
    passwordConfirm: z.string().optional(),
  })
  .superRefine(({ password, passwordConfirm }, ctx) => {
    if (typeof passwordConfirm === "string" && password !== passwordConfirm) {
      ctx.addIssue({
        code: "custom",
        message: "Hesla se neschodují",
        path: ["passwordConfirm"],
      });
    }
  });

export function AuthForm({
  authType = "login",
}: {
  authType?: "login" | "register";
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      authType === "register"
        ? {
            email: "",
            password: "",
            passwordConfirm: "",
            username: "",
          }
        : { email: "", password: "" },
  });

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    if (authType === "register") {
      const user = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
        }),
      });
      const userResponse = await user.json();

      if (userResponse.redirect) router.push(userResponse.redirect);

      if (userResponse.success) {
        console.log("Success", userResponse);
        router.push("/auth/2fa/setup");
      }
    } else {
      const user = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });
      const userResponse = await user.json();
      if (userResponse.redirect) router.push(userResponse.redirect);
      if (userResponse.success) {
        console.log("Success", userResponse);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-[500px] w-full flex flex-col items-center p-6 space-y-8"
      >
        {authType === "register" && (
          <CustomField
            control={form.control}
            className="w-full"
            name="username"
            formLabel={"Username"}
            render={({ field }) => (
              <Input
                type="text"
                className="bg-main-background-100 shadow border border-main-accent-100"
                value={field.value}
                {...field}
              />
            )}
          />
        )}
        <CustomField
          control={form.control}
          className="w-full"
          name="email"
          formLabel={"Email"}
          render={({ field }) => (
            <Input
              type="email"
              className="bg-main-background-100 shadow border border-main-accent-100"
              value={field.value}
              {...field}
            />
          )}
        />
        <CustomField
          control={form.control}
          name="password"
          className="w-full"
          formLabel={"password"}
          render={({ field }) => (
            <Input
              type="password"
              className="bg-main-background-100 shadow border border-main-accent-100"
              value={field.value}
              {...field}
            />
          )}
        />
        {authType === "register" && (
          <CustomField
            control={form.control}
            name="passwordConfirm"
            className="w-full"
            formLabel={"password confirm"}
            render={({ field }) => (
              <Input
                type="password"
                className="bg-main-background-100 shadow border border-main-accent-100"
                value={field.value}
                {...field}
              />
            )}
          />
        )}
        <Button
          className={`bg-main-background-300 px-10 ${museoModerno.className} font-medium border py-5 text-main-text-100 hover:bg-transparent hover:text-black hover:border-main-100 hover:border rounded-[--radius] text-lg shadow`}
          type="submit"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
