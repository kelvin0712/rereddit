import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { GetServerSideProps, NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import { useState } from "react";
import InputField from "../../components/InputField";
import Wrapper from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";
import NextLink from "next/link";

const ForgetPassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState("");
  return (
    <Formik
      initialValues={{ newPassword: "" }}
      onSubmit={async (values, { setErrors }) => {
        try {
          const response = await changePassword({
            newPassword: values.newPassword,
            token,
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors);
            if ("token" in errorMap) {
              setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push("/");
          }
        } catch (err) {
          console.log(err);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Wrapper variant="small">
          <Form>
            <InputField
              label="New Password"
              placeholder="new password"
              name="newPassword"
              type="password"
            />
            <Flex flexDirection="column">
              <NextLink href="/forgot-password">
                Go to forget password!
              </NextLink>
              {tokenError ? <Box>{tokenError}</Box> : null}
              <Button
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
                mt={4}
              >
                Change password
              </Button>
            </Flex>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  return {
    props: {
      token: query.token as string,
    },
  };
};

export default withUrqlClient(createUrqlClient)(ForgetPassword);
