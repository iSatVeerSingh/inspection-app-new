export const getBadRequestResponse = (
  message: string = "Invalid request",
  status: number = 400
) => {
  return new Response(
    JSON.stringify({
      message,
    }),
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const getSuccessResponse = (data: any) => {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
