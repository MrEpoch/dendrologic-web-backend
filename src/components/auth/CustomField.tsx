import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import React from "react";
import { Control } from "react-hook-form";
import { formSchema } from "./AuthForm";
import { z } from "zod";

type customFieldType = {
  control: Control<z.infer<typeof formSchema>> | undefined;
  name: keyof z.infer<typeof formSchema>;
  render: (props: { field: any }) => React.ReactNode;
  className?: string;
  formLabel?: string;
};

export default function CustomField({
  control,
  render,
  name,
  formLabel,
  className = "",
}: customFieldType) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {formLabel && <FormLabel>{formLabel}</FormLabel>}
          <FormControl>{render({ field })}</FormControl>
        </FormItem>
      )}
    />
  );
}
