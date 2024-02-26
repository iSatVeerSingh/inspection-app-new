import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import { useEffect, useRef, useState } from "react";
import clientApi from "../../api/clientApi";
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";
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
  Image,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

const ItemPreview = () => {
  const { jobNumber, id } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [inspectionItem, setInspectionItem] = useState<any>(null);
  const toast = useToast();
  const navigate = useNavigate();

  const cancelRef = useRef<HTMLButtonElement>(null);
  const [saving, setSaving] = useState(false);

  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (!response.success) {
        setLoading(false);
        return;
      }
      setJob(response.data);

      response = await clientApi.get(`/jobs/inspection-items?id=${id}`);
      if (!response.success) {
        setLoading(false);
        return;
      }
      setInspectionItem(response.data);
      setLoading(false);
    })();
  }, []);

  const handleDeleteBtn = () => {
    onOpenAlert();
  };

  const deleteItem = async () => {
    setSaving(true);
    const { success, data, error } = await clientApi.delete(
      `/jobs/inspection-items?id=${id}`
    );
    if (!success) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setSaving(false);
      return;
    }

    toast({
      title: data.message,
      duration: 4000,
      status: "success",
    });
    setSaving(false);
    onCloseAlert();
    navigate(-1);
  };

  return (
    <PageLayout title="Item Preview">
      {loading ? (
        <Loading />
      ) : (
        <>
          {inspectionItem ? (
            <Card>
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight={"semibold"}
                color={"text.700"}
              >
                &#35;{job?.jobNumber} - {job?.category}
              </Heading>
              <Flex alignItems={"center"} mb={2}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Item Name
                </Text>
                <Text color={"text.600"}>{inspectionItem?.name}</Text>
              </Flex>
              <Flex alignItems={"center"} mb={2}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Category
                </Text>
                <Text color={"text.600"}>{inspectionItem?.category}</Text>
              </Flex>
              {inspectionItem.images && inspectionItem.images.length !== 0 && (
                <>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    New Images
                  </Text>
                  <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2} maxW={"700px"}>
                    {inspectionItem.images.map((img: any, index: any) => (
                      <Image src={img} w={"200px"} maxH={"300px"} key={index} />
                    ))}
                  </Grid>
                </>
              )}
              {inspectionItem.previousItemImages && (
                <>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Previous Images
                  </Text>
                  <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2}>
                    {inspectionItem.previousItemImages.map(
                      (img: any, index: any) => (
                        <Image
                          src={img}
                          w={"200px"}
                          maxH={"300px"}
                          key={index}
                        />
                      )
                    )}
                  </Grid>
                </>
              )}
              <Flex direction={"column"} mt={2}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Summary
                </Text>
                <Text color={"text.600"}>
                  {inspectionItem?.summary || "N/A"}
                </Text>
              </Flex>
              {inspectionItem.embeddedImages && (
                <>
                  <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                    Embedded Images
                  </Text>
                  <Grid gridTemplateColumns={"1fr 1fr 1fr"} gap={2}>
                    {inspectionItem.embeddedImages.map(
                      (img: any, index: any) => (
                        <Image
                          src={img}
                          maxW={"300px"}
                          maxH={"300px"}
                          key={index}
                        />
                      )
                    )}
                  </Grid>
                </>
              )}
              <Box mt={3}>
                <Button
                  colorScheme="red"
                  borderRadius={"full"}
                  onClick={handleDeleteBtn}
                >
                  Delete
                </Button>
              </Box>
            </Card>
          ) : (
            <DataNotFound />
          )}
        </>
      )}

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
                isLoading={saving}
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

export default ItemPreview;
