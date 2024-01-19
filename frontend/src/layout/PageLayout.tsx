import { Box, Flex, Grid, Heading, IconButton } from "@chakra-ui/react";
import { ChevronLeft } from "../icons";
import { MouseEventHandler } from "react";
import ButtonPrimary from "../components/ButtonPrimary";
import { useNavigate } from "react-router-dom";

type PageLayoutProps = {
  children: React.ReactNode;
  title: string;
  isRoot?: boolean;
  btn?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  backPage?: string;
};

const PageLayout = ({
  children,
  title,
  isRoot,
  btn,
  onClick,
  backPage,
}: PageLayoutProps) => {
  const navigate = useNavigate();

  return (
    <Grid shadow={"xs"} gridTemplateRows={"60px auto"} overflow={"hidden"}>
      <Flex
        px={3}
        gap={2}
        alignItems={"center"}
        bg={"main-bg"}
        justify={"space-between"}
        zIndex={100}
      >
        <Flex gap={2} alignItems={"center"}>
          {!isRoot && (
            <IconButton
              icon={<ChevronLeft boxSize={5} />}
              aria-label="Go Back"
              borderRadius={"full"}
              color={"primary.500"}
              onClick={() => (backPage ? navigate(backPage) : navigate(-1))}
            />
          )}
          <Heading as="h2" fontSize={"2xl"}>
            {title}
          </Heading>
        </Flex>
        {btn && <ButtonPrimary onClick={onClick}>{btn}</ButtonPrimary>}
      </Flex>
      <Box p={2} overflowY={"scroll"}>
        {children}
      </Box>
    </Grid>
  );
};

export default PageLayout;
