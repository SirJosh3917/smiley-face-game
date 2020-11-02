import Schema, { Type } from "computed-types";
import { PasswordSchema } from "@smiley-face-game/schemas/Password";
import { EmailSchema } from "@smiley-face-game/schemas/Email";

export const LoginSchema = Schema.either({
  email: EmailSchema,
  password: PasswordSchema,
});
export type Login = Type<typeof LoginSchema>;
export const validateLogin = LoginSchema.destruct();