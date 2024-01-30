import { useEffect, useState } from "react";
import clientApi from "../../api/clientApi";
import PageLayout from "../../layout/PageLayout";
import Loading from "../../components/Loading";
import { Box, Flex, Grid, Text } from "@chakra-ui/react";
import DataNotFound from "../../components/DataNotFound";
import { Link } from "react-router-dom";
import { LocationIcon, UserIcon } from "../../icons";

const Jobs = () => {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);

  const getJobs = async () => {
    const { success, data } = await clientApi.get("/jobs");
    if (!success) {
      setLoading(false);
      return;
    }
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => {
    getJobs();
  }, []);

  return (
    <PageLayout title="Jobs" isRoot btn="Create Job">
      {loading ? (
        <Loading />
      ) : (
        <>
          {jobs.length !== 0 ? (
            <Grid gap={2}>
              {jobs.map((job: any) => (
                <Link key={job?.id} to={"./" + job?.jobNumber}>
                  <Box
                    key={job?.id}
                    alignItems={"center"}
                    bg={"main-bg"}
                    p="2"
                    borderRadius={"lg"}
                    shadow={"xs"}
                    justifyContent={"space-between"}
                    gap={2}
                  >
                    <Flex
                      alignItems={"center"}
                      justify={"space-between"}
                      flexGrow={1}
                    >
                      <Text fontSize={"lg"}>
                        &#35;{job?.jobNumber} - {job?.category}
                      </Text>
                      <Text color={"text.500"}>{job?.startsAt}</Text>
                    </Flex>
                    <Flex alignItems={"start"}>
                      <Box flexGrow={1}>
                        <Text color={"text.600"}>
                          <UserIcon boxSize={5} /> {job?.customer.nameOnReport}
                        </Text>
                        <Text color={"text.600"}>
                          <LocationIcon boxSize={5} /> {job?.siteAddress}
                        </Text>
                      </Box>
                      <Text
                        px={3}
                        bg={"primary.100"}
                        color={"orange.500"}
                        borderRadius={"lg"}
                      >
                        {job?.status}
                      </Text>
                    </Flex>
                  </Box>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Jobs;
