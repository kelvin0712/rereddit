import { Box, Flex, Heading, IconButton, Text } from "@chakra-ui/core";
import { useState } from "react";
import { PostFragmentFragment, useVoteMutation } from "../generated/graphql";

interface PostProps {
  post: PostFragmentFragment;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [updootLoading, setUpdootLoading] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [, vote] = useVoteMutation();
  return (
    <Box p={5} shadow="md" borderWidth="1px" flex="1" rounded="md">
      <Flex>
        <Flex
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          marginRight={4}
        >
          <IconButton
            aria-label="Updoot"
            size="sm"
            icon="chevron-up"
            onClick={async () => {
              if (post.point === 1) {
                return;
              }
              setUpdootLoading("updoot-loading");
              await vote({ value: 1, postId: post.id });
              setUpdootLoading("not-loading");
            }}
            isLoading={updootLoading === "updoot-loading"}
            variantColor={post.point === 1 ? "green" : undefined}
          />
          {post.point}
          <IconButton
            aria-label="Downdoot"
            size="sm"
            icon="chevron-down"
            onClick={async () => {
              if (post.point === -1) {
                return;
              }
              setUpdootLoading("downdoot-loading");
              await vote({ value: -1, postId: post.id });
              setUpdootLoading("not-loading");
            }}
            isLoading={updootLoading === "downdoot-loading"}
            variantColor={post.point === -1 ? "red" : undefined}
          />
        </Flex>
        <Box>
          <Heading fontSize="xl">{post.title}</Heading>
          <Text mb={4}>Posted by {post.creator.username}</Text>
          <Text mt={4}>{post.textSnippet}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default Post;
