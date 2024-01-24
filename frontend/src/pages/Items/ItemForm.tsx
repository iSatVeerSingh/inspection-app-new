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
  Image,
  Text,
  VStack,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import Card from "../../components/Card";
import FileInput from "../../components/FileInput";
import FormInput from "../../components/FormInput";
import FormSelect from "../../components/FormSelect";
import { Item } from "../../types";
import InputBtn from "../../components/InputBtn";
import RichEditor from "../../components/RichEditor";
import { $insertNodes } from "lexical";
import { FormEventHandler, useEffect, useRef, useState } from "react";
import { $generateHtmlFromNodes, $generateNodesFromDOM } from "@lexical/html";
import ButtonPrimary from "../../components/ButtonPrimary";
import FormTextArea from "../../components/FormTextArea";
import { getResizedImagesBase64Main } from "../../utils/resizeimg";
import inspectionApi from "../../api/inspectionApi";
import { getChangedValues } from "../../utils/getChangedValues";
import { useNavigate } from "react-router-dom";
import { CLEAR_EDITOR_COMMAND, LexicalEditor } from "lexical";
import ButtonOuline from "../../components/ButtonOuline";

type ItemFormProps = {
  categories: any;
  item?: Item;
  isEditing?: boolean;
};

const ItemForm = ({ categories, item, isEditing }: ItemFormProps) => {
  const openingParagraphRef = useRef<LexicalEditor>(null);
  const closingParagraphRef = useRef<LexicalEditor>(null);
  const [imgRemoved, setImgRemoved] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<Item> | null>(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const parentRef = useRef<HTMLDivElement>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (isEditing && item) {
      if (openingParagraphRef.current) {
        openingParagraphRef.current.update(() => {
          const parser = new DOMParser();
          const openingDom = parser.parseFromString(
            item.openingParagraph,
            "text/html"
          );
          const openingNodes = $generateNodesFromDOM(
            openingParagraphRef.current!,
            openingDom
          );
          $insertNodes(openingNodes);
        });
      }
      if (closingParagraphRef.current) {
        closingParagraphRef.current.update(() => {
          const parser = new DOMParser();
          const closingDom = parser.parseFromString(
            item.closingParagraph,
            "text/html"
          );
          const closingNodes = $generateNodesFromDOM(
            closingParagraphRef.current!,
            closingDom
          );
          $insertNodes(closingNodes);
        });
      }
    }
  }, []);

  const onSubmitItemForm: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const itemFormData: Partial<Item> = {
      category_id: formData.get("category_id")?.toString().trim(),
      name: formData.get("name")?.toString().trim(),
      embeddedImages: formData.getAll("embeddedImages"),
      summary: formData.get("summary")?.toString().trim(),
      embeddedImagePlace: formData.get("embeddedImagePlace")?.toString().trim(),
    };

    let openingText = "";
    if (openingParagraphRef.current) {
      openingParagraphRef.current?.update(() => {
        openingText = $generateHtmlFromNodes(openingParagraphRef.current!);
      });
    }

    let closingText = "";
    if (closingParagraphRef.current) {
      closingParagraphRef.current.update(() => {
        closingText = $generateHtmlFromNodes(closingParagraphRef.current!);
      });
    }

    let filterOpening = openingText
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "")
      .replace(/<span[^>]*>/g, "")
      .replace(/<\/span>/g, "")
      .replace(/<br[^>]*>/g, "")
      .replace(/<\/br>/g, "")
      .trim();

    let filterClosing = closingText
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "")
      .replace(/<span[^>]*>/g, "")
      .replace(/<\/span>/g, "")
      .replace(/<br[^>]*>/g, "")
      .replace(/<\/br>/g, "")
      .trim();

    const errors: Partial<Item> = {};

    if (!itemFormData.category_id || itemFormData.category_id === "") {
      errors.category_id = "Please select a category";
    }

    if (!itemFormData.name || itemFormData.name === "") {
      errors.name = "Name is required";
    }

    if (filterOpening === "") {
      errors.openingParagraph = "Opening paragraph is required";
    }

    if (filterClosing === "") {
      errors.closingParagraph = "Closing paragraph is required";
    }

    if (!itemFormData.summary || itemFormData.summary === "") {
      errors.summary = "Summary is required";
    }

    if (Object.keys(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors(null);
    setSaving(true);

    const libItemData: Partial<Item> = {
      category_id: itemFormData.category_id,
      name: itemFormData.name,
      openingParagraph: openingText,
      closingParagraph: closingText,
      embeddedImages: imgRemoved ? null : item?.embeddedImages,
      summary: itemFormData.summary,
      embeddedImagePlace: itemFormData.embeddedImagePlace,
    };

    if (
      itemFormData.embeddedImages &&
      itemFormData.embeddedImages[0].size > 0
    ) {
      const resized = await getResizedImagesBase64Main(
        itemFormData.embeddedImages as unknown as FileList
      );
      libItemData.embeddedImages = resized;
    }

    parentRef.current!.innerHTML = "";
    parentRef.current!.style.fontFamily = "Times, serif";
    parentRef.current!.style.fontSize = "13pt";
    parentRef.current!.style.lineHeight = "1";
    parentRef.current!.style.width = "470pt";

    const namediv = document.createElement("p")!;
    namediv.textContent = libItemData.name!;
    namediv.style.fontWeight = "bold";
    parentRef.current!.appendChild(namediv);

    const openingDiv = document.createElement("div");
    openingDiv.innerHTML = libItemData.openingParagraph!;
    parentRef.current!.appendChild(openingDiv);

    if (
      libItemData.embeddedImages &&
      Array.isArray(libItemData.embeddedImages)
    ) {
      const imgdiv = document.createElement("div");
      imgdiv.style.display = "grid";
      imgdiv.style.gap = "5pt";
      imgdiv.style.gridTemplateColumns = "1fr 1fr";

      for (let i = 0; i < libItemData.embeddedImages.length; i++) {
        let embeddedImage = libItemData.embeddedImages[i];
        const img = document.createElement("img");
        img.src = embeddedImage! as string;
        img.style.width = "200pt";
        img.style.height = "220pt";
        imgdiv.appendChild(img);
      }

      parentRef.current!.appendChild(imgdiv);
    }

    const closingDiv = document.createElement("div");
    closingDiv.innerHTML = libItemData.closingParagraph!;
    parentRef.current!.appendChild(closingDiv);

    const height = Math.ceil(parentRef.current!.clientHeight * 0.75);
    libItemData.height = height;

    if (isEditing) {
      const editedItem = getChangedValues(libItemData, item);
      const { success, data, error } = await inspectionApi.put(
        `/items/${item?.id}`,
        editedItem
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
      target.reset();
      navigate(-1);
    } else {
      const { success, data, error } = await inspectionApi.post(
        `/items`,
        libItemData
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
      target.reset();
      openingParagraphRef.current!.dispatchCommand(
        CLEAR_EDITOR_COMMAND,
        undefined
      );
      closingParagraphRef.current!.dispatchCommand(
        CLEAR_EDITOR_COMMAND,
        undefined
      );
    }
  };

  const removeImg = () => {
    setImgRemoved(true);
  };

  const deleteItem = async () => {
    if (!isEditing) {
      return;
    }
    setDeleting(true);
    const { success, data, error } = await inspectionApi.delete(
      `/items/${item?.id}`
    );
    if (!success) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setDeleting(false);
      return;
    }

    toast({
      title: data.message,
      duration: 4000,
      status: "success",
    });
    setDeleting(false);
    navigate(-1);
  };

  return (
    <Card position={"relative"} zIndex={2}>
      <form onSubmit={onSubmitItemForm}>
        <VStack alignItems={"start"}>
          <FormSelect
            id="category"
            name="category_id"
            label="Category"
            options={categories}
            defaultValue={isEditing ? item?.category_id : ""}
            placeholder="Select a category"
            inputError={formErrors?.category_id}
          />
          <FormInput
            id="name"
            name="name"
            label="Name"
            placeholder="enter name"
            defaultValue={isEditing ? item?.name : ""}
            inputError={formErrors?.name}
          />
          {isEditing &&
            item?.embeddedImages &&
            Array.isArray(item.embeddedImages) &&
            !imgRemoved && (
              <Box>
                <Text>Embedded Image</Text>
                <Flex wrap={"wrap"} gap={2}>
                  {item.embeddedImages.map((img, index) => (
                    <Image src={img as string} key={index} width={"250px"} />
                  ))}
                </Flex>
                <InputBtn value={"Remove"} onClick={removeImg} />
              </Box>
            )}
          <FileInput
            id="embeddedImages"
            name="embeddedImages"
            multiple
            label={isEditing ? "New Embedded Images" : "Embedded Images"}
            accept=".jpg, .png, .jpeg"
          />
          <FormSelect
            id="embeddedImagePlace"
            name="embeddedImagePlace"
            options={[
              "Before Item Images",
              "Before Closing Paragraph",
              "After Closing Paragraph",
            ]}
            label="Embedded Image Position"
            defaultValue={"Before Closing Paragraph"}
          />
          <RichEditor
            ref={openingParagraphRef}
            label="Opening Paragraph"
            inputError={formErrors?.openingParagraph}
          />
          <RichEditor
            ref={closingParagraphRef}
            label="Closing Paragraph"
            inputError={formErrors?.closingParagraph}
          />
          <FormTextArea
            id="summary"
            name="summary"
            defaultValue={isEditing ? item?.summary : undefined}
            placeholder="type summary here"
            inputError={formErrors?.summary}
            label="Summary"
          />
        </VStack>
        <Flex mt={2} justifyContent={"space-between"}>
          <Flex gap={3}>
            <ButtonPrimary
              isLoading={saving}
              loadingText="Saving"
              type="submit"
            >
              Save
            </ButtonPrimary>
            <ButtonOuline onClick={() => navigate(-1)}>Cancel</ButtonOuline>
          </Flex>
          {isEditing && (
            <Button borderRadius={"full"} colorScheme="red" onClick={onOpen}>
              Delete
            </Button>
          )}
        </Flex>
      </form>
      <div
        style={{
          position: "absolute",
          zIndex: -2,
          top: -1000,
          left: 0,
          visibility: "hidden",
        }}
      >
        <div ref={parentRef}></div>
      </div>

      <AlertDialog
        isOpen={isOpen}
        onClose={onClose}
        closeOnOverlayClick={false}
        leastDestructiveRef={cancelRef}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Delete Item</AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={2}>
              <Button borderRadius={"full"} ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                borderRadius={"full"}
                colorScheme="red"
                onClick={deleteItem}
                isLoading={deleting}
                loadingText="Deleting"
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Card>
  );
};

export default ItemForm;
