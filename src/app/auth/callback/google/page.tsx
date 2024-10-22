import { AuthCallback } from "@/components/auth/AuthCallback";
import React, { Suspense } from "react";

const GoogleCallback = () => <Suspense fallback={<div>Loading...</div>}><AuthCallback /></Suspense>;

export default GoogleCallback;
