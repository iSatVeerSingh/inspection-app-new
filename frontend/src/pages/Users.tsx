import { FormEventHandler, useEffect, useRef, useState } from "react";
import inspectionApi from "../api/inspectionApi";
import { User } from "../types";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Grid,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  AlertDialogBody,
  useDisclosure,
  useToast,
  AlertDialogFooter,
} from "@chakra-ui/react";
import PageLayout from "../layout/PageLayout";
import Loading from "../components/Loading";
import Card from "../components/Card";
import { MoreIcon } from "../icons";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import ButtonPrimary from "../components/ButtonPrimary";
import { getChangedValues } from "../utils/getChangedValues";
import ButtonOuline from "../components/ButtonOuline";

type UserForm = Partial<User> & { password?: string };

const Users = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isEditing, setIsEditing] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<UserForm> | null>(null);
  const [initUser, setInitUser] = useState<Partial<UserForm> | null>(null);
  const deleteUserRef = useRef<string>();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const {
    isOpen: isOpenAlert,
    onOpen: onOpenAlert,
    onClose: onCloseAlert,
  } = useDisclosure();

  const getAllUsers = async () => {
    setLoading(true);
    const { success, data, error } = await inspectionApi.get("/users");
    if (!success) {
      toast({
        title: error,
        duration: 4000,
        status: "error",
      });
      setLoading(false);
      return;
    }
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  function handleEditUserBtn(user: User) {
    setIsEditing(true);
    setInitUser(user);
    onOpen();
  }

  const handleDeleteUserBtn = (id: string) => {
    deleteUserRef.current = id;
    onOpenAlert();
  };

  const handleUserForm: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const target = e.target as HTMLFormElement;
    const formData = new FormData(target);
    const userData: UserForm = {
      name: formData.get("name")?.toString().trim(),
      email: formData.get("email")?.toString().trim(),
      phone: formData.get("phone")?.toString().trim(),
      password: formData.get("password")?.toString().trim(),
      role: formData.get("role")?.toString().trim(),
    };

    if (!isEditing) {
      const errors: Partial<UserForm> = {};
      if (!userData.name || userData.name === "") {
        errors.name = "Name is required";
      }
      if (!userData.email || userData.email === "") {
        errors.email = "Email is required";
      }
      if (!userData.phone || userData.phone === "") {
        errors.phone = "Phone is required";
      }
      if (!userData.password || userData.password === "") {
        errors.password = "Password is requred";
      }
      if (!userData.role || userData.role === "") {
        errors.role = "Role is requred";
      }

      if (Object.keys(errors).length !== 0) {
        setFormErrors(errors);
        return;
      }

      setFormErrors(null);
      setSubmitting(true);

      const { success, data, error } = await inspectionApi.post(
        "/users",
        userData
      );
      if (!success) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data.message,
        duration: 4000,
        status: "success",
      });
      setSubmitting(false);
      onClose();
      await getAllUsers();
    } else {
      const editUserData = getChangedValues(userData, initUser);
      if (editUserData.password === "") {
        editUserData.password = undefined;
      }

      setSubmitting(true);

      const { success, data, error } = await inspectionApi.put(
        `/users/${initUser?.id}`,
        editUserData
      );
      if (!success) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data.message,
        duration: 4000,
        status: "success",
      });
      setSubmitting(false);
      onClose();
      await getAllUsers();
    }
  };

  const handleCreateUserBtn = () => {
    setIsEditing(false);
    onOpen();
  };

  const deleteUser = async () => {
    if (deleteUserRef.current) {
      setSubmitting(true);
      const { success, data, error } = await inspectionApi.delete(
        `/users/${deleteUserRef.current}`
      );
      if (!success) {
        toast({
          title: error,
          duration: 4000,
          status: "error",
        });
        setSubmitting(false);
        return;
      }

      toast({
        title: data.message,
        duration: 4000,
        status: "success",
      });
      setSubmitting(false);
      onCloseAlert();
      await getAllUsers();
    }
  };

  return (
    <PageLayout
      title="Users"
      isRoot
      btn="Create User"
      onClick={handleCreateUserBtn}
    >
      {loading ? (
        <Loading />
      ) : (
        <Card>
          {users.length !== 0 ? (
            <>
              <Grid
                px={2}
                py={1}
                bg={"primary.500"}
                gridTemplateColumns={"200px auto 100px 70px 60px"}
                gap={3}
                color={"white"}
                fontWeight={"semibold"}
              >
                <Text flexGrow={1}>Name</Text>
                <Text>Email</Text>
                <Text>Phone</Text>
                <Text>Role</Text>
                <Text>Action</Text>
              </Grid>
              {users.map((user) => (
                <Grid
                  key={user.id}
                  px={1}
                  py={3}
                  alignItems={"center"}
                  gridTemplateColumns={"200px auto 100px 70px 60px"}
                  gap={3}
                  _hover={{
                    backgroundColor: "primary.50",
                    boxShadow: "xs",
                  }}
                >
                  <Text fontSize={"lg"} fontWeight={"medium"} flexGrow={1}>
                    {user.name}
                  </Text>
                  <Text>{user.email}</Text>
                  <Text>{user.phone}</Text>
                  <Text>{user.role}</Text>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      variant={"simple"}
                      icon={<MoreIcon />}
                    />
                    <MenuList shadow={"lg"}>
                      <MenuItem onClick={() => handleEditUserBtn(user)}>
                        Edit
                      </MenuItem>
                      <MenuItem onClick={() => handleDeleteUserBtn(user.id)}>
                        Delete
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Grid>
              ))}
            </>
          ) : (
            "Coundn't find any users"
          )}
        </Card>
      )}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{isEditing ? "Edit User" : "Create User"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="user_form" onSubmit={handleUserForm}>
              <FormInput
                defaultValue={initUser?.name}
                type="text"
                id="name"
                name="name"
                label="Name"
                placeholder="enter name"
                inputError={formErrors?.name}
                isRequired={!isEditing}
              />
              <FormInput
                defaultValue={initUser?.email}
                type="email"
                id="email"
                name="email"
                label="Email"
                placeholder="enter email"
                inputError={formErrors?.email}
                isRequired={!isEditing}
              />
              <FormInput
                defaultValue={(initUser?.phone as string) || ""}
                type="text"
                id="phone"
                name="phone"
                label="Phone"
                placeholder="enter phone"
                inputError={formErrors?.phone as string}
                isRequired={!isEditing}
              />
              <FormInput
                type="text"
                id="password"
                name="password"
                label="Password"
                placeholder="enter password"
                inputError={formErrors?.password}
                isRequired={!isEditing}
              />
              <FormSelect
                defaultValue={initUser?.role}
                options={["Admin", "Inspector"]}
                id="role"
                name="role"
                label="Role"
                placeholder="select a role"
                inputError={formErrors?.role}
                isRequired={!isEditing}
              />
            </form>
          </ModalBody>
          <ModalFooter gap={3}>
            <ButtonPrimary
              isLoading={submitting}
              loadingText="Submitting"
              type="submit"
              form="user_form"
            >
              {isEditing ? "Update" : "Create"}
            </ButtonPrimary>
            <ButtonOuline onClick={onClose}>Cancel</ButtonOuline>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isOpenAlert}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize={"lg"} fontWeight={"bold"}>
              Delete User
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards.
            </AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <ButtonOuline ref={cancelRef} onClick={onCloseAlert}>
                Cancel
              </ButtonOuline>
              <ButtonPrimary
                isLoading={submitting}
                loadingText="Submitting"
                onClick={deleteUser}
              >
                Delete
              </ButtonPrimary>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </PageLayout>
  );
};

export default Users;
