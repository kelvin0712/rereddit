import { Flex, Box, Link, Button, Heading } from "@chakra-ui/core";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { useMeQuery, useLogoutMutation } from "../generated/graphql";

const NavBar = () => {
  const [{ data, fetching }] = useMeQuery({
    // pause: isServerSide() // fetch the query in the browser => not ssr
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();

  const router = useRouter();

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
      <Flex alignItems="center">
        <NextLink href="/create-post">
          <Button as={Link} mr={4}>
            Create Post
          </Button>
        </NextLink>
        <Link mr="3" color="white">
          {data.me.username}
        </Link>
        <Link color="white">
          <Button
            variant="link"
            isLoading={logoutFetching}
            onClick={async () => {
              await logout();
              router.reload();
            }}
          >
            Logout
          </Button>
        </Link>
      </Flex>
    );
  }
  return (
    <Flex
      position="sticky"
      top={0}
      zIndex={1}
      bg="tomato"
      p={4}
      ml="auto"
      alignItems="center"
      justifyContent="center"
    >
      <Flex maxWidth={800} flex={1} alignItems="center">
        <NextLink href="/">
          <Link>
            <Heading>ReReddit</Heading>
          </Link>
        </NextLink>
        <Box ml="auto">{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
