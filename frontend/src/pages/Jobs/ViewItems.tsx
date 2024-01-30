import { useEffect, useState } from "react";
import Card from "../../components/Card";
import PageLayout from "../../layout/PageLayout";
import clientApi from "../../api/clientApi";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Loading from "../../components/Loading";
import { Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
import DataNotFound from "../../components/DataNotFound";
import FilterSelect from "../../components/FilterSelect";
import FilterInput from "../../components/FilterInput";
import InputBtn from "../../components/InputBtn";

const ViewItems = () => {
  const { jobNumber } = useParams();
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [pages, setPages] = useState<any>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get("keyword") || ""
  );
  const [categories, setCategories] = useState<any[]>([]);

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
      // setLoading(false);
    })();
  }, []);

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

  const getInspectionItems = async (url: string) => {
    setLoading(true);
    const { success, data } = await clientApi.get(url);
    if (!success) {
      setLoading(false);
      return;
    }
    setItems(data.data);
    setPages(data.pages);
    setLoading(false);
  };

  useEffect(() => {
    const baseurl = `/jobs/inspection-items?jobNumber=${jobNumber}`;
    const searchUrl =
      searchParams.size === 0
        ? baseurl
        : baseurl + "&" + searchParams.toString();
    getInspectionItems(searchUrl);
  }, [searchParams]);

  const searchByName = () => {
    if (searchValue === "") {
      return;
    }

    updateSearch("name", searchValue);
  };

  const clearSearch = () => {
    setSearchParams({});
    setSearchValue("");
  };

  return (
    <PageLayout title="View Items" backPage={"/jobs/" + jobNumber}>
      {loading ? (
        <Loading />
      ) : (
        <>
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
          </Card>
          <Flex gap={3} mb={3} alignItems={"center"} mt={2}>
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
          {items.length !== 0 ? (
            <Grid gap={2} mt={2}>
              {items.map((item: any) => (
                <Link to={"./" + item?.id} key={item?.id}>
                  <Card>
                    <Flex alignItems={"center"} justify={"space-between"}>
                      <Text fontSize={"lg"} color={"text.700"}>
                        {item?.name}
                      </Text>
                      <Text color={"text.500"}>
                        Images: {item?.images?.length}
                      </Text>
                    </Flex>
                    <Text
                      bg={"primary.50"}
                      px={3}
                      borderRadius={"md"}
                      maxW={"max-content"}
                    >
                      {item?.category}
                    </Text>
                    <Text color={"text.600"} mt={1}>
                      Note:{" "}
                      {item?.note && item?.note !== "" ? item.note : "N/A"}
                    </Text>
                  </Card>
                </Link>
              ))}
            </Grid>
          ) : (
            <DataNotFound />
          )}
        </>
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

export default ViewItems; // import { useEffect, useState } from "react";
// import PageLayout from "../../layout/PageLayout";
// import Card from "../../components/Card";
// import clientApi from "../../api/clientApi";
// import { Link, useParams, useSearchParams } from "react-router-dom";
// import Loading from "../../components/Loading";
// import { Box, Button, Flex, Grid, Heading, Text } from "@chakra-ui/react";
// import FilterSelect from "../../components/FilterSelect";
// import ButtonOutline from "../../components/ButtonOutline";

// const ViewAddedItems = () => {
//   const { jobNumber } = useParams();
//   const [loading, setLoading] = useState(true);
//   const [job, setJob] = useState<any>(null);
//   const [inspectionItems, setInspectionItems] = useState<any[]>([]);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [libraryItemCategories, setLibraryItemCategories] = useState<string[]>(
//     []
//   );
//   const [pages, setPages] = useState<{ pages: number; currentPage: number }>();

//   useEffect(() => {
//     (async () => {
//       const jobresponse = await clientApi.get(`/jobs?jobNumber=${jobNumber}`);
//       if (jobresponse.status !== 200) {
//         return;
//       }
//       setJob(jobresponse.data);
//       const response = await clientApi.get("/library-item-categories");
//       if (response.status !== 200) {
//         return;
//       }
//       const allCategories = await response.data.map(
//         (category: any) => category.name
//       );
//       setLibraryItemCategories(allCategories);
//     })();
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoading(true);
//       const searchUrl =
//         searchParams.size === 0
//           ? `/jobs/inspection-items?jobNumber=${jobNumber}`
//           : `/jobs/inspection-items?jobNumber=${jobNumber}&${searchParams.toString()}`;
//       const response = await clientApi.get(searchUrl);

//       if (response.status !== 200) {
//         setLoading(false);
//         return;
//       }
//       setInspectionItems(response.data.items);
//       setPages({
//         pages: response.data.pages,
//         currentPage: response.data.currentPage,
//       });
//       setLoading(false);
//     })();
//   }, [searchParams]);

//   const updateSearch = (key: any, value: string) => {
//     if (value && value !== "") {
//       console.log(key, value);
//       setSearchParams((prev) => ({
//         ...Object.fromEntries(prev),
//         [key]: value,
//       }));
//     }
//   };

//   const clearFilter = () => {
//     setSearchParams({});
//   };

//   return (
//     <PageLayout title="All Added Items" backPage={`/jobs/${jobNumber}`}>
//       {loading ? (
//         <Loading />
//       ) : (
//         <>
//           <Card>
//             <Heading
//               as="h2"
//               fontSize={"2xl"}
//               fontWeight={"semibold"}
//               color={"text.700"}
//             >
//               &#35;{job?.jobNumber} - {job?.category}
//             </Heading>
//             <Grid gap={2} mt={2}>
//               <MiniDetail property="Category" value={job?.category!} />
//               <MiniDetail
//                 property="Customer"
//                 value={job?.customer!.nameOnReport!}
//               />
//               <MiniDetail property="Site Address" value={job?.siteAddress!} />
//             </Grid>
//           </Card>
//           <Flex alignItems="center" gap={2} mt={2}>
//             <Flex gap={3} alignItems={"center"}>
//               <Text>Filter</Text>
//               <FilterSelect
//                 options={["Custom", ...libraryItemCategories]}
//                 value={searchParams.get("category") || ""}
//                 placeholder="Select a category"
//                 onChange={(e) => updateSearch("category", e.target.value)}
//               />
//             </Flex>
//             <ButtonOutline size={"sm"} onClick={clearFilter}>
//               Clear
//             </ButtonOutline>
//           </Flex>
//           {inspectionItems.length === 0 ? (
//             <Card mt={3}>Couldn't find any items</Card>
//           ) : (
//             <>
//               <Grid mt={3} gap={2}>
//                 {inspectionItems.map((item) => (
//                   <Link to={"./" + item.uuid} key={item.uuid} state={job}>
//                     <Box bg={"main-bg"} p={3} borderRadius={"xl"} shadow={"xs"}>
//                       <Flex
//                         alignItems={"center"}
//                         justifyContent={"space-between"}
//                       >
//                         <Text
//                           fontSize={"xl"}
//                           fontWeight={"medium"}
//                           color={"text.700"}
//                         >
//                           {item.category || "Custom Item"}:- {item.name}
//                         </Text>
//                         <Text>Images:- {item.images?.length}</Text>
//                       </Flex>
//                       <Text>
//                         Note:-
//                         <Text as="span" color={"text.500"}>
//                           {item.note || "N/A"}
//                         </Text>
//                       </Text>
//                     </Box>
//                   </Link>
//                 ))}
//               </Grid>
//               {pages && inspectionItems.length !== 0 && (
//                 <Flex
//                   mt={4}
//                   justifyContent={"space-between"}
//                   alignItems={"center"}
//                 >
//                   <Button
//                     isDisabled={pages.currentPage <= 1}
//                     onClick={() =>
//                       updateSearch("page", (pages.currentPage - 1).toString())
//                     }
//                   >
//                     Prev
//                   </Button>
//                   <Text>Current Page: {pages.currentPage}</Text>
//                   <Button
//                     isDisabled={pages.currentPage >= pages.pages}
//                     onClick={() =>
//                       updateSearch("page", (pages.currentPage + 1).toString())
//                     }
//                   >
//                     Next
//                   </Button>
//                 </Flex>
//               )}
//             </>
//           )}
//         </>
//       )}
//     </PageLayout>
//   );
// };

// export default ViewAddedItems;

// // import { Box, Flex, Heading, Text, Grid } from "@chakra-ui/react";
// // import PageLayout from "../../Layout/PageLayout";
// // import { Link, useParams } from "react-router-dom";
// // import { useContext, useEffect, useState } from "react";
// // import clientApi from "../../services/clientApi";
// // import Loading from "../../components/Loading";
// // import { InspectionItemContext } from "../../Layout/InspectionItemLayout";

// // const AllAddedItems = () => {
// //   const params = useParams();
// //   const [loading, setLoading] = useState(true);
// //   const { inspection, setInspection } = useContext(InspectionItemContext);

// //   useEffect(() => {
// //     const getInspection = async () => {
// //       const response = await clientApi.get(
// //         `/inspections?inspectionId=${params.inspectionId}`
// //       );

// //       if (response.status !== 200) {
// //         setLoading(false);
// //         return;
// //       }

// //       setInspection(response.data);
// //       setLoading(false);
// //     };

// //     getInspection();
// //   }, []);

// //   return (
// //     <PageLayout title="Newly added items">
// //       {loading ? (
// //         <Loading />
// //       ) : (
// //         <Box>
// //           <Box>
// //             <Heading
// //               fontSize={{ base: "lg", sm: "xl", md: "2xl" }}
// //               fontWeight={"medium"}
// //               color={"rich-black"}
// //             >
// //               &#35;{inspection?.jobNumber} - {inspection?.jobType}
// //             </Heading>
// //             <Text fontSize={"lg"} color={"dark-gray"}>
// //               {inspection?.siteAddress}
// //             </Text>
// //           </Box>
// //           {inspection?.inspectionItems &&
// //           inspection.inspectionItems.length !== 0 ? (
// //             <Grid mt={4} gap={2}>
// //               {inspection.inspectionItems.map((item) => (
// //                 <Link to={"./" + item.id} key={item.id}>
// //                   <Box bg={"main-bg"} p={2} borderRadius={5}>
// //                     <Flex
// //                       alignItems={"center"}
// //                       justifyContent={"space-between"}
// //                       w={"full"}
// //                     >
// //                       <Text
// //                         fontSize={"lg"}
// //                         color={"rich-black"}
// //                         fontWeight={"semibold"}
// //                       >
// //                         {item.category} :- {item.name}
// //                       </Text>
// //                       <Text>({item.images?.length}) Images</Text>
// //                     </Flex>
// //                     <Text color={"main-text"}>Note:- {item.note || "N/A"}</Text>
// //                   </Box>
// //                 </Link>
// //               ))}
// //             </Grid>
// //           ) : (
// //             <Box mt={3} bg="main-bg" p="3" borderRadius={5}>
// //               <Text>No Items Found</Text>
// //             </Box>
// //           )}
// //         </Box>
// //       )}
// //     </PageLayout>
// //   );
// // };

// // export default AllAddedItems;
