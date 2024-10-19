import { onThirdPartyLogin } from "@/lib/superTokenUtils";
import {
  AppleButton,
  GithubButton,
  GoogleButton,
} from "@/components/socialButtons";

export const StackedSocialButtons = ({
  buttons,
}: {
  buttons: ("google" | "github" | "apple")[];
}) => (
  <div className="flex flex-col mt-2 space-y-6">
    {buttons.includes("google") && (
      <GoogleButton
        onClick={() =>
          onThirdPartyLogin({
            provider: "google",
            platform: "WEB",
          })
        }
      />
    )}
    {buttons.includes("github") && (
      <GithubButton
        onClick={() =>
          onThirdPartyLogin({
            provider: "github",
            platform: "WEB",
          })
        }
      />
    )}
    {buttons.includes("apple") && (
      <AppleButton
        onClick={() =>
          onThirdPartyLogin({
            provider: "apple",
            platform: "WEB",
          })
        }
      />
    )}
  </div>
);
