import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { useForgetPasswordMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useState } from "react";

const ForgotPassword: React.FC<{}> = () => {
  const [, forgetPassword] = useForgetPasswordMutation();
  const [complete, setComplete] = useState(false);
  return (
    <Formik
      initialValues={{ email: "" }}
      onSubmit={async (values) => {
        await forgetPassword(values);
        setComplete(true);
      }}
    >
      {({ isSubmitting }) => (
        <>
          {complete ? (
            <div>Please check your email for the new password.</div>
          ) : (
            <Wrapper variant="small">
              <Form>
                <InputField label="Email" placeholder="Email" name="email" />
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  variantColor="teal"
                  mt={4}
                >
                  Send to your email
                </Button>
              </Form>
            </Wrapper>
          )}
        </>
      )}
    </Formik>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
