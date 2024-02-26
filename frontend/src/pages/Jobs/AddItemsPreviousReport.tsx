import { useParams } from "react-router-dom";
import ButtonPrimary from "../../components/ButtonPrimary";
import PageLayout from "../../layout/PageLayout";
import Card from "../../components/Card";
import { ChangeEventHandler, useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import { inspectionApiAxios } from "../../api/inspectionApi";
import Loading from "../../components/Loading";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  Grid,
  Heading,
  IconButton,
  Image,
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
import ButtonOutline from "../../components/ButtonOutline";
import { DeleteIcon, PlusIcon } from "../../icons";
import FileInput from "../../components/FileInput";
import { getResizedImagesBase64Main } from "../../utils/resizeimg";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";

const AddItemsPreviousReport = () => {
  const { jobNumber } = useParams();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [fetchingOnline, setFetchingOnline] = useState(false);
  const [progress, setProgress] = useState<any>();
  const [previousReport, setPreviousReport] = useState<any>(null);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const itemRef = useRef<any>();
  const filterRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [inputError, setInputError] = useState<any>();

  const { onOpen, onClose, isOpen } = useDisclosure();
  const {
    onOpen: onOpenForm,
    onClose: onCloseForm,
    isOpen: isOpenForm,
  } = useDisclosure();
  const {
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
    isOpen: isOpenAlert,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const imagesRef = useRef<HTMLInputElement>(null);

  const [previousItemIds, setPreviousItemIds] = useState([]);

  const getPreviousItemsIds = async (report_id: any = job.report_id) => {
    const response = await clientApi.get(
      `/previous-item-id?report_id=${report_id}`
    );
    if (!response.success) {
      return;
    }
    setPreviousItemIds(response.data);
  };

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (!response.success) {
        setLoading(false);
        return;
      }
      const jobdata = response.data;
      setJob(jobdata);

      response = await clientApi.get(`/previous-report?jobNumber=${jobNumber}`);
      setLoading(false);
      if (!response.success) {
        setFetchingOnline(true);
        const previousResponse = await inspectionApiAxios.get(
          `/previous-report/${jobdata.customer.id}`,
          {
            onDownloadProgress: (e) => {
              const downloadpr = Math.floor(e.progress! * 100);
              setProgress(downloadpr);
            },
          }
        );
        console.log(previousResponse);
        if (previousResponse.status !== 200) {
          toast({
            title: previousResponse.data.message,
            duration: 4000,
            status: "error",
          });
          setFetchingOnline(false);
          return;
        }
        const res = await clientApi.post(
          `/previous-report?jobNumber=${jobNumber}`,
          previousResponse.data
        );
        if (!res.success) {
          setFetchingOnline(false);
          return;
        }
        setPreviousReport(previousResponse.data);
        setFilteredItems(previousResponse.data.inspectionItems);
        setFetchingOnline(false);
        return;
      }
      setPreviousReport(response.data);
      setFilteredItems(response.data.inspectionItems);

      await getPreviousItemsIds(jobdata.report_id);
    })();
  }, []);

  const previewItem = (item: any) => {
    itemRef.current = item;
    onOpen();
  };

  const handleAddBtn = (item: any) => {
    itemRef.current = item;
    onOpenForm();
  };

  const isAdded = (itemid: any) => {
    return !!previousItemIds.find(
      (item: any) => item.previous_item_id === itemid
    );
  };

  const addItem = async (isImages: boolean) => {
    const inspectionItem: any = {
      id: crypto.randomUUID(),
      category: itemRef.current.category || "Custom",
      name: itemRef.current.name,
      images: [],
      previousItemImages: itemRef.current.images,
      note: itemRef.current.note,
      report_id: job.report_id,
      sync: job.report_id,
      previousItem: 1,
      previous_item_id: itemRef.current.id,
      height: itemRef.current.height,
    };

    if (itemRef.current.custom) {
      inspectionItem.custom = 1;
      (inspectionItem.openingParagraph = itemRef.current.openingParagraph),
        (inspectionItem.closingParagraph = itemRef.current.closingParagraph),
        (inspectionItem.embeddedImage = itemRef.current.embeddedImage);
    } else {
      inspectionItem.custom = 0;
      inspectionItem.library_item_id = itemRef.current.library_item_id;
    }

    if (isImages) {
      const files = imagesRef.current?.files;
      if (files?.length === 0) {
        return;
      }

      if (files!.length > 8) {
        setInputError("Max 8 images allowed");
        return;
      }

      setInputError(undefined);

      const resizedImages = await getResizedImagesBase64Main(files!);
      inspectionItem.images = resizedImages;
      inspectionItem.height =
        itemRef.current.images.length % 2 !== 0
          ? Math.ceil((resizedImages.length - 1) / 2) * 200 +
            itemRef.current.height
          : Math.ceil((resizedImages.length - 1) / 2) * 200 +
            itemRef.current.height;

      if (inspectionItem.previousItemImages.length + resizedImages.length > 6) {
        inspectionItem.height = inspectionItem.height + 130;
      }
    }

    let url = "/jobs/inspection-items";

    if (job.status === "Completed") {
      url = url + "?jobNumber=" + jobNumber;
    }

    const { success, data, error } = await clientApi.post(url, inspectionItem);
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
    onCloseForm();
    await getPreviousItemsIds();
  };

  const handleRemoveItembtn = (item: any) => {
    itemRef.current = item;
    onOpenAlert();
  };

  const deleteItem = async () => {
    const inspectionItem: any = previousItemIds.find(
      (item: any) => item.previous_item_id === itemRef.current.id
    );
    if (!inspectionItem) {
      return;
    }

    const { success, data, error } = await clientApi.delete(
      `/jobs/inspection-items?id=${inspectionItem?.id}`
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
    onCloseAlert();
    await getPreviousItemsIds();
  };

  const filterSearch: ChangeEventHandler<HTMLInputElement> = (e) => {
    const searchTerm = e.target.value.trim();
    if (!searchTerm || searchTerm === "") {
      return;
    }

    const filtered = previousReport?.inspectionItems.filter(
      (item: any) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredItems(filtered);
  };

  const clearSearch = () => {
    setFilteredItems(previousReport?.inspectionItems);
    filterRef.current!.value = "";
  };

  return (
    <PageLayout title="Add Items From Previous Report">
      {loading ? (
        <Loading />
      ) : (
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
            <Flex alignItems={"center"} mb={3}>
              <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                Name On Report
              </Text>
              <Text color={"text.600"}>{job?.customer?.nameOnReport}</Text>
            </Flex>
            {previousReport && (
              <>
                <Heading
                  as="h2"
                  fontSize={{ base: "xl", md: "2xl" }}
                  fontWeight={"semibold"}
                  color={"text.700"}
                >
                  Previous Report
                </Heading>
                <Flex alignItems={"center"} mb={2}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Job
                  </Text>
                  <Text color={"text.600"}>
                    {previousReport?.previousJob} - {previousReport?.category}
                  </Text>
                </Flex>
                <Flex alignItems={"center"} mb={2}>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Completed At
                  </Text>
                  <Text color={"text.600"}>{previousReport?.completedAt}</Text>
                </Flex>
              </>
            )}
          </Card>
          <Flex mt={2} alignItems={"center"} gap={2}>
            <FilterInput
              placeholder="Search by name, category"
              onChange={filterSearch}
              ref={filterRef}
            />
            <InputBtn value="Clear" onClick={clearSearch} />
          </Flex>
          {previousReport ? (
            <Grid gap={2} mt={2}>
              {filteredItems.map((item: any) => (
                <Card
                  key={item.id}
                  display={"flex"}
                  gap={2}
                  alignItems={"center"}
                >
                  <Box flexGrow={1} onClick={() => previewItem(item)}>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text fontSize={"lg"} color={"text.700"}>
                        {item?.name}
                      </Text>
                      <Text color={"text.500"}>
                        Images: {item?.images?.length}
                      </Text>
                    </Flex>
                    <Text
                      bg={"primary.50"}
                      px={3}
                      borderRadius={"md"}
                      maxW={"max-content"}
                    >
                      {item?.category}
                    </Text>
                    <Text color={"text.600"} mt={1}>
                      Note:{" "}
                      {item?.note && item?.note !== "" ? item.note : "N/A"}
                    </Text>
                  </Box>
                  {isAdded(item.id) ? (
                    <Box>
                      <Text fontSize={"xs"} color={"text.500"}>
                        Remove
                      </Text>
                      <IconButton
                        minW={"60px"}
                        colorScheme="red"
                        variant={"outline"}
                        icon={<DeleteIcon />}
                        aria-label="Remove Item"
                        onClick={() => handleRemoveItembtn(item)}
                      />
                    </Box>
                  ) : (
                    <Box textAlign={"center"}>
                      <Text fontSize={"xs"} color={"text.500"}>
                        ADD
                      </Text>
                      <IconButton
                        minW={"60px"}
                        icon={<PlusIcon />}
                        aria-label="Add Item"
                        onClick={() => handleAddBtn(item)}
                      />
                    </Box>
                  )}
                </Card>
              ))}
            </Grid>
          ) : (
            <Card mt={2}>
              {fetchingOnline ? (
                <Box textAlign={"center"}>
                  <Text>
                    No previous report for this customer found in offline
                    database. Fetching from server
                  </Text>
                  <Progress
                    maxW={"400px"}
                    mx={"auto"}
                    value={progress}
                    mt={2}
                    rounded={"full"}
                  />
                </Box>
              ) : (
                "Couldn't find any previous reports for this customer."
              )}
            </Card>
          )}
        </>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"xl"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Flex alignItems={"center"} mb={2}>
              <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                Item Name
              </Text>
              <Text color={"text.600"}>{itemRef.current?.name}</Text>
            </Flex>
            <Flex alignItems={"center"} mb={2}>
              <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                Category
              </Text>
              <Text color={"text.600"}>{itemRef.current?.category}</Text>
            </Flex>
            <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
              Images
            </Text>
            <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2}>
              {itemRef.current?.images.map((img: any, index: any) => (
                <Image src={img} w={"200px"} maxH={"300px"} key={index} />
              ))}
            </Grid>
            <Flex direction={"column"} mt={2}>
              <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                Note
              </Text>
              <Text color={"text.600"}>{itemRef.current?.note || "N/A"}</Text>
            </Flex>
            <Flex direction={"column"} mt={2}>
              <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                Summary
              </Text>
              <Text color={"text.600"}>
                {itemRef.current?.summary || "N/A"}
              </Text>
            </Flex>
            <ButtonOutline onClick={onClose} mt={2}>
              Close
            </ButtonOutline>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isOpenForm}
        onClose={onCloseForm}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Images</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FileInput
              id="images"
              multiple
              accept=".png, .jpg, .jpeg"
              ref={imagesRef}
              inputError={inputError}
            />
          </ModalBody>
          <ModalFooter gap={2}>
            <ButtonPrimary onClick={() => addItem(true)}>
              Add Images
            </ButtonPrimary>
            <ButtonOutline onClick={() => addItem(false)}>Skip</ButtonOutline>
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
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete Item
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button
                borderRadius={"full"}
                ref={cancelRef}
                onClick={onCloseAlert}
              >
                Cancel
              </Button>
              <Button
                colorScheme="red"
                borderRadius={"full"}
                loadingText="Submitting"
                onClick={deleteItem}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default AddItemsPreviousReport;
