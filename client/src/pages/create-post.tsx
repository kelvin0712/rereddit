import { Formik, Form } from "formik";
import InputField from "../components/InputField";
import { Box, Button } from "@chakra-ui/core";
import { useCreatePostMutation } from "../generated/graphql";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";
import Layout from "../components/Layout";
import { useIsAuth } from "../utils/useIsAuth";

const CreatePost: React.FC = () => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();
  useIsAuth();
  return (
    <Formik
      initialValues={{ title: "", text: "" }}
      onSubmit={async (values) => {
        const { error } = await createPost({ input: values });
        if (!error) {
          router.push("/");
        }
      }}
    >
      {({ isSubmitting }) => (
        <Layout variant="small">
          <Form>
            <InputField label="Title" placeholder="title" name="title" />
            <Box mt={4}>
              <InputField
                textarea
                label="Text"
                name="text"
                placeholder="text"
              />
            </Box>
            <Button
              type="submit"
              isLoading={isSubmitting}
              variantColor="teal"
              mt={4}
            >
              Create Post
            </Button>
          </Form>
        </Layout>
      )}
    </Formik>
  );
};

export default withUrqlClient(createUrqlClient)(CreatePost);
