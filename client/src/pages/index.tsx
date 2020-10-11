import { withUrqlClient } from "next-urql";
import Navbar from "../components/NavBar";
import { usePostsQuery } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  const [{ data, fetching }] = usePostsQuery();
  return (
    <div>
      <Navbar />
      {fetching ? (
        <div>Loading...</div>
      ) : (
        data?.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
