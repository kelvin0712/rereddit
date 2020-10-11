import { Formik, Form } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

interface registerProps {}

const Register: React.FC<registerProps> = () => {
  const [, register] = useRegisterMutation();
  const router = useRouter();
  return (
    <Formik
      initialValues={{ username: "", password: "", email: "" }}
      onSubmit={async (values, { setErrors }) => {
        const response = await register({ options: values });
        if (response.data?.register.errors) {
          setErrors(toErrorMap(response.data.register.errors));
        } else if (response.data?.register.user) {
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
                label="Email"
                type="email"
                name="email"
                placeholder="Email"
              />
            </Box>
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
              Register
            </Button>
          </Form>
        </Wrapper>
      )}
    </Formik>
  );
};

export default withUrqlClient(createUrqlClient)(Register);
