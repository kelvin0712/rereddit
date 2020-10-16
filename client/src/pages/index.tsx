import { Box, Button, Flex, Heading, Link, Stack, Text } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";
import Layout from "../components/Layout";
import { useState } from "react";

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });

  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  return (
    <Layout>
      <Flex justifyContent="space-between">
        <Heading>Posts</Heading>
        <NextLink href="/create-post">
          <Link>Create Post</Link>
        </NextLink>
      </Flex>
      {fetching && !data ? (
        <div>Loading...</div>
      ) : (
        <>
          <Stack spacing={8}>
            {data?.posts.map((post) => (
              <Box
                p={5}
                shadow="md"
                borderWidth="1px"
                flex="1"
                rounded="md"
                key={post.id}
              >
                <Heading fontSize="xl">{post.title}</Heading>
                <Text mt={4}>{post.textSnippet}</Text>
              </Box>
            ))}
          </Stack>
        </>
      )}
      {data ? (
        <Flex marginY={8} justifyContent="center">
          <Button
            onClick={() =>
              setVariables({
                limit: 10,
                cursor: data.posts[data.posts.length - 1].createdAt,
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
