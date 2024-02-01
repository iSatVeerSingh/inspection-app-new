import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";
import ButtonPrimary from "../../components/ButtonPrimary";
import { DB } from "../../worker/db";
import inspectionApi from "../../api/inspectionApi";
import DatalistInput from "../../components/DatalistInput";
import ButtonOutline from "../../components/ButtonOutline";
// reports@correctinspections.com.au

const Job = () => {
  const { jobNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const toast = useToast();
  const navigate = useNavigate();
  const { onOpen, onClose, isOpen } = useDisclosure();
  const recommendationRef = useRef<HTMLInputElement>(null);

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

    const response = await clientApi.get("/recommendations");
    if (response.success) {
      const allRecommendations = response.data.map((item: any) => item);
      setRecommendations(allRecommendations);
    }
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

  const addRecommendation = async () => {
    if (recommendationRef.current) {
      const recommendation = recommendationRef.current.value.trim();
      if (!recommendation || recommendation === "") {
        return;
      }

      const { success, data, error } = await clientApi.post(
        `/recommendations?jobNumber=${jobNumber}`,
        { recommendation }
      );
      if (!success) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        return;
      }
      toast({
        title: data.message,
        duration: 4000,
        status: "success",
      });
      onClose();
      await getJob();
    }
  };

  const removeRecommendation = async () => {
    const { success, data, error } = await clientApi.delete(
      `/recommendations?jobNumber=${jobNumber}`
    );
    if (!success) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }
    toast({
      title: data.message,
      duration: 4000,
      status: "success",
    });
    onClose();
    await getJob();
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
                        <ButtonOutline
                          minW={"200px"}
                          onClick={() => navigate("./all-notes")}
                        >
                          View Notes
                        </ButtonOutline>
                      </Flex>
                    </Box>
                    <Box>
                      <Heading as="h3" fontSize={"xl"} color={"text.700"}>
                        Add New Inspection Items
                      </Heading>
                      <Flex alignItems={"center"} gap={2} mt={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total items from current r eport
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
                        <ButtonOutline
                          minW={"200px"}
                          onClick={() => navigate("./all-items")}
                        >
                          View Items
                        </ButtonOutline>
                      </Flex>
                    </Box>
                    <Box mt={2}>
                      <Heading as="h3" fontSize={"xl"} color={"text.700"}>
                        Recommendation
                      </Heading>

                      {job?.recommendation && job.recommendation !== "" ? (
                        <Box>
                          <Text>{job?.recommendation}</Text>
                          <ButtonOutline onClick={removeRecommendation}>
                            Remove Recommendation
                          </ButtonOutline>
                        </Box>
                      ) : (
                        <Box>
                          <ButtonPrimary onClick={onOpen}>
                            Add Recommendation
                          </ButtonPrimary>
                        </Box>
                      )}
                    </Box>
                  </>
                )}
              </Card>
            </>
          ) : (
            <DataNotFound />
          )}
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Recommendation</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <DatalistInput
              dataList={recommendations}
              id="recommendations"
              ref={recommendationRef}
            />
          </ModalBody>
          <ModalFooter gap={2}>
            <ButtonPrimary onClick={addRecommendation}>
              Add Recommendation
            </ButtonPrimary>
            <ButtonOutline onClick={onClose}>Cancel</ButtonOutline>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default Job;
