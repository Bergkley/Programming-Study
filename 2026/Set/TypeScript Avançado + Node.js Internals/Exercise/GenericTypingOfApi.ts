type ApiResponse<T extends boolean,U extends object> = {
    success: T extends true ? true : false;
    data: U extends infer Z ?  Z : any;
  };
  

  type keyMapping<T> = {
    [key in keyof T]: T[key];
  }
  const resposta: ApiResponse<true, object> = {
    success: true,
    data: {
      id: 1,
      name: "João",
    },
  };

  type respostaMapped = keyMapping<typeof resposta>
