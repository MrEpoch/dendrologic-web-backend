"use client";

import { useEffect, useState } from "react";
import { redirectToAuth } from "supertokens-auth-react";
import SuperTokens from "supertokens-auth-react/ui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import Dashboard from "supertokens-node/recipe/dashboard";

export default function Page() {
  // if the user visits a page that is not handled by us (like /auth/random), then we redirect them back to the auth page.
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (SuperTokens.canHandleRoute([EmailPasswordPreBuiltUI]) === false) {
      redirectToAuth({ redirectBack: false });
    } else {
      console.log(SuperTokens.getRoutingComponent([EmailPasswordPreBuiltUI]));
      setLoaded(true);
    }
  }, []);

  if (loaded) {
    return SuperTokens.getRoutingComponent([EmailPasswordPreBuiltUI]);
  }

  return null;
}