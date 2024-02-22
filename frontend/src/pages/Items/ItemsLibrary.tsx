import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import inspectionApi from "../../api/inspectionApi";
import { useEffect, useState } from "react";
import Loading from "../../components/Loading";
import { Box, Button, Flex, Grid, Text, useToast } from "@chakra-ui/react";
import FilterSelect from "../../components/FilterSelect";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";
import DataNotFound from "../../components/DataNotFound";
import clientApi from "../../api/clientApi";

const ItemsLibrary = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );
  const [pages, setPages] = useState<any>(null);
  const toast = useToast();

  const getAllItems = async (url: string) => {
    setLoading(true);
    const { success, data, error } = await clientApi.get(url);
    if (!success) {
      setLoading(false);
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      return;
    }
    setItems(data.data);
    setPages(data.pages);
    setLoading(false);
  };

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

  useEffect(() => {
    (async () => {
      const { success, data } = await clientApi.get("/categories");
      if (!success) {
        return;
      }
      const allCategories = data.map((item: any) => item.name);
      setCategories(allCategories);
    })();
  }, []);

  useEffect(() => {
    const searchUrl =
      searchParams.size === 0
        ? "/items-library"
        : "/items-library?" + searchParams.toString();
    getAllItems(searchUrl);
  }, [searchParams]);

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

  const titleBtn = () => {};

  return (
    <PageLayout
      title="Library Items"
      btn={"Suggest Item"}
      onClick={titleBtn}
      isRoot
    >
      <Flex gap={3} mb={3} alignItems={"center"}>
        <Text>Filter</Text>
        <FilterSelect
          value={searchParams.get("category") || ""}
          onChange={(e) => updateSearch("category", e.target.value)}
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
          {items.length !== 0 ? (
            <Grid gap={2}>
              {items.map((item: any) => (
                <Link to={"./" + item.id} key={item.id} state={{ categories }}>
                  <Card>
                    <Flex
                      alignItems={"center"}
                      justifyContent={"space-between"}
                    >
                      <Text
                        fontSize={"lg"}
                        fontWeight={"medium"}
                        color={"text.700"}
                      >
                        {item.name}
                      </Text>
                      <Text>Last Updated: {item.updated_at}</Text>
                    </Flex>
                    <Text
                      color={"text.600"}
                      bg={"primary.50"}
                      maxW={"max-content"}
                      px={4}
                      borderRadius={"md"}
                    >
                      {item.category}
                    </Text>
                    <Text color={"text.600"}>
                      <Text as="span" color={"text.700"} fontWeight={"bold"}>
                        Summary:
                      </Text>
                      {item.summary === "" ? "N/A" : item.summary}
                    </Text>
                  </Card>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound />
          )}
        </Box>
      )}
      {pages && items.length !== 0 && (
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
    </PageLayout>
  );
};

export default ItemsLibrary;
