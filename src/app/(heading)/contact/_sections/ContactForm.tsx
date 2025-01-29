"use client";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const formSchema = z.object({
  subject: z
    .string()
    .min(3, "Zadejte prosím subjekt")
    .max(90, "Příliš dlouhý subjekt"),
  body: z
    .string()
    .min(3, "Zadejte prosím popis")
    .max(1000, "Příliš dlouhý popis"),
  email: z.string().email("Zadejte prosím platnou emailovou adresu"),
});

export default function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      body: "",
      email: "",
    },
  });

  const { toast } = useToast();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      console.log(data);
      if (!data.success) {
        toast({
          title: "Nepodařilo se odeslat zprávu",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Zpráva odeslána",
          description: "Zpráva byla úspěšně odeslána.",
        });

        form.reset();
      }
    } catch (e) {
      console.log(e);
      toast({
        title: "Neznámá chyba",
        description: "Neznámá chyba. Zkuste to znovu později.",
        variant: "destructive",
      });
    }
  }

  return (
    <div>
      <section className="text-gray-600 body-font relative">
        <div className="max-w-container">
          <div className="flex flex-col text-center w-full mb-12">
            <h1 className="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
              Kontakt
            </h1>
            <p className="lg:w-2/3 mx-auto leading-relaxed text-base">
              Kontaktujte na otázky ohledně projektu.
            </p>
          </div>
          <div className="w-full flex justify-center items-center">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-[500px] w-full justify-center flex flex-col items-center p-6 space-y-8"
            >
              <div className="flex flex-wrap -m-2">
                <div className="p-2 w-1/2">
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name={"subject"}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Subjekt (3-90 znaků)*</FormLabel>
                          <FormControl>
                            <Input
                              type="text"
                      className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="p-2 w-1/2">
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name={"email"}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Email*</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                      className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="p-2 w-full">
                  <div className="relative">
                    <FormField
                      control={form.control}
                      name={"body"}
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormLabel>Obsah zprávy  (3-1000 znaků)*</FormLabel>
                          <FormControl>
                            <Textarea
                      className="w-full bg-gray-100 bg-opacity-50 rounded border border-gray-300 focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="p-2 w-full">
                  <button
                    type="submit"
                    className="flex mx-auto text-main-text-200 bg-main-background-300 shadow py-2 px-8 focus:outline-none hover:bg-transparent border-gray-200 border rounded text-lg"
                  >
                    Poslat
                  </button>
                </div>
                <div className="p-2 w-full pt-8 mt-8 border-t border-gray-200 text-center">
                  <a className="text-main-text-200">
                    dendrologic@stencukpage.com
                  </a>
                </div>
              </div>
            </form>
          </Form>
        </div>
        </div>
      </section>
    </div>
  );
}
