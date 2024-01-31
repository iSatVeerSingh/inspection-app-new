import { FormEventHandler, useEffect, useRef, useState } from "react";
import PageLayout from "../../layout/PageLayout";
import Loading from "../../components/Loading";
import inspectionApi from "../../api/inspectionApi";
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
import FilterSelect from "../../components/FilterSelect";
import { useSearchParams } from "react-router-dom";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import { useGlobalContext } from "../../context/GlobalContext";
import ButtonPrimary from "../../components/ButtonPrimary";
import FormSelect from "../../components/FormSelect";
import FormTextArea from "../../components/FormTextArea";
import ButtonOuline from "../../components/ButtonOutline";
import DataNotFound from "../../components/DataNotFound";
import { MoreIcon } from "../../icons";

const NotesLibrary = () => {
  const { user } = useGlobalContext();
  if (user.role === "Inspector") {
    return null;
  }
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );
  const deleteNoteRef = useRef<any>(null);
  const toast = useToast();
  const [saving, setSaving] = useState(false);

  const [formErrors, setFormErrors] = useState<any>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [pages, setPages] = useState<any>(null);
  const [initNote, setInitNote] = useState<any>(null);
  const getNotes = async (url: string = "/notes") => {
    setLoading(true);
    const { success, data } = await inspectionApi.get(url);
    if (!success) {
      setLoading(false);
      return;
    }
    setNotes(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const { success, data } = await inspectionApi.get(
        "/job-categories?nameonly=true"
      );
      if (!success) {
        return;
      }

      const allCategories = data.map((item: any) => ({
        text: item.name,
        value: item.id,
      }));
      setCategories(allCategories);
    })();
  }, []);

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0 ? "/notes" : "/notes?" + searchParams.toString();
    getNotes(searchUrl);
  }, [searchParams]);

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

  const searchByName = () => {
    if (searchValue === "") {
      return;
    }

    updateSearch("keyword", searchValue);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchValue("");
  };

  const handleTitleBtn = () => {
    setIsEditing(false);
    setInitNote(null);
    onOpen();
  };

  const handleNoteForm: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formdata = new FormData(target);
    const noteData: any = {
      category_id: formdata.get("category_id")?.toString().trim(),
      text: formdata.get("text")?.toString().trim(),
    };

    const errors: any = {};

    if (!noteData.category_id || noteData.category_id === "") {
      errors.category_id = "Category is required";
    }
    if (!noteData.text || noteData.text === "") {
      errors.text = "Note text is required";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors(null);
    setSaving(true);

    if (isEditing) {
      const { success, data, error } = await inspectionApi.put(
        `/notes/${initNote?.id}`,
        noteData
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
      target.reset();
      onClose();
      await getNotes();
    } else {
      const { success, data, error } = await inspectionApi.post(
        "/notes",
        noteData
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
      target.reset();
      onClose();
      await getNotes();
    }
  };

  const handleEditNoteBtn = (note: any) => {
    setIsEditing(true);
    setInitNote(note);
    onOpen();
  };

  const handleDeleteNoteBtn = (id: string) => {
    deleteNoteRef.current = id;
    onOpenAlert();
  };

  const deleteNote = async () => {
    setSaving(true);
    if (deleteNoteRef.current) {
      const { success, data, error } = await inspectionApi.delete(
        `/notes/${deleteNoteRef.current}`
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
      await getNotes();
    }
  };

  return (
    <PageLayout title="Notes" isRoot btn="Create Note" onClick={handleTitleBtn}>
      <Flex gap={3} mb={3} alignItems={"center"}>
        <Text>Filter</Text>
        <FilterSelect
          value={searchParams.get("category_id") || ""}
          onChange={(e) => updateSearch("category_id", e.target.value)}
          placeholder="Select a category"
          options={categories}
          maxW={"300px"}
        />
        <FilterInput
          placeholder="Search by name"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
        <InputBtn value="Search" onClick={searchByName} />
        <InputBtn value="Clear" onClick={clearSearch} />
      </Flex>
      {loading ? (
        <Loading />
      ) : (
        <Box>
          {notes.length !== 0 ? (
            <Grid gap={2}>
              {notes.map((note: any) => (
                <Flex
                  key={note?.id}
                  alignItems={"center"}
                  bg={"main-bg"}
                  p="2"
                  borderRadius={"lg"}
                  shadow={"xs"}
                  justifyContent={"space-between"}
                  gap={2}
                >
                  <Box flexGrow={1}>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Text
                        color={"text.600"}
                        bg={"primary.50"}
                        maxW={"max-content"}
                        px={3}
                        borderRadius={"md"}
                      >
                        {note?.category}
                      </Text>
                      <Text color={"text.500"}>
                        Last Updated: {note?.updated_at}
                      </Text>
                    </Flex>
                    <Text mt={2}>{note?.text}</Text>
                  </Box>
                  <Menu>
                    <MenuButton>
                      <MoreIcon />
                    </MenuButton>
                    <MenuList shadow={"lg"}>
                      <MenuItem onClick={() => handleEditNoteBtn(note)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteNoteBtn(note?.id)}>
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
      {pages && notes.length !== 0 && (
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
            {isEditing ? "Edit Note" : "Create New Note"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="note_form" onSubmit={handleNoteForm}>
              <FormSelect
                id="category_id"
                name="category_id"
                options={categories}
                placeholder="Select a category"
                label="Category"
                inputError={formErrors?.category_id}
                defaultValue={initNote?.category_id}
              />
              <FormTextArea
                id="text"
                name="text"
                placeholder="Note text"
                label="Note Text"
                inputError={formErrors?.text}
                defaultValue={initNote?.text}
              />
            </form>
          </ModalBody>
          <ModalFooter gap={3}>
            <ButtonPrimary
              type="submit"
              form="note_form"
              isLoading={saving}
              loadingText="Submitting"
            >
              {isEditing ? "Update" : "Create"}
            </ButtonPrimary>
            <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
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
              Delete Note
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
                onClick={deleteNote}
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

export default NotesLibrary;
