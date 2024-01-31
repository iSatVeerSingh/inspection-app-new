import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import { useEffect, useState } from "react";
import clientApi from "../../api/clientApi";
import { Box, Flex, Grid, Heading, Text, useToast } from "@chakra-ui/react";
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOuline from "../../components/ButtonOutline";

const Job = () => {
  const { jobNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const toast = useToast();
  const navigate = useNavigate();
  const getJob = async () => {
    setLoading(true);
    const { success, data, error } = await clientApi.get(
      `/jobs?jobNumber=${jobNumber}`
    );
    if (!success) {
      setLoading(false);
      return;
    }
    setJob(data);
    setLoading(false);
  };

  useEffect(() => {
    getJob();
  }, []);

  const startInspection = async () => {
    const { success, error } = await clientApi.put(
      `/jobs?jobNumber=${jobNumber}`,
      null
    );
    if (!success) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }
    await getJob();
  };

  const demo = async () => {
    const { data: libItems } = await clientApi.get("/items-index");

    const response = await fetch("/demo/report10.json");
    const report = await response.json();

    //   report.inspectionNotes?.forEach(async (note: string) => {
    //     const response = await clientApi.post(
    //       `/jobs/note?jobNumber=${jobNumber}`,
    //       {
    //         note,
    //       }
    //     );
    //     console.log(response);
    //   });

    report.inspectionItems.forEach(async (item: any) => {
      const category = item.itemName.split(":-")[0];
      const name = item.itemName.split(":-")[1];
      // const { success, data, error } = await clientApi.post(
      //   "/jobs/inspection-items",
      //   inspectionItem
      // );

      const libItem = libItems.find((temp: any) => temp.name === name);
      const response = await clientApi.post("/jobs/inspection-items", {
        id: crypto.randomUUID(),
        category: category,
        name: name,
        images: item.itemImages,
        library_item_id: libItem.id,
        note: item.itemNote,
        job_id: job.id,
        custom: 0,
        previousItem: 0,
      });

      console.log(response);
    });
  };

  return (
    <PageLayout title="Job Details">
      {loading ? (
        <Loading />
      ) : (
        <>
          {job ? (
            <>
              <Card>
                <Heading
                  as="h2"
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight={"semibold"}
                  color={"text.700"}
                >
                  &#35;{job?.jobNumber} - {job?.category}
                </Heading>
                <Grid gap={2}>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                      Name On Report
                    </Text>
                    <Text color={"text.600"}>
                      {job?.customer?.nameOnReport}
                    </Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                      Customer Name
                    </Text>
                    <Text color={"text.600"}>{job?.customer?.name}</Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                      Customer Email
                    </Text>
                    <Text color={"text.600"}>{job?.customer?.email}</Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                      Date & Time
                    </Text>
                    <Text color={"text.600"}>{job?.startsAt}</Text>
                  </Flex>
                  <Flex alignItems={"center"}>
                    <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                      Status
                    </Text>
                    <Text color={"text.600"}>{job?.status}</Text>
                  </Flex>
                  <Flex
                    alignItems={
                      job?.description.length > 30 ? "start" : "center"
                    }
                    direction={job?.description.length > 30 ? "column" : "row"}
                  >
                    <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                      Description
                    </Text>
                    <Text color={"text.600"}>{job?.description}</Text>
                  </Flex>
                </Grid>
              </Card>
              <Card mt={2}>
                {job?.status === "Not Started" ? (
                  <Box>
                    <ButtonPrimary onClick={startInspection}>
                      Start Inspection
                    </ButtonPrimary>
                  </Box>
                ) : (
                  <>
                    <Box>
                      <Heading as="h3" fontSize={"xl"} color={"text.700"}>
                        Inspection Notes
                      </Heading>
                      <Flex alignItems={"center"} gap={2} mt={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total Notes
                        </Text>
                        <Text
                          color={"text.600"}
                          bg={"primary.50"}
                          px={2}
                          borderRadius={"md"}
                        >
                          {job?.inspectionNotes?.length || 0}
                        </Text>
                      </Flex>
                      <Flex mt={2} alignItems={"center"} gap={2}>
                        <ButtonPrimary
                          minW={"200px"}
                          onClick={() => navigate("./add-notes")}
                        >
                          Add Notes
                        </ButtonPrimary>
                        <ButtonOuline
                          minW={"200px"}
                          onClick={() => navigate("./all-notes")}
                        >
                          View Notes
                        </ButtonOuline>
                      </Flex>
                    </Box>
                    <Box>
                      <Heading as="h3" fontSize={"xl"} color={"text.700"}>
                        Add New Inspection Items
                      </Heading>
                      <Flex alignItems={"center"} gap={2} mt={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total items from current report
                        </Text>
                        <Text
                          color={"text.600"}
                          bg={"primary.50"}
                          px={2}
                          borderRadius={"md"}
                        >
                          {job?.inspectionItems}
                        </Text>
                      </Flex>
                      <Flex mt={2} alignItems={"center"} gap={2}>
                        <ButtonPrimary
                          minW={"200px"}
                          onClick={() => navigate("./add-items")}
                        >
                          Add Items
                        </ButtonPrimary>
                        <ButtonOuline
                          minW={"200px"}
                          onClick={() => navigate("./all-items")}
                        >
                          View Items
                        </ButtonOuline>
                      </Flex>
                    </Box>
                    {/* <ButtonOuline onClick={demo}>demo</ButtonOuline> */}
                  </>
                )}
              </Card>
            </>
          ) : (
            <DataNotFound />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Job;
