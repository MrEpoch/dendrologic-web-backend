import { PasswordResetRecoveryCodeForm, PasswordResetTOTPForm } from "@/components/auth/PasswordResetForm";
import { validatePasswordResetSessionRequest } from "@/lib/password-reset";
import { globalGETRateLimitNext } from "@/lib/request";
import { redirect } from "next/navigation";

export default async function Page() {
	if (!globalGETRateLimitNext()) {
    return <div>Too many requests</div>;
	}
	const { session, user } = await validatePasswordResetSessionRequest();

	if (session === null) {
    return redirect("/auth/forgot-password");
	}
	if (!session.emailVerified) {
    return redirect("/auth/reset-password/verify-email");
	}
	if (!user.registered2FA) {
    return redirect("/auth/reset-password");
	}
	if (session.twoFactorVerified) {
    return redirect("/auth/reset-password");
	}
	return (
		<>
			<h1>Two-factor authentication</h1>
			<p>Enter the code from your authenticator app.</p>
			<PasswordResetTOTPForm />
			<section>
				<h2>Use your recovery code instead</h2>
				<PasswordResetRecoveryCodeForm />
			</section>
		</>
	);
}
