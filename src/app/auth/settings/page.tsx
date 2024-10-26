import { RecoveryCodeForm } from '@/components/auth/RecoveryCodeForm';
import { EmailUpdateForm, PasswordUpdateForm } from '@/components/auth/UpdateForm';
import { globalGETRateLimitNext } from '@/lib/request';
import { getCurrentSession } from '@/lib/sessionTokens';
import { getUserRecoveryCode } from '@/lib/user';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react'

export default async function Page() {
  if (!globalGETRateLimitNext()) {
    return <div>Too many requests</div>
	}
	const { session, user } = await getCurrentSession();
	if (session === null) {
    return redirect("/auth/login");
	}
	if (user.registered2FA && !session.twoFactorVerified) {
    return redirect("/auth/2fa");
	}
	let recoveryCode: string | null = null;
	if (user.registered2FA) {
		recoveryCode = await getUserRecoveryCode(user.id);
	}

  return (
    <div>
			<header>
				<Link href="/">Home</Link>
        <Link href="/auth/settings">Settings</Link>
			</header>
			<main>
				<h1>Settings</h1>
				<section>
					<h2>Update email</h2>
					<p>Your email: {user.email}</p>
					<EmailUpdateForm />
				</section>
				<section>
					<h2>Update password</h2>
					<PasswordUpdateForm />
				</section>
				{user.registered2FA && (
					<section>
						<h2>Update two-factor authentication</h2>
            <Link href="/auth/2fa/setup">Update</Link>
					</section>
				)}
				{recoveryCode !== null && <RecoveryCodeForm recoveryCode={recoveryCode} />}
      </main>  
  </div>
  )
}

