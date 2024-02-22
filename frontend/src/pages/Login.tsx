import { Box, Center, Heading, Text, VStack, useToast } from "@chakra-ui/react";
import Card from "../components/Card";
import FormInput from "../components/FormInput";
import ButtonPrimary from "../components/ButtonPrimary";
import { FormEventHandler, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";

type LoginForm = {
  email: string;
  password: string;
};

const Login = () => {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState<Partial<LoginForm> | null>(null);
  const [logging, setLogging] = useState(false);
  const toast = useToast();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formdata = new FormData(e.target as HTMLFormElement);
    const email = formdata.get("email")?.toString().trim();
    const password = formdata.get("password")?.toString().trim();

    if (!email || email === "") {
      setFormErrors({ email: "Please provide a valid email" });
      return;
    }
    if (!password || password === "") {
      setFormErrors({ password: "Password is required" });
      return;
    }
    setFormErrors(null);
    setLogging(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        toast({
          title: data.message || "Invalid request",
          duration: 4000,
          status: "error",
        });
        setLogging(false);

        return;
      }

      localStorage.setItem("user", JSON.stringify(data));
      setLogging(false);
    } catch (err: any) {
      toast({
        title: err.message || "Invalid request",
        duration: 4000,
        status: "error",
      });
      setLogging(false);

      return;
    }

    if ("serviceWorker" in navigator) {
      let serviceWorker: ServiceWorker;
      const registration = await navigator.serviceWorker.register(
        import.meta.env.MODE === "production" ? "/sw.js" : "/dev-sw.js?dev-sw",
        { type: import.meta.env.MODE === "production" ? "classic" : "module" }
      );
      if (registration.installing) {
        serviceWorker = registration.installing;
      } else if (registration.waiting) {
        serviceWorker = registration.waiting;
      } else if (registration.active) {
        serviceWorker = registration.active;
      }
      if (serviceWorker!) {
        serviceWorker.addEventListener("statechange", (e) => {
          if ((e.currentTarget as ServiceWorker).state === "activated") {
            console.log("Service worker activated");
            setLogging(false);
            navigate("/init");
          }
        });
      }
    }
  };

  return (
    <Center as="main" h={"100vh"} bg={"app-bg"} p={3}>
      <Card w={"100%"} maxW={"600px"} px={5} py={5}>
        <Box textAlign={"center"} mb={3}>
          <Text fontSize={"lg"} color={"text.500"}>
            Inspection Report App by Correct Inspections
          </Text>
          <Heading as="h2">Welcome</Heading>
        </Box>
        <form onSubmit={handleSubmit}>
          <VStack>
            <FormInput
              id="email"
              type="email"
              name="email"
              placeholder="example@gmail.com"
              label="Email"
              inputError={formErrors?.email}
            />
            <FormInput
              id="password"
              type="password"
              name="password"
              placeholder="John@!23"
              label="Password"
              inputError={formErrors?.password}
            />
            <ButtonPrimary
              type="submit"
              w={"full"}
              mt={3}
              loadingText="Logging in"
              isLoading={logging}
            >
              Login
            </ButtonPrimary>
          </VStack>
        </form>
      </Card>
    </Center>
  );
};

export default Login;
