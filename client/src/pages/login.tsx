import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

const Login: React.FC<{}> = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();
  return (
    <Formik
      initialValues={{ username: "", password: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await login({ options: values });
        if (response.data?.login.errors) {
          setErrors(toErrorMap(response.data.login.errors));
        } else if (response.data?.login.user) {
          router.push("/");
        }
      }}
    >
      {({ isSubmitting }) => (
        <Wrapper variant="small">
          <Form>
            <InputField
              label="Username"
              placeholder="username"
              name="username"
            />
            <Box mt={4}>
              <InputField
                label="Password"
                type="password"
                name="password"
                placeholder="password"
              />
            </Box>
            <Button
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
              mt={4}
            >
              Login
            </Button>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
};

export default Login;
