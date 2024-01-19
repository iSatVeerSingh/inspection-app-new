import { useEffect, useRef, useState } from "react";
import Loading from "../../components/Loading";
import PageLayout from "../../layout/PageLayout";
import inspectionApi from "../../api/inspectionApi";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  AlertDialogBody,
  AlertDialogFooter,
  Box,
  Flex,
  Grid,
  IconButton,
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
} from "@chakra-ui/react";
import { MoreIcon } from "../../icons";
import FormInput from "../../components/FormInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOuline from "../../components/ButtonOuline";

const Categories = () => {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const [initCategory, setInitCategory] = useState<any>(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const deleteCategoryRef = useRef<any>();
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const getCategories = async () => {
    const { success, data, error } = await inspectionApi.get(
      "/item-categories"
    );
    if (!success) {
      setLoading(false);
      return;
    }
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleNewCategoryBtn = () => {
    setIsEditing(false);
    onOpen();
  };

  const handleEditCategoryBtn = (category: any) => {
    setIsEditing(true);
    setInitCategory(category);
    onOpen();
  };

  function handleDeleteCategoryBtn(id: string): void {
    deleteCategoryRef.current = id;
    onOpenAlert();
  }

  const deleteCategory = async () => {
    setSaving(true);
    if (deleteCategoryRef.current) {
      const { success, data, error } = await inspectionApi.delete(
        `/item-categories/${deleteCategoryRef.current}`
      );
      if (!success) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        setSaving(false);
        onCloseAlert();
        return;
      }
      toast({
        title: data.message,
        duration: 4000,
        status: "success",
      });
      setSaving(false);
      onCloseAlert();
      await getCategories();
    }
  };

  const handleSubmit = async () => {
    const name = categoryRef.current?.value.trim();
    if (!name || name === "") {
      return;
    }

    setSaving(true);
    if (!isEditing) {
      const { success, data, error } = await inspectionApi.post(
        "/item-categories",
        {
          name,
        }
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
      await getCategories();
      onClose();
    } else {
      const { success, data, error } = await inspectionApi.put(
        `/item-categories/${initCategory?.id}`,
        {
          name,
        }
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
      await getCategories();
      onClose();
    }
  };

  return (
    <PageLayout
      title="Item Categories"
      btn="New Category"
      onClick={handleNewCategoryBtn}
      isRoot
    >
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {categories.length !== 0 ? (
            <Grid gap={2} gridTemplateColumns={"repeat(2, 1fr)"}>
              {categories.map((category) => (
                <Flex
                  alignItems={"center"}
                  key={category.id}
                  bg={"main-bg"}
                  p="2"
                  borderRadius={"lg"}
                  shadow={"xs"}
                >
                  <Box flexGrow={1}>
                    <Text fontSize={"lg"} color={"text.700"}>
                      Name: {category.name}
                    </Text>
                    <Text color={"text.500"}>Items: {category.items}</Text>
                  </Box>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      variant={"simple"}
                      icon={<MoreIcon />}
                    />
                    <MenuList>
                      <MenuItem onClick={() => handleEditCategoryBtn(category)}>
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
            "Coudn't find any categories"
          )}
        </Box>
      )}

      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create Item Category</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormInput
              defaultValue={initCategory?.name}
              name="category"
              type="text"
              id="category"
              ref={categoryRef}
              placeholder="category name"
            />
            <ModalFooter gap={3}>
              <ButtonPrimary
                onClick={handleSubmit}
                isLoading={saving}
                loadingText="Submitting"
              >
                Submit
              </ButtonPrimary>
              <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
            </ModalFooter>
          </ModalBody>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete Category
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <ButtonOuline ref={cancelRef} onClick={onCloseAlert}>
                Cancel
              </ButtonOuline>
              <ButtonPrimary
                isLoading={saving}
                loadingText="Submitting"
                onClick={deleteCategory}
              >
                Delete
              </ButtonPrimary>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default Categories;
