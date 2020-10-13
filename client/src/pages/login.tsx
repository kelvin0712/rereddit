import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button, Flex, Link } from "@chakra-ui/core";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

const Login: React.FC<{}> = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Formik
      initialValues={{ usernameOrEmail: "", password: "" }}
      onSubmit={async (values, { setErrors }) => {
        try {
          const response = await login(values);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
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
              label="UsernameOrEmail"
              placeholder="username or email"
              name="usernameOrEmail"
            />
            <Box mt={4}>
              <InputField
                label="Password"
                type="password"
                name="password"
                placeholder="password"
              />
            </Box>
            <Flex flexDirection="column">
              <NextLink href="/forgot-password">Forget your password?</NextLink>

              <Button
                type="submit"
                isLoading={isSubmitting}
                variantColor="teal"
                mt={4}
              >
                Login
              </Button>
            </Flex>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
};

export default withUrqlClient(createUrqlClient)(Login);
