import { FormEventHandler, useEffect, useRef, useState } from "react";
import PageLayout from "../../layout/PageLayout";
import inspectionApi from "../../api/inspectionApi";
import Loading from "../../components/Loading";
import {
  Box,
  Flex,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
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
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from "@chakra-ui/react";
import DataNotFound from "../../components/DataNotFound";
import { MoreIcon } from "../../icons";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOuline from "../../components/ButtonOutline";
import FormTextArea from "../../components/FormTextArea";
import { useSearchParams } from "react-router-dom";

const Recommendations = () => {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [pages, setPages] = useState<any>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [initRecommendation, setInitRecommendation] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const [formErrors, setFormErrors] = useState<any>(null);
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const deleteRecommendationRef = useRef<any>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  const getRecommendations = async (url?: any) => {
    const { success, data } = await inspectionApi.get(
      url || "/recommendations"
    );
    if (!success) {
      setLoading(false);
      return;
    }
    setRecommendations(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  const updateSearch = (key: string, value: string, includePage?: boolean) => {
    if (value && value !== "") {
      setSearchParams((prev) => {
        const updatedParams = {
          ...Object.fromEntries(prev),
          [key]: value,
        };

        if (!includePage) {
          delete updatedParams.page;
        }

        return updatedParams;
      });
    }
  };

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0
        ? "/recommendations"
        : "/recommendations?" + searchParams.toString();
    getRecommendations(searchUrl);
  }, [searchParams]);

  const handleTitleBtn = () => {
    setIsEditing(false);
    setInitRecommendation(null);
    onOpen();
  };

  const handleEditRecommendationBtn = (item: any) => {
    setIsEditing(true);
    setInitRecommendation(item);
    onOpen();
  };

  const handleDeleteBtn = (id: any) => {
    deleteRecommendationRef.current = id;
    onOpenAlert();
  };

  const handleRecommendationForm: FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;

    const formdata = new FormData(target);
    const recommendation = {
      text: formdata.get("text")?.toString().trim(),
    };

    if (!recommendation.text || recommendation.text === "") {
      setFormErrors({ text: "Recommendation text is required" });
      return;
    }
    setFormErrors(null);

    setSaving(true);

    if (isEditing) {
      const { success, error, data } = await inspectionApi.put(
        `/recommendations/${initRecommendation?.id}`,
        recommendation
      );

      if (!success) {
        toast({
          title: error,
          status: "error",
          duration: 4000,
        });
        setSaving(false);
        return;
      }
      setSaving(false);
      toast({
        title: data.message,
        status: "success",
        duration: 4000,
      });
      onClose();
      await getRecommendations();
    } else {
      const { success, error, data } = await inspectionApi.post(
        "/recommendations",
        recommendation
      );

      if (!success) {
        toast({
          title: error,
          status: "error",
          duration: 4000,
        });
        setSaving(false);
        return;
      }
      setSaving(false);
      toast({
        title: data.message,
        status: "success",
        duration: 4000,
      });
      onClose();
      await getRecommendations();
    }
  };

  const deleteRecommendation = async () => {
    if (deleteRecommendationRef.current) {
      setSaving(true);
      const { success, error, data } = await inspectionApi.delete(
        `/recommendations/${deleteRecommendationRef.current}`
      );

      if (!success) {
        toast({
          title: error,
          status: "error",
          duration: 4000,
        });
        setSaving(false);
        return;
      }
      setSaving(false);
      toast({
        title: data.message,
        status: "success",
        duration: 4000,
      });
      onCloseAlert();
      await getRecommendations();
    }
  };

  return (
    <PageLayout
      title="Recommendations"
      isRoot
      btn="New Recommendation"
      onClick={handleTitleBtn}
    >
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {recommendations.length !== 0 ? (
            <Grid gap={2}>
              {recommendations.map((item: any) => (
                <Flex
                  key={item?.id}
                  alignItems={"center"}
                  bg={"main-bg"}
                  p="2"
                  borderRadius={"lg"}
                  shadow={"xs"}
                  justifyContent={"space-between"}
                  gap={2}
                >
                  <Box>
                    <Text>{item?.text}</Text>
                    <Text color={"text.500"}>
                      Last Updated: {item?.updated_at}
                    </Text>
                  </Box>
                  <Menu>
                    <MenuButton>
                      <MoreIcon />
                    </MenuButton>
                    <MenuList shadow={"lg"}>
                      <MenuItem
                        onClick={() => handleEditRecommendationBtn(item)}
                      >
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteBtn(item?.id)}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Flex>
              ))}
            </Grid>
          ) : (
            <DataNotFound />
          )}
        </Box>
      )}
      {pages && recommendations.length !== 0 && (
        <Flex mt={4} justifyContent={"space-between"} alignItems={"center"}>
          <Button
            borderRadius={"full"}
            isDisabled={pages.prev === null}
            onClick={() => updateSearch("page", pages.prev.toString(), true)}
          >
            Prev
          </Button>
          <Text>Current Page: {pages.current_page}</Text>
          <Button
            borderRadius={"full"}
            isDisabled={pages.next === null}
            onClick={() => updateSearch("page", pages.next.toString(), true)}
          >
            Next
          </Button>
        </Flex>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Recommendation" : "New Recommendation"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="recommendation_form" onSubmit={handleRecommendationForm}>
              <FormTextArea
                id="recommendation"
                name="text"
                placeholder="Type here"
                label="Recommendation"
                defaultValue={initRecommendation?.text}
                inputError={formErrors?.text}
              />
            </form>
          </ModalBody>
          <ModalFooter gap={2}>
            <ButtonPrimary
              isLoading={saving}
              loadingText="Submitting"
              type="submit"
              form="recommendation_form"
            >
              Submit
            </ButtonPrimary>
            <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
        closeOnOverlayClick={false}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete Recommendation
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
                onClick={deleteRecommendation}
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

export default Recommendations;

// const Recommendations = () => {
//   const [categories, setCategories] = useState<any[]>([]);
//   const [formErrors, setFormErrors] = useState<any>(null);

//   const getJobCategories = async () => {
//     setLoading(true);
//     const { success, data } = await inspectionApi.get("/job-categories");
//     if (!success) {
//       setLoading(false);
//     }
//     setCategories(data);
//     setLoading(false);
//   };

//   useEffect(() => {
//     getJobCategories();
//   }, []);

//   const handleTitleBtn = () => {
//     setIsEditing(false);
//     setInitRecommendation(null);
//     onOpen();
//   };

//   const handleJobCategoryForm: FormEventHandler<HTMLFormElement> = async (
//     e
//   ) => {
//     e.preventDefault();
//     const target = e.target as HTMLFormElement;
//     const formData = new FormData(target);
//     const categoryData: any = {
//       name: formData.get("name")?.toString().trim(),
//       type: formData.get("type")?.toString().trim().toUpperCase(),
//       stageOfWorks: formData.get("stageOfWorks")?.toString().trim(),
//     };

//     const errors: any = {};
//     if (!categoryData.name || categoryData.name === "") {
//       errors.name = "Name is required";
//     }
//     if (!categoryData.type || categoryData.type === "") {
//       errors.type = "Type is required";
//     }

//     if (!categoryData.stageOfWorks || categoryData.stageOfWorks === "") {
//       errors.stageOfWorks = "Stage of works is required";
//     }

//     if (Object.keys(errors).length !== 0) {
//       setFormErrors(errors);
//       return;
//     }

//     setFormErrors(null);
//     setSaving(true);

//     if (isEditing) {
//       const editCategory = getChangedValues(categoryData, initRecommendation);
//       const { success, data, error } = await inspectionApi.put(
//         `/job-categories/${initRecommendation.id}`,
//         editCategory
//       );
//       if (!success) {
//         toast({
//           title: error,
//           duration: 4000,
//           status: "error",
//         });
//         setSaving(false);
//         return;
//       }
//       toast({
//         title: data.message,
//         status: "success",
//         duration: 4000,
//       });
//       setSaving(false);
//       onClose();
//       await getJobCategories();
//     } else {
//       const { success, data, error } = await inspectionApi.post(
//         `/job-categories`,
//         categoryData
//       );
//       if (!success) {
//         toast({
//           title: error,
//           duration: 4000,
//           status: "error",
//         });
//         setSaving(false);
//         return;
//       }
//       toast({
//         title: data.message,
//         status: "success",
//         duration: 4000,
//       });
//       setSaving(false);
//       onClose();
//       await getJobCategories();
//     }
//   };

//   const handleEditBtn = (category: any) => {
//     setIsEditing(true);
//     setInitRecommendation(category);
//     onOpen();
//   };

//   const handleDeleteCategoryBtn = (id: string) => {
//     deleteCategoryRef.current = id;
//     onOpenAlert();
//   };

//   const deleteJobCategory = async () => {
//     if (deleteCategoryRef.current) {
//       setSaving(true);
//       const { success, data, error } = await inspectionApi.delete(
//         `/job-categories/${deleteCategoryRef.current}`
//       );
//       if (!success) {
//         toast({
//           title: error,
//           duration: 4000,
//           status: "error",
//         });
//         setSaving(false);
//         return;
//       }
//       toast({
//         title: data.message,
//         status: "success",
//         duration: 4000,
//       });
//       setSaving(false);
//       onCloseAlert();
//       await getJobCategories();
//     }
//   };

//   return (
//     <PageLayout
//       title="Recommendations"
//       btn="New Recommendation"
//       onClick={handleTitleBtn}
//       isRoot
//     >
//       {loading ? (
//         <Loading />
//       ) : (
//         <Box>
//           {categories.length !== 0 ? (
//             <Grid gap={2}>
//               {categories.map((category: any) => (
//                 <Flex
//                   alignItems={"center"}
//                   key={category.id}
//                   bg={"main-bg"}
//                   p="2"
//                   borderRadius={"lg"}
//                   shadow={"xs"}
//                   gap={3}
//                 >
//                   <Box flexGrow={1}>
//                     <Flex alignItems={"center"} justify={"space-between"}>
//                       <Text>{category?.name}</Text>
//                       <Text color={"text.500"}>
//                         Last Updated: {category?.updated_at}
//                       </Text>
//                     </Flex>
//                     <Text color={"text.600"}>
//                       Type: {category?.type || "N/A"}
//                     </Text>
//                     <Text color={"text.600"}>
//                       Stage Of Works: {category?.stageOfWorks || "N/A"}
//                     </Text>
//                   </Box>
//                   <Menu>
//                     <MenuButton>
//                       <MoreIcon />
//                     </MenuButton>
//                     <MenuList shadow={"lg"}>
//                       <MenuItem onClick={() => handleEditBtn(category)}>
//                         Edit
//                       </MenuItem>
//                       <MenuItem
//                         onClick={() => handleDeleteCategoryBtn(category.id)}
//                       >
//                         Delete
//                       </MenuItem>
//                     </MenuList>
//                   </Menu>
//                 </Flex>
//               ))}
//             </Grid>
//           ) : (
//             <DataNotFound />
//           )}
//         </Box>
//       )}

//     </PageLayout>
//   );
// };

// export default Recommendations;
