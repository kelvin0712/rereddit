import { Link } from "@chakra-ui/core";
import { withUrqlClient } from "next-urql";
import Navbar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from "next/link";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery();
  return (
    <div>
      <Navbar />
      {fetching ? (
        <div>Loading...</div>
      ) : (
        <>
          <Link>
            <NextLink href="/create-post">Create Post</NextLink>
          </Link>
          {data?.posts.map((post) => (
            <div key={post.id}>{post.title}</div>
          ))}
        </>
      )}
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
