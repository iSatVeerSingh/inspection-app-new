import {
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  Text,
  Progress,
} from "@chakra-ui/react";
import Card from "../components/Card";
import { useState } from "react";
import ButtonPrimary from "../components/ButtonPrimary";
import inspectionApi, { inspectionApiAxios } from "../api/inspectionApi";
import clientApi from "../api/clientApi";
import { useNavigate } from "react-router-dom";

const Init = () => {
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const installApp = async () => {
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
            // setLogging(false);
            // navigate("/init");
          }
        });
      }
    }

    setInstalling(true);

    const storage = navigator.storage;
    if (storage) {
      await storage.persist();
    }

    const user = localStorage.getItem("user");
    if (user) {
      const userResponse = await clientApi.post("/init-user", JSON.parse(user));
      if (!userResponse.success) {
        navigate("/login");
        return;
      }
    } else {
      navigate("/login");
    }

    setStatus("Fetching items");

    let response = await inspectionApiAxios.get("/install-items", {
      onDownloadProgress(e) {
        const downloadpr = Math.floor(e.progress! * 100);
        setProgress(downloadpr);
      },
    });

    if (response.status !== 200) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    let initResponse = await clientApi.post("/init-items", response.data);
    if (!initResponse.success) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    setStatus("Fetching categories");
    response = await inspectionApiAxios.get("/install-categories", {
      onDownloadProgress(e) {
        const downloadpr = Math.floor(e.progress! * 100);
        setProgress(downloadpr);
      },
    });

    if (response.status !== 200) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    initResponse = await clientApi.post("/init-categories", response.data);
    if (!initResponse.success) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    setStatus("Fetching notes");
    response = await inspectionApiAxios.get("/install-notes", {
      onDownloadProgress(e) {
        const downloadpr = Math.floor(e.progress! * 100);
        setProgress(downloadpr);
      },
    });

    if (response.status !== 200) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    initResponse = await clientApi.post("/init-notes", response.data);
    if (!initResponse.success) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    setStatus("Fetching recommendations");
    response = await inspectionApiAxios.get("/install-recommendations", {
      onDownloadProgress(e) {
        const downloadpr = Math.floor(e.progress! * 100);
        setProgress(downloadpr);
      },
    });

    if (response.status !== 200) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    initResponse = await clientApi.post("/init-recommendations", response.data);
    if (!initResponse.success) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    setStatus("Fetching job categories");
    response = await inspectionApiAxios.get("/install-job-categories", {
      onDownloadProgress(e) {
        const downloadpr = Math.floor(e.progress! * 100);
        setProgress(downloadpr);
      },
    });

    if (response.status !== 200) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    initResponse = await clientApi.post("/init-job-categories", response.data);
    if (!initResponse.success) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    setStatus("Fetching initial jobs");
    response = await inspectionApiAxios.get("/install-jobs", {
      onDownloadProgress(e) {
        const downloadpr = Math.floor(e.progress! * 100);
        setProgress(downloadpr);
      },
    });

    if (response.status !== 200) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    initResponse = await clientApi.post("/init-jobs", response.data);
    if (!initResponse.success) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    initResponse = await clientApi.post("/init-sync", null);
    if (!initResponse.success) {
      setError(response.data.message || "Something went wrong");
      setInstalling(false);
      return;
    }

    setInstalling(false);
    setInstalled(true);
  };

  return (
    <Center as="main" h={"100vh"} bg={"app-bg"} p={3}>
      <Card w={"100%"} maxW={"600px"} px={5} py={5} textAlign={"center"}>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          borderRadius={"lg"}
          mb={3}
        >
          <AlertIcon boxSize="40px" />
          <AlertTitle mt={4} mb={1} fontSize="2xl" color={"text.800"}>
            Important
          </AlertTitle>
          <AlertDescription color={"text.700"}>
            This is a Progressive web app, which means this app works as an
            offline website. So if you delete or clear browsing data/history,
            the data of this app will be deleted. So be carefull before clearing
            browsing data.
          </AlertDescription>
        </Alert>
        {!installing && !installed && !error && (
          <ButtonPrimary onClick={installApp}>Setup App</ButtonPrimary>
        )}
        {installing && !installed && !error && (
          <Box textAlign={"center"}>
            <Text fontSize={"lg"} color={"text.700"}>
              {status}
            </Text>
            <Progress value={progress} mt={2} rounded={"full"} />
          </Box>
        )}

        {!installing && installed && !error && (
          <Box>
            <Text>App successfully setup</Text>
            <ButtonPrimary>Go To App</ButtonPrimary>
          </Box>
        )}

        {!installing && !installed && error && (
          <Box>
            <Text color={"red"}>Error: {error}. Please try again</Text>
          </Box>
        )}
      </Card>
    </Center>
  );
};

export default Init;
