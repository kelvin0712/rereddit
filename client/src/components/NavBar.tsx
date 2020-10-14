import { Flex, Box, Link, Button } from "@chakra-ui/core";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";
import { isServerSide } from "../utils/isServerSide";

const NavBar = () => {
  const [{ data, fetching }] = useMeQuery({
    pause: isServerSide(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body;

  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <Flex>
        <Box mr="2" color="white">
          <NextLink href="/register">Register</NextLink>
        </Box>
        <Box color="white">
          <NextLink href="/login">Login</NextLink>
        </Box>
      </Flex>
    );
  } else {
    body = (
      <Box>
        <Link mr="3" color="white">
          {data.me.username}
        </Link>
        <Link color="white">
          <Button
            variant="link"
            isLoading={logoutFetching}
            onClick={() => logout()}
          >
            Logout
          </Button>
        </Link>
      </Box>
    );
  }
  return (
    <Flex position="sticky" top={0} zIndex={1} bg="tomato" p={4} ml="auto">
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};

export default NavBar;
