import { Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import Layout from "../components/Layout";
import { useState } from "react";
import Post from "../components/Post";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  if (!data && !fetching) {
    return <div>There is something wrong with ur query!</div>;
  }

  return (
    <Layout>
      <Flex justifyContent="space-between">
        <Heading>Posts</Heading>
      </Flex>
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <>
          <Stack spacing={8}>
            {data?.posts.posts?.map((post) =>
              !post ? null : <Post post={post} key={post.id} />
            )}
          </Stack>
        </>
      )}
      {data && data.posts.hasMore ? (
        <Flex marginY={8} justifyContent="center">
          <Button
            onClick={() =>
              setVariables({
                limit: 10,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              })
            }
            isLoading={fetching}
          >
            Load more
          </Button>
        </Flex>
      ) : null}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
