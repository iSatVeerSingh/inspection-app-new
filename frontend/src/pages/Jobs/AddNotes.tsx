import { useEffect, useRef, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import clientApi from "../../api/clientApi";
import { useParams } from "react-router-dom";
import Loading from "../../components/Loading";
import DataNotFound from "../../components/DataNotFound";
import { Box, Flex, Heading, Text, useToast } from "@chakra-ui/react";
import DatalistInput from "../../components/DatalistInput";
import ButtonPrimary from "../../components/ButtonPrimary";
import FormTextArea from "../../components/FormTextArea";

const AddNotes = () => {
  const { jobNumber } = useParams();
  const [allNotes, setAllNotes] = useState<any>([]);
  const toast = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const commonNoteRef = useRef<HTMLInputElement>(null);
  const customNoteRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    (async () => {
      let response = await clientApi.get("/notes");
      if (!response.success) {
        return;
      }
      const notesOnly = response.data.map((note: any) => note.text);
      setAllNotes(notesOnly);

      response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
      if (!response.success) {
        setLoading(false);
        return;
      }
      setJob(response.data);
      setLoading(false);
    })();
  }, []);

  const addInspectionNote = async (note: string) => {
    const response = await clientApi.post(`/jobs/note?jobNumber=${jobNumber}`, {
      note,
    });
    if (!response.success) {
      toast({
        title: response.data.message,
        duration: 4000,
        status: "error",
      });
      return;
    }
    toast({
      title: response.data.message,
      duration: 4000,
      status: "success",
    });
    commonNoteRef.current!.value = "";
    customNoteRef.current!.value = "";
  };

  const handleAddCommonNote = async () => {
    const note = commonNoteRef.current?.value.trim();
    if (note && note === "") {
      return;
    }
    await addInspectionNote(note!);
  };

  const handleAddCustomNote = async () => {
    const note = customNoteRef.current?.value.trim();
    if (note && note === "") {
      return;
    }
    await addInspectionNote(note!);
  };

  return (
    <PageLayout title="Add Notes">
      {loading ? (
        <Loading />
      ) : (
        <Card>
          {job ? (
            <>
              <Heading
                as="h2"
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight={"semibold"}
                color={"text.700"}
              >
                &#35;{job?.jobNumber} - {job?.category}
              </Heading>
              <Flex alignItems={"center"}>
                <Text fontSize={"lg"} color={"text.700"} minW={"200px"}>
                  Name On Report
                </Text>
                <Text color={"text.600"}>{job?.customer?.nameOnReport}</Text>
              </Flex>
              <Box mt={4}>
                <DatalistInput
                  label="Choose from a list of common notes"
                  dataList={allNotes}
                  ref={commonNoteRef}
                />
                <ButtonPrimary mt={2} w={"250px"} onClick={handleAddCommonNote}>
                  Add Note
                </ButtonPrimary>
              </Box>
              <Box mt={4} fontSize={"2xl"} textAlign={"center"}>
                OR
              </Box>
              <Box mt={4}>
                <Text color={"text.700"}>
                  If you have not found any relevant note in common list you can
                  custom note.
                </Text>
                <FormTextArea
                  ref={customNoteRef}
                  placeholder="type note here"
                />
                <ButtonPrimary mt={2} w={"250px"} onClick={handleAddCustomNote}>
                  Add Custom Note
                </ButtonPrimary>
              </Box>
            </>
          ) : (
            <DataNotFound />
          )}
        </Card>
      )}
    </PageLayout>
  );
};

export default AddNotes;
