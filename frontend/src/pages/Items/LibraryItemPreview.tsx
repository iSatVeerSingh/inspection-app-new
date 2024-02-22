import { useEffect, useState } from "react";
import PageLayout from "../../layout/PageLayout";
import { useParams } from "react-router-dom";
import clientApi from "../../api/clientApi";
import { Flex, Grid, Image, Text, useToast } from "@chakra-ui/react";
import Loading from "../../components/Loading";
import Card from "../../components/Card";
import DataNotFound from "../../components/DataNotFound";

const LibraryItemPreview = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<any>(null);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      const { success, data, error } = await clientApi.get(
        `/items-library?id=${id}`
      );
      if (!success) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        setLoading(false);
        return;
      }
      setItem(data);
      setLoading(false);
    })();
  }, []);

  return (
    <PageLayout title="Library Item Preview">
      {loading ? (
        <Loading />
      ) : (
        <Card>
          {item ? (
            <Grid gap={2}>
              <Flex alignItems={"center"} gap={3}>
                <Text fontSize={"lg"} w={"150px"}>
                  Name
                </Text>
                <Text
                  bg={"primary.50"}
                  px={3}
                  borderRadius={"lg"}
                  color={"text.600"}
                >
                  {item.name}
                </Text>
              </Flex>
              <Flex alignItems={"center"} gap={3}>
                <Text fontSize={"lg"} w={"150px"}>
                  Category
                </Text>
                <Text
                  bg={"primary.50"}
                  px={3}
                  borderRadius={"lg"}
                  color={"text.600"}
                >
                  {item.category}
                </Text>
              </Flex>
              <Flex direction={"column"}>
                <Text fontSize={"lg"} w={"150px"}>
                  Summary
                </Text>
                <Text
                  bg={"primary.50"}
                  px={3}
                  borderRadius={"lg"}
                  color={"text.600"}
                >
                  {item.summary}
                </Text>
              </Flex>
              {item.embeddedImage && (
                <Flex direction={"column"}>
                  <Text fontSize={"lg"} w={"150px"}>
                    Embedded Image
                  </Text>
                  <Image src={item.embeddedImage as string} width={"300px"} />
                </Flex>
              )}
            </Grid>
          ) : (
            <DataNotFound />
          )}
        </Card>
      )}
    </PageLayout>
  );
};

export default LibraryItemPreview;
