import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import InputField from "../../../components/InputField";
import Layout from "../../../components/Layout";
import {
  useSinglePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";

const EditPost = () => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

  const [, updatePost] = useUpdatePostMutation();
  const [{ data, fetching }] = useSinglePostQuery({
    pause: id === -1,
    variables: {
      id,
    },
  });

  if (fetching) {
    return <Layout>Loading...</Layout>;
  }

  if (!data?.post) {
    return <Layout>Could not find any post!</Layout>;
  }

  return (
    <Formik
      initialValues={{ title: data.post.title, text: data.post.text }}
      onSubmit={async (values) => {
        const { error } = await updatePost({ id, ...values });
        if (!error) {
          router.back();
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
              Update Post
            </Button>
          </Form>
        </Layout>
      )}
    </Formik>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
