import { Box, Flex, Image, Text, VStack, useToast } from "@chakra-ui/react";
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
      embeddedImage: formData.get("embeddedImage") as File,
      summary: formData.get("summary")?.toString().trim(),
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
      embeddedImage: imgRemoved ? null : item?.embeddedImage,
      summary: itemFormData.summary,
    };

    if (
      itemFormData.embeddedImage &&
      (itemFormData.embeddedImage as File).size > 0
    ) {
      const resized = await getResizedImagesBase64Main([
        itemFormData.embeddedImage as File,
      ]);
      libItemData.embeddedImage = resized[0];
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

    if (libItemData.embeddedImage) {
      const img = document.createElement("img");
      img.src = libItemData.embeddedImage! as string;
      img.style.height = "220pt";
      parentRef.current!.appendChild(img);
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
          {isEditing && item?.embeddedImage && !imgRemoved && (
            <Box>
              <Text>Embedded Image</Text>
              <Image src={item.embeddedImage as string} width={"300px"} />
              <InputBtn value={"Remove"} onClick={removeImg} />
            </Box>
          )}
          <FileInput
            id="embeddedImage"
            name="embeddedImage"
            label={isEditing ? "New Embedded Image" : "Embedded Image"}
            accept=".jpg, .png, .jpeg"
            inputError=""
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
        <Flex mt={2}>
          <ButtonPrimary isLoading={saving} loadingText="Saving" type="submit">
            Save
          </ButtonPrimary>
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
    </Card>
  );
};

export default ItemForm;
