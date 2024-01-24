import { useLocation, useParams } from "react-router-dom";
import PageLayout from "../../layout/PageLayout";
import { useEffect, useState } from "react";
import { Item as ItemType } from "../../types";
import inspectionApi from "../../api/inspectionApi";
import Loading from "../../components/Loading";
import { Text } from "@chakra-ui/react";
import { useGlobalContext } from "../../context/GlobalContext";
import ItemForm from "./ItemForm";

const LibraryItem = () => {
  const { user } = useGlobalContext();
  if (user.role === "Inspector") {
    return null;
  }
  const { id } = useParams();
  const { state } = useLocation();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<ItemType | null>(null);
  const [error, setError] = useState<any>(null);

  let categories = state.categories;

  useEffect(() => {
    (async () => {
      const { success, data, error } = await inspectionApi.get(`/items/${id}`);
      if (!success) {
        setError(error);
        setLoading(false);
        return;
      }
      setItem(data.data);
      setLoading(false);
    })();
  }, []);

  return (
    <PageLayout title="Library Item">
      {loading ? (
        <Loading />
      ) : (
        <>
          {item ? (
            <ItemForm isEditing={true} categories={categories} item={item!} />
          ) : (
            <Text>{error}</Text>
          )}
          {/* {user.role === "Inspector" ? (
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
                      <Image
                        src={item.embeddedImage as string}
                        width={"300px"}
                      />
                    </Flex>
                  )}
                </Grid>
              ) : (
                <DataNotFound />
              )}
            </Card>
          ) : ( */}

          {/* )} */}
        </>
      )}
    </PageLayout>
  );
};

export default LibraryItem;
