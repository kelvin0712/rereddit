import { FieldError } from "../generated/graphql";

export const toErrorMap = (errors: FieldError[]) => {
  const errorsMap: Record<string, string> = {};
  errors.forEach(({ field, message }) => {
    errorsMap[field] = message;
  });

  return errorsMap;
};
