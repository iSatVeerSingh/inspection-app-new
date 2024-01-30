import { FormEventHandler, useEffect, useRef, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import clientApi from "../../api/clientApi";
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import {
  Flex,
  Heading,
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
} from "@chakra-ui/react";
import DatalistInput from "../../components/DatalistInput";
import FileInput from "../../components/FileInput";
import FormTextArea from "../../components/FormTextArea";
import ButtonPrimary from "../../components/ButtonPrimary";
import ButtonOuline from "../../components/ButtonOutline";
import { getResizedImagesBase64Main } from "../../utils/resizeimg";
import FormInput from "../../components/FormInput";

const AddItems = () => {
  const { jobNumber } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const categoryRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [filteredNames, setFilteredNames] = useState<any[]>([]);
  const [formErrors, setFormErrors] = useState<any>(null);
  const imagesRef = useRef<HTMLInputElement>(null);
  const parentRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const { onOpen, isOpen, onClose } = useDisclosure();

  useEffect(() => {
    (async () => {
      let response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (!response.success) {
        setLoading(false);
        return;
      }
      setJob(response.data);

      response = await clientApi.get("/categories");
      if (!response.success) {
        setLoading(false);
        return;
      }
      const allCategories = response.data.map((item: any) => item.name);
      setCategories(allCategories);

      response = await clientApi.get("/items-index");
      if (!response.success) {
        setLoading(false);
        return;
      }
      setItems(response.data);
      setLoading(false);
    })();
  }, []);

  const onCategorySelect = () => {
    const category = categoryRef.current?.value.trim();
    if (!category || category === "") {
      return;
    }

    const filteredItems = items
      .filter((item: any) => item.category === category)
      .map((item: any) => item.name);

    nameRef.current!.value = "";
    setFilteredNames(filteredItems);
    nameRef.current!.focus();
  };

  const onNameSelect = () => {
    imagesRef.current?.showPicker();
  };

  const handleItemForm: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formdata = new FormData(target);

    const itemData = {
      category: formdata.get("category")?.toString().trim(),
      name: formdata.get("name")?.toString().trim(),
      images: formdata.getAll("images") as unknown as FileList,
      note: formdata.get("note")?.toString().trim(),
    };

    const errors: any = {};
    if (!itemData.category || itemData.category === "") {
      errors.category = "Select a category";
    }

    if (!itemData.name || itemData.name === "") {
      errors.name = "Please select a name";
    }

    if (!itemData.images || itemData.images[0].size === 0) {
      errors.images = "Please select at least one images";
    }

    if (itemData.images.length > 8) {
      errors.images = "Max 8 images are allowed";
    }

    if (Object.entries(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(null);

    setSaving(true);

    const resizedImages = await getResizedImagesBase64Main(itemData.images);
    const libItem = items.find(
      (item: any) =>
        item.name === itemData.name && item.category === itemData.category
    );
    const inspectionItem: any = {
      id: crypto.randomUUID(),
      category: itemData.category,
      name: itemData.name,
      images: resizedImages,
      library_item_id: libItem.id,
      note: itemData.note,
      job_id: job.id,
      custom: 0,
      previousItem: 0,
    };

    parentRef.current!.innerHTML = "";
    const imgdiv = document.createElement("div");
    imgdiv.style.display = "grid";
    imgdiv.style.gap = "5pt";
    imgdiv.style.gridTemplateColumns = "1fr 1fr";

    for (let i = 0; i < resizedImages.length; i++) {
      let itemImg = resizedImages[i];
      const img = document.createElement("img");
      img.src = itemImg! as string;
      img.style.width = "220pt";
      img.style.height = "220pt";
      imgdiv.appendChild(img);
    }
    parentRef.current!.appendChild(imgdiv);

    if (inspectionItem.note && inspectionItem.note !== "") {
      const noteP = document.createElement("p");
      noteP.style.fontFamily = "Times, serif";
      noteP.style.fontSize = "11pt";
      noteP.textContent = inspectionItem.note;
      parentRef.current!.appendChild(noteP);
    }

    const height = Math.ceil(parentRef.current!.clientHeight * 0.75);

    inspectionItem.height = height;

    const { success, data, error } = await clientApi.post(
      "/jobs/inspection-items",
      inspectionItem
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
    categoryRef.current?.focus();
  };

  const handleCustomItemForm: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formdata = new FormData(target);

    const itemData = {
      name: formdata.get("name")?.toString().trim(),
      images: formdata.getAll("images") as unknown as FileList,
      openingParagraph: formdata.get("openingParagraph")?.toString().trim(),
      closingParagraph: formdata.get("closingParagraph")?.toString().trim(),
      embeddedImage: formdata.get("embeddedImage") as File,
      note: formdata.get("note")?.toString().trim(),
    };

    const errors: any = {};
    if (!itemData.name || itemData.name === "") {
      errors.name = "Name is required";
    }

    if (!itemData.images || itemData.images[0].size === 0) {
      errors.images = "Please select at least one images";
    }

    if (itemData.images.length > 8) {
      errors.images = "Max 8 images are allowed";
    }

    if (!itemData.openingParagraph || itemData.openingParagraph === "") {
      errors.openingParagraph = "Opening paragraph is required";
    }
    if (!itemData.closingParagraph || itemData.closingParagraph === "") {
      errors.closingParagraph = "Closing paragraph is required";
    }

    if (Object.entries(errors).length !== 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors(null);
    setSaving(true);

    const resizedImages = await getResizedImagesBase64Main(itemData.images);

    const inspectionItem: any = {
      id: crypto.randomUUID(),
      name: itemData.name,
      images: resizedImages,
      openingParagraph: itemData.openingParagraph,
      closingParagraph: itemData.closingParagraph,
      note: itemData.note,
      job_id: job.id,
      custom: 1,
      previousItem: 0,
    };

    if (itemData.embeddedImage && itemData.embeddedImage.size > 0) {
      const resizedEmbedded = await getResizedImagesBase64Main([
        itemData.embeddedImage,
      ]);
      inspectionItem.embeddedImage = resizedEmbedded[0];
    }

    parentRef.current!.innerHTML = "";
    parentRef.current!.style.fontFamily = "Times, serif";
    parentRef.current!.style.fontSize = "13pt";
    parentRef.current!.style.lineHeight = "1";
    parentRef.current!.style.width = "470pt";

    const namediv = document.createElement("p")!;
    namediv.textContent = inspectionItem.name!;
    namediv.style.fontWeight = "bold";
    parentRef.current!.appendChild(namediv);

    const openingDiv = document.createElement("div");
    openingDiv.innerHTML = inspectionItem.openingParagraph!;
    parentRef.current!.appendChild(openingDiv);

    const imgdiv = document.createElement("div");
    imgdiv.style.display = "grid";
    imgdiv.style.gap = "5pt";
    imgdiv.style.gridTemplateColumns = "1fr 1fr";

    for (let i = 0; i < resizedImages.length; i++) {
      let itemImg = resizedImages[i];
      const img = document.createElement("img");
      img.src = itemImg! as string;
      img.style.width = "220pt";
      img.style.height = "220pt";
      imgdiv.appendChild(img);
    }
    parentRef.current!.appendChild(imgdiv);

    const closingDiv = document.createElement("div");
    closingDiv.innerHTML = inspectionItem.closingParagraph!;
    parentRef.current!.appendChild(closingDiv);

    if (inspectionItem.embeddedImage) {
      const img = document.createElement("img");
      img.src = inspectionItem.embeddedImage! as string;
      img.style.width = "220pt";
      img.style.height = "220pt";
      parentRef.current!.appendChild(img);
    }

    if (inspectionItem.note && inspectionItem.note !== "") {
      const noteP = document.createElement("p");
      noteP.style.fontFamily = "Times, serif";
      noteP.style.fontSize = "11pt";
      noteP.textContent = inspectionItem.note;
      parentRef.current!.appendChild(noteP);
    }

    const height = Math.ceil(parentRef.current!.clientHeight * 0.75);
    inspectionItem.height = height;

    const { success, data, error } = await clientApi.post(
      "/jobs/inspection-items",
      inspectionItem
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
    onClose();
  };

  return (
    <PageLayout title="Add Items" btn="Add Custom Item" onClick={onOpen}>
      {loading ? (
        <Loading />
      ) : (
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

          <form id="inspection_item_form" onSubmit={handleItemForm}>
            <VStack>
              <DatalistInput
                dataList={categories}
                id="category"
                name="category"
                ref={categoryRef}
                autoFocus
                inputError={formErrors?.category}
                label="Category"
                onSelect={onCategorySelect}
                placeholder="Search here for category"
              />

              <DatalistInput
                dataList={filteredNames}
                id="name"
                name="name"
                ref={nameRef}
                inputError={formErrors?.name}
                onSelect={onNameSelect}
                label="Name"
                placeholder="Search here for name"
              />
              <FileInput
                ref={imagesRef}
                id="images"
                name="images"
                inputError={formErrors?.images}
                label="Images"
                subLabel="max 8"
                multiple
                accept=".jpg, .png, .jpeg"
              />
              <FormTextArea
                id="note"
                name="note"
                label="Note"
                subLabel="optional"
                placeholder="type note here"
              />
            </VStack>
          </form>
          <Flex gap={2} mt={2}>
            <ButtonPrimary
              minW={"150px"}
              type="submit"
              form="inspection_item_form"
              loadingText="Saving"
              isLoading={saving}
            >
              Add Item
            </ButtonPrimary>
            <ButtonOuline onClick={() => navigate(`/jobs/${jobNumber}`)}>
              Cancel
            </ButtonOuline>
          </Flex>
          <div
            style={{
              position: "absolute",
              zIndex: -2,
              top: -1000,
              left: 0,
              visibility: "hidden",
            }}
          >
            <div ref={parentRef} style={{ width: "470pt" }}></div>
          </div>
        </Card>
      )}

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={"2xl"}
        closeOnOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Custom Item</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleCustomItemForm} id="custom_item_form">
              <VStack>
                <FormInput
                  label="Name"
                  id="name"
                  name="name"
                  placeholder="type name here"
                  inputError={formErrors?.name}
                />
                <FileInput
                  label="Images"
                  subLabel="max 8"
                  id="images"
                  name="images"
                  multiple
                  accept=".jpeg, .jpg, .png"
                  inputError={formErrors?.images}
                />
                <FormTextArea
                  label="Opening Paragraph"
                  id="openingParagraph"
                  name="openingParagraph"
                  placeholder="type here"
                  inputError={formErrors?.openingParagraph}
                />
                <FileInput
                  label="Embedded Image"
                  subLabel="optional"
                  id="embeddedImage"
                  name="embeddedImage"
                  accept=".jpeg, .jpg, .png"
                />
                <FormTextArea
                  label="Closing Paragraph"
                  id="closingParagraph"
                  name="closingParagraph"
                  placeholder="type here"
                  inputError={formErrors?.closingParagraph}
                />
                <FormTextArea
                  label="Note"
                  id="note"
                  name="note"
                  subLabel="optional"
                  placeholder="type note here"
                />
              </VStack>
            </form>
          </ModalBody>
          <ModalFooter gap={3} justifyContent={"start"}>
            <ButtonPrimary
              form="custom_item_form"
              type="submit"
              w={"200px"}
              isLoading={saving}
              loadingText="Saving"
            >
              Add Item
            </ButtonPrimary>
            <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </PageLayout>
  );
};

export default AddItems;
