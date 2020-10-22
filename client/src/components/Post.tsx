import { Box, Flex, IconButton, Link, Text } from "@chakra-ui/core";
import { useState } from "react";
import {
  PostFragmentFragment,
  useDeletePostMutation,
  useMeQuery,
  useVoteMutation,
} from "../generated/graphql";
import NextLink from "next/link";

interface PostProps {
  post: PostFragmentFragment;
}

const Post: React.FC<PostProps> = ({ post }) => {
  const [updootLoading, setUpdootLoading] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >("not-loading");
  const [{ data }] = useMeQuery();
  const [, vote] = useVoteMutation();
  const [, deletePost] = useDeletePostMutation();
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
              if (post.voteStatus === 1) {
                return;
              }
              setUpdootLoading("updoot-loading");
              await vote({ value: 1, postId: post.id });
              setUpdootLoading("not-loading");
            }}
            isLoading={updootLoading === "updoot-loading"}
            variantColor={post.voteStatus === 1 ? "green" : undefined}
          />
          {post.point}
          <IconButton
            aria-label="Downdoot"
            size="sm"
            icon="chevron-down"
            onClick={async () => {
              if (post.voteStatus === -1) {
                return;
              }
              setUpdootLoading("downdoot-loading");
              await vote({ value: -1, postId: post.id });
              setUpdootLoading("not-loading");
            }}
            isLoading={updootLoading === "downdoot-loading"}
            variantColor={post.voteStatus === -1 ? "red" : undefined}
          />
        </Flex>
        <Flex flex={1} flexDirection="column">
          <NextLink href={`/post/${post.id}`}>
            <Link fontWeight="bold" fontSize="xl">
              {post.title}
            </Link>
          </NextLink>
          <Text mb={4}>Posted by {post.creator.username}</Text>
          <Flex flex={1}>
            <Text mt={4}>{post.textSnippet}</Text>
            {data?.me?.id === post.creator.id ? (
              <Box ml="auto">
                <NextLink href={`post/edit/${post.id}`}>
                  <IconButton
                    as={Link}
                    mr={2}
                    aria-label="Edit Post"
                    icon="edit"
                  />
                </NextLink>
                <IconButton
                  ml="auto"
                  aria-label="Delete Post"
                  icon="delete"
                  onClick={() => deletePost({ id: post.id })}
                />
              </Box>
            ) : null}
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Post;
