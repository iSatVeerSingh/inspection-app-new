import { useLocation, useParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import { useEffect, useState } from "react";
import { Item as ItemType } from "../../types";
import inspectionApi from "../../api/inspectionApi";
import Loading from "../../components/Loading";
import { Box, Flex, Grid, Image, Text } from "@chakra-ui/react";
import DataNotFound from "../../components/DataNotFound";
import { useGlobalContext } from "../../context/GlobalContext";
import ItemForm from "./ItemForm";

const Item = () => {
  const { id } = useParams();
  const { state } = useLocation();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ItemType | null>(null);

  const { user } = useGlobalContext();
  const { categories } = state;

  useEffect(() => {
    (async () => {
      const { success, data, error } = await inspectionApi.get(`/items/${id}`);
      if (!success) {
        setLoading(false);
        return;
      }
      setItem(data.data);
      setLoading(false);
    })();
  }, []);

  const getDom = (str: string) => {
    return <Box dangerouslySetInnerHTML={{ __html: str }} />;
  };

  return (
    <PageLayout title="Library Item">
      {loading ? (
        <Loading />
      ) : (
        <>
          {user.role === "Inspector" ? (
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
                      <Image src={item.embeddedImage} width={"300px"} />
                    </Flex>
                  )}
                </Grid>
              ) : (
                <DataNotFound />
              )}
            </Card>
          ) : (
            <ItemForm isEditing={true} categories={categories} item={item!} />
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Item;
