import {
  Link,
  LoaderFunction,
  Outlet,
  redirect,
  useLoaderData,
  useLocation,
} from "react-router-dom";
import { GlobalContext } from "../context/GlobalContext";
import { Avatar, Box, Flex, Grid, Text } from "@chakra-ui/react";
import menuitems from "../router/menuitems";
import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "../icons";

export const dashboardLoader: LoaderFunction = ({ request }) => {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      return redirect("/login");
    }

    // const url = new URL(request.url);
    // if (url.pathname === "/") {
    //   return redirect("/jobs");
    // }

    return JSON.parse(user);
  } catch (err) {
    console.log(err);
    return redirect("/login");
  }
};

const Dashboard = () => {
  const user: any = useLoaderData();
  const { pathname } = useLocation();
  const currentPath = pathname.split("/")[1];
  const nestedPath = pathname.split("/")[2];
  const [connection, setConnection] = useState("Online");
  const [dropdown, setDropdown] = useState<any>(null);

  const setOnline = () => {
    localStorage.setItem("connection", "online");
    setConnection("online");
    console.log("Online");
  };

  const setOffline = () => {
    localStorage.setItem("connection", "offline");
    setConnection("Offline");
    console.log("offline");
  };

  useEffect(() => {
    if (navigator.onLine) {
      setOnline();
    } else {
      setOffline();
    }

    window.addEventListener("online", setOnline);
    window.addEventListener("offline", setOffline);

    return () => {
      window.removeEventListener("online", setOnline);
      window.removeEventListener("offline", setOffline);
    };
  }, []);

  return (
    <GlobalContext.Provider value={{ user, connection }}>
      <Grid
        as="main"
        gridTemplateColumns={"250px auto"}
        h={"100vh"}
        overflow={"hidden"}
        bg={"app-bg"}
      >
        <Grid
          bg={"main-bg"}
          px={"3"}
          shadow={"xs"}
          gridTemplateRows={"60px auto"}
        >
          <Flex gap={2} alignItems={"center"} py={3}>
            <Avatar src="/logo.png" size={"sm"} />
            <Box>
              <Text fontSize={"lg"} lineHeight={1}>
                {user.name}
              </Text>
              <Text fontSize={"small"}>{connection}</Text>
            </Box>
          </Flex>
          <Flex direction={"column"} py={2} gap={2}>
            {menuitems.map(
              (item, index) =>
                item.children ? (
                  <Box key={index}>
                    <Flex
                      key={index}
                      alignItems={"center"}
                      gap={2}
                      px={3}
                      py={2}
                      mb={2}
                      borderRadius={"full"}
                      bg={
                        item.path === "/" + currentPath
                          ? "primary.500"
                          : "primary.50"
                      }
                      color={
                        item.path === "/" + currentPath ? "white" : "text.700"
                      }
                    >
                      <Link style={{ flexGrow: 1 }} to={item.path}>
                        {item.name}
                      </Link>
                      <button
                        onClick={() =>
                          setDropdown((prev: any) =>
                            prev === item.path ? null : item.path
                          )
                        }
                      >
                        {dropdown === item.path ? (
                          <ChevronUp boxSize={5} />
                        ) : (
                          <ChevronDown boxSize={5} />
                        )}
                      </button>
                    </Flex>
                    {dropdown === item.path && (
                      <Grid pl={"3"} gap={2}>
                        {item.children.map((child, index) => (
                          <Link to={child.path} key={index}>
                            <Box
                              bg={
                                item.path + "/" + nestedPath === child.path
                                  ? "primary.100"
                                  : "primary.50"
                              }
                              px={3}
                              py={2}
                              borderRadius={"full"}
                            >
                              {child.name}
                            </Box>
                          </Link>
                        ))}
                      </Grid>
                    )}
                  </Box>
                ) : (
                  <Flex key={index}></Flex>
                )

              // <>
              // <Flex
              //   key={index}
              //   alignItems={"center"}
              //   gap={2}
              //   px={3}
              //   py={2}
              //   borderRadius={"full"}
              //   bg={
              //     item.path === "/" + currentPath
              //       ? "primary.500"
              //       : "primary.50"
              //   }
              //   color={item.path === "/" + currentPath ? "white" : "text.700"}
              // >
              //   <Link style={{ flexGrow: 1 }} to={item.path}>
              //     {item.name}
              //   </Link>
              //   <button
              //     onClick={() =>
              //       setDropdown((prev: any) =>
              //         prev === item.path ? null : item.path
              //       )
              //     }
              //   >
              //     <ChevronDown boxSize={5} />
              //   </button>
              // </Flex>
              //   <Flex>
              //     {

              //     }
              //   </Flex>
              // </>

              // <Link to={item.path} key={index}>
              //   <Flex
              //     alignItems={"center"}
              //     gap={2}
              //     px="3"
              //     py={2}
              //     borderRadius={"full"}
              //     bg={
              //       item.path === "/" + currentPath
              //         ? "primary.500"
              //         : "primary.50"
              //     }
              //     color={item.path === "/" + currentPath ? "white" : "text.700"}
              //     fontSize={"lg"}
              //   >
              //     <Text as="span">{item.name}</Text>
              //     <ChevronDown />
              //   </Flex>
              // </Link>
            )}
          </Flex>
        </Grid>
        <Outlet />
      </Grid>
    </GlobalContext.Provider>
  );
};

export default Dashboard;
