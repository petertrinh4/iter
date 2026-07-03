import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";

const region = process.env.COGNITO_REGION;

if (!region) {
  throw new Error("COGNITO_REGION is not defined");
}

export const cognito = new CognitoIdentityProviderClient({
  region,
});