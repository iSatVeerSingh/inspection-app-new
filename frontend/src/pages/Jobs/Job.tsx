import { Link, useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
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
  Progress,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";
import ButtonPrimary from "../../components/ButtonPrimary";
import DatalistInput from "../../components/DatalistInput";
import ButtonOutline from "../../components/ButtonOutline";
import inspectionApi, { inspectionApiAxios } from "../../api/inspectionApi";
// reports@correctinspections.com.au

const Job = () => {
  const { jobNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const toast = useToast();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [progress, setProgress] = useState<any>(0);
  const [uploading, setUploading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const recommendationRef = useRef<HTMLInputElement>(null);

  const getJob = async () => {
    setLoading(true);
    const { success, data } = await clientApi.get(
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
    const report_id = crypto.randomUUID();

    const { success, error } = await clientApi.put(
      `/jobs?jobNumber=${jobNumber}`,
      {
        status: "In Progress",
        report_id: report_id,
      }
    );
    if (!success) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }
    await inspectionApi.put("/jobs", {
      job_id: job.id,
      report_id,
    });
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

  const submitReport = async () => {
    setSubmitting(true);
    const nonSyncedItemsResponse = await clientApi.get(
      `/non-synced-items?jobNumber=${jobNumber}`
    );
    if (!nonSyncedItemsResponse.success) {
      toast({
        title: nonSyncedItemsResponse.error,
        duration: 4000,
        status: "error",
      });
      setSubmitting(false);
      return;
    }

    const data = nonSyncedItemsResponse.data;
    if (data.inspectionItems.length > 0 || data.deletedItems.length > 0) {
      setUploading(true);
      let syncResponse = await inspectionApiAxios.post(
        "/sync-inspection-items",
        {
          job_id: data.id,
          report_id: data.report_id,
          deletedItems: data.deletedItems,
          inspectionItems: data.inspectionItems,
        },
        {
          onUploadProgress: (e) => {
            const upload = Math.floor(e.progress! * 100);
            setProgress(upload);
          },
        }
      );

      if (syncResponse.status < 200 || syncResponse.status > 299) {
        toast({
          title: syncResponse.data.message,
          status: "error",
          duration: 4000,
        });
        setUploading(false);
        setSubmitting(false);
        return;
      }
      setUploading(false);

      const { success, error } = await clientApi.put("/non-synced-items", {
        inspectionItems: syncResponse.data,
      });

      if (!success) {
        toast({
          title: error,
          status: "error",
          duration: 4000,
        });
        setSubmitting(false);
        return;
      }
    }

    console.log("start", new Date());

    setGenerating(true);
    const finishResponse = await inspectionApi.post("/finish-report", {
      job_id: data.id,
      report_id: data.report_id,
      inspectionNotes: data.inspectionNotes || [],
      recommendation: data.recommendation || null,
    });

    if (!finishResponse.success) {
      toast({
        title: finishResponse.error,
        status: "error",
        duration: 4000,
      });
      setGenerating(false);
      setSubmitting(false);
      return;
    }

    const response = await clientApi.put(`/jobs?jobNumber=${jobNumber}`, {
      status: "Completed",
      completedAt: finishResponse.data.completedAt,
    });
    setGenerating(false);
    if (!response.success) {
      return;
    }
    setSubmitting(false);
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
                      Site Address
                    </Text>
                    <Text color={"text.600"}>{job?.siteAddress}</Text>
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
                    <Box mt={3}>
                      <Heading as="h3" fontSize={"xl"} color={"text.700"}>
                        Add items from previous report
                      </Heading>
                      <Flex alignItems={"center"} gap={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total items from previous report
                        </Text>
                        <Text
                          color={"text.600"}
                          bg={"primary.50"}
                          px={2}
                          borderRadius={"md"}
                        >
                          {job?.previousInspectionItems}
                        </Text>
                      </Flex>
                      <Flex mt={2} alignItems={"center"} gap={2}>
                        <ButtonPrimary
                          minW={"200px"}
                          onClick={() => navigate("./previous-report")}
                        >
                          Add Items
                        </ButtonPrimary>
                        <ButtonOutline
                          minW={"200px"}
                          onClick={() => navigate("./previous-items")}
                        >
                          View Items
                        </ButtonOutline>
                      </Flex>
                    </Box>
                    <Box mt={3}>
                      <Heading as="h3" fontSize={"xl"} color={"text.700"}>
                        Add New Inspection Items
                      </Heading>
                      <Flex alignItems={"center"} gap={2}>
                        <Text fontSize={"lg"} minW={"200px"}>
                          Total items from current report
                        </Text>
                        <Text
                          color={"text.600"}
                          bg={"primary.50"}
                          px={2}
                          borderRadius={"md"}
                        >
                          {job?.newInspectionItems}
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
                    <Box mt={2}>
                      <ButtonPrimary onClick={onOpenAlert}>
                        Finish Report
                      </ButtonPrimary>
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

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onCloseAlert}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Finish Report</AlertDialogHeader>
            <AlertDialogBody>
              {job?.status === "Completed" ? (
                <>
                  <Text>You can view the pdf report by visiting this link</Text>
                  <a
                    href={`https://${location.hostname}/api/report/${job?.report_id}/${job?.type} - Inspection Report - ${job?.customer.nameOnReport}.pdf`}
                    target="_blank"
                    style={{
                      textDecoration: "underline",
                      color: "blue",
                      fontSize: "20px",
                    }}
                  >
                    Click to view pdf
                  </a>
                  <Box mt={3}>
                    <ButtonOutline
                      ref={cancelRef}
                      isDisabled={submitting}
                      onClick={onCloseAlert}
                    >
                      Close
                    </ButtonOutline>
                  </Box>
                </>
              ) : (
                <>
                  {generating ? (
                    <Box>
                      <Text>
                        Please wait while report is being generated. This can
                        take a few minutes depending on total items in report
                      </Text>
                      <Loading />
                    </Box>
                  ) : uploading ? (
                    <Box>
                      <Text>Uploading all items for current report</Text>
                      <Progress value={progress} rounded={"full"} />
                    </Box>
                  ) : (
                    <Box>
                      Are you sure? Please review the report once before
                      submitting.
                    </Box>
                  )}
                </>
              )}
            </AlertDialogBody>

            {!uploading && !generating && job?.status !== "Completed" && (
              <AlertDialogFooter gap={3}>
                <ButtonOutline
                  ref={cancelRef}
                  isDisabled={submitting}
                  onClick={onCloseAlert}
                >
                  Cancel and Review
                </ButtonOutline>
                <ButtonPrimary
                  isLoading={submitting}
                  loadingText="Submitting"
                  onClick={submitReport}
                >
                  Submit Report
                </ButtonPrimary>
              </AlertDialogFooter>
            )}
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default Job;
