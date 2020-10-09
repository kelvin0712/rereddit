import { Flex, Box, Link, Button } from "@chakra-ui/core";
import NextLink from "next/link";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

const NavBar = () => {
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  let body;

  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
        <Box mr="2" color="white">
          <NextLink href="/register">Register</NextLink>
        </Box>
        <Box color="white">
          <NextLink href="/login">Login</NextLink>
        </Box>
      </>
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
    <Flex bg="tomato" p={4} ml="auto">
      <Box ml="auto">{body}</Box>
    </Flex>
  );
};

export default NavBar;
