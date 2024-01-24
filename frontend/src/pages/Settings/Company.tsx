import { useEffect, useState } from "react";
import PageLayout from "../../layout/PageLayout";
import Loading from "../../components/Loading";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import inspectionApi from "../../api/inspectionApi";
import Card from "../../components/Card";

const Company = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>("Something went wrong");
  const [company, setCompany] = useState<any>(null);
  useEffect(() => {
    (async () => {
      const { success, data, error } = await inspectionApi.get("/company");
      if (!success) {
        setError(error);
        setLoading(false);
        return;
      }
      setCompany(data);
      setLoading(false);
    })();
  }, []);
  return (
    <PageLayout title="Company Info" isRoot>
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {company ? (
            <Card>
              <Grid gap={2}>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    Name
                  </Text>
                  <Text color={"text.600"}>{company?.name}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    Email
                  </Text>
                  <Text color={"text.600"}>{company?.email}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    Phone
                  </Text>
                  <Text color={"text.600"}>{company?.phone}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    Website
                  </Text>
                  <Text color={"text.600"}>{company?.website}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    Address Line 1
                  </Text>
                  <Text color={"text.600"}>{company?.addressLine1}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    Address Line 2
                  </Text>
                  <Text color={"text.600"}>{company?.addressLine2}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    City
                  </Text>
                  <Text color={"text.600"}>{company?.city}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"150px"}>
                    Country
                  </Text>
                  <Text color={"text.600"}>{company?.country}</Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Report Bcc Email
                  </Text>
                  <Text color={"text.600"}>
                    {company?.reportBccEmail || "N/A"}
                  </Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Report Sender Email
                  </Text>
                  <Text color={"text.600"}>
                    {company?.senderEmail || "N/A"}
                  </Text>
                </Flex>
                <Flex alignItems={"center"}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Manager Email
                  </Text>
                  <Text color={"text.600"}>
                    {company?.managerEmail || "N/A"}
                  </Text>
                </Flex>
              </Grid>
            </Card>
          ) : (
            <Text>{error}</Text>
          )}
        </Box>
      )}
    </PageLayout>
  );
};

export default Company;
