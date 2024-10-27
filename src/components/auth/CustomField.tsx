"use client";
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
import { formSchemaEmail, formSchemaPassword } from "./UpdateForm";
import { formSchemaCode } from "./PasswordResetForm";

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

type customFieldTypeEmail = {
  control: Control<z.infer<typeof formSchemaEmail>> | undefined;
  name: keyof z.infer<typeof formSchemaEmail>;
  render: (props: { field: any }) => React.ReactNode;
  className?: string;
  formLabel?: string;
};

export function CustomFieldEmail({
  control,
  render,
  name,
  formLabel,
  className = "",
}: customFieldTypeEmail) {
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

type customFieldTypePassword = {
  control: Control<z.infer<typeof formSchemaPassword>> | undefined;
  name: keyof z.infer<typeof formSchemaPassword>;
  render: (props: { field: any }) => React.ReactNode;
  className?: string;
  formLabel?: string;
};

export function CustomFieldPassword({
  control,
  render,
  name,
  formLabel,
  className = "",
}: customFieldTypePassword) {
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

type customFieldTypeCode = {
  control: Control<z.infer<typeof formSchemaCode>> | undefined;
  name: keyof z.infer<typeof formSchemaCode>;
  render: (props: { field: any }) => React.ReactNode;
  className?: string;
  formLabel?: string;
};

export function CustomFieldCode({
  control,
  render,
  name,
  formLabel,
  className = "",
}: customFieldTypeCode) {
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
