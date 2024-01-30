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
  VStack,
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
import FormInput from "../../components/FormInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOuline from "../../components/ButtonOutline";
import FormTextArea from "../../components/FormTextArea";
import { getChangedValues } from "../../utils/getChangedValues";

const JobCategories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formErrors, setFormErrors] = useState<any>(null);
  const [initCategory, setInitCategory] = useState<any>(null);
  const toast = useToast();
  const deleteCategoryRef = useRef<any>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  const [saving, setSaving] = useState(false);
  const getJobCategories = async () => {
    setLoading(true);
    const { success, data } = await inspectionApi.get("/job-categories");
    if (!success) {
      setLoading(false);
    }
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    getJobCategories();
  }, []);

  const handleTitleBtn = () => {
    setIsEditing(false);
    setInitCategory(null);
    onOpen();
  };

  const handleJobCategoryForm: FormEventHandler<HTMLFormElement> = async (
    e
  ) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const categoryData: any = {
      name: formData.get("name")?.toString().trim(),
      type: formData.get("type")?.toString().trim().toUpperCase(),
      stageOfWorks: formData.get("stageOfWorks")?.toString().trim(),
    };

    const errors: any = {};
    if (!categoryData.name || categoryData.name === "") {
      errors.name = "Name is required";
    }
    if (!categoryData.type || categoryData.type === "") {
      errors.type = "Type is required";
    }

    if (!categoryData.stageOfWorks || categoryData.stageOfWorks === "") {
      errors.stageOfWorks = "Stage of works is required";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors(null);
    setSaving(true);

    if (isEditing) {
      const editCategory = getChangedValues(categoryData, initCategory);
      const { success, data, error } = await inspectionApi.put(
        `/job-categories/${initCategory.id}`,
        editCategory
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
        status: "success",
        duration: 4000,
      });
      setSaving(false);
      onClose();
      await getJobCategories();
    } else {
      const { success, data, error } = await inspectionApi.post(
        `/job-categories`,
        categoryData
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
        status: "success",
        duration: 4000,
      });
      setSaving(false);
      onClose();
      await getJobCategories();
    }
  };

  const handleEditBtn = (category: any) => {
    setIsEditing(true);
    setInitCategory(category);
    onOpen();
  };

  const handleDeleteCategoryBtn = (id: string) => {
    deleteCategoryRef.current = id;
    onOpenAlert();
  };

  const deleteJobCategory = async () => {
    if (deleteCategoryRef.current) {
      setSaving(true);
      const { success, data, error } = await inspectionApi.delete(
        `/job-categories/${deleteCategoryRef.current}`
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
        status: "success",
        duration: 4000,
      });
      setSaving(false);
      onCloseAlert();
      await getJobCategories();
    }
  };

  return (
    <PageLayout
      title="Job Categories"
      btn="New Job Category"
      onClick={handleTitleBtn}
      isRoot
    >
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {categories.length !== 0 ? (
            <Grid gap={2}>
              {categories.map((category: any) => (
                <Flex
                  alignItems={"center"}
                  key={category.id}
                  bg={"main-bg"}
                  p="2"
                  borderRadius={"lg"}
                  shadow={"xs"}
                  gap={3}
                >
                  <Box flexGrow={1}>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text>{category?.name}</Text>
                      <Text color={"text.500"}>
                        Last Updated: {category?.updated_at}
                      </Text>
                    </Flex>
                    <Text color={"text.600"}>
                      Type: {category?.type || "N/A"}
                    </Text>
                    <Text color={"text.600"}>
                      Stage Of Works: {category?.stageOfWorks || "N/A"}
                    </Text>
                  </Box>
                  <Menu>
                    <MenuButton>
                      <MoreIcon />
                    </MenuButton>
                    <MenuList shadow={"lg"}>
                      <MenuItem onClick={() => handleEditBtn(category)}>
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => handleDeleteCategoryBtn(category.id)}
                      >
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

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        size={"lg"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {isEditing ? "Edit Job Category" : "New Job Category"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="job_category_form" onSubmit={handleJobCategoryForm}>
              <VStack>
                <FormInput
                  id="name"
                  name="name"
                  placeholder="Category name"
                  label="Name"
                  defaultValue={initCategory?.name}
                  inputError={formErrors?.name}
                />
                <FormInput
                  id="type"
                  name="type"
                  placeholder="Category type"
                  label="Type"
                  defaultValue={initCategory?.type}
                  inputError={formErrors?.type}
                />
                <FormTextArea
                  id="stageOfWorks"
                  name="stageOfWorks"
                  placeholder="Stage of works"
                  label="Stage Of Works"
                  defaultValue={initCategory?.stageOfWorks}
                  inputError={formErrors?.stageOfWorks}
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={2}>
            <ButtonPrimary
              isLoading={saving}
              loadingText="Submitting"
              type="submit"
              form="job_category_form"
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
              Delete Job Category
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
                onClick={deleteJobCategory}
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

export default JobCategories;
