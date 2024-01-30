import {
  Flex,
  Grid,
  Heading,
  IconButton,
  Text,
  useToast,
} from "@chakra-ui/react";
import PageLayout from "../../layout/PageLayout";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import clientApi from "../../api/clientApi";
import { DeleteIcon } from "../../icons";
import Card from "../../components/Card";
import Loading from "../../components/Loading";

const ViewNotes = () => {
  const { jobNumber } = useParams();
  const toast = useToast();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getJob = async () => {
    setLoading(true);
    const response = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
    if (!response.success) {
      return;
    }
    setJob(response.data);
    setLoading(false);
  };

  useEffect(() => {
    getJob();
  }, []);

  const deleteNote = async (note: string) => {
    const response = await clientApi.put(`/jobs/note?jobNumber=${jobNumber}`, {
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
    await getJob();
  };

  return (
    <PageLayout title="All Notes">
      {loading ? (
        <Loading />
      ) : (
        <>
          <Card>
            <Heading
              as="h2"
              fontSize={"2xl"}
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
          </Card>
          {job?.inspectionNotes && job.inspectionNotes.length !== 0 ? (
            <Grid gap={2} mt={3}>
              {job.inspectionNotes.map((note: any, index: any) => (
                <Flex
                  key={index}
                  p={2}
                  borderRadius={"xl"}
                  shadow={"xs"}
                  bg={"main-bg"}
                  alignItems={"center"}
                  justifyContent={"space-between"}
                >
                  <Text color={"text.700"}>{note}</Text>
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete Note"
                    onClick={() => deleteNote(note)}
                  />
                </Flex>
              ))}
            </Grid>
          ) : (
            <Card color={"text.700"} mt={2}>
              Couldn't find any notes
            </Card>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default ViewNotes;
