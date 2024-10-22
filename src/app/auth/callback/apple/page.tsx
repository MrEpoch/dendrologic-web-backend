import { AuthCallback } from "@/components/auth/AuthCallback";
import React, { Suspense } from "react";

const AppleCallback = () => <Suspense fallback={<div>Loading...</div>}><AuthCallback /></Suspense>;

export default AppleCallback;
