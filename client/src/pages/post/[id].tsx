import { Heading } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import Layout from "../../components/Layout";
import { useSinglePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";

const Post = () => {
  const router = useRouter();
  const id =
    typeof router.query.id === "string" ? parseInt(router.query.id) : -1;

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
    <Layout>
      <Heading mb={4}>{data.post.title}</Heading>
      {data.post.text}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
