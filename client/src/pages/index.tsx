import { withUrqlClient } from "next-urql";
import Navbar from "../components/NavBar";
import { createUrqlClient } from "../utils/createUrqlClient";

const Index = () => {
  return (
    <div>
      <Navbar />
    </div>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
