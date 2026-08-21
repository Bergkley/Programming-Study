type SchemaObject = Record<string, unknown>;

type OpenApiDocument = {
  openapi: "3.1.0";
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  tags: Array<{
    name: string;
    description: string;
  }>;
  paths: Record<string, unknown>;
  components: {
    parameters: Record<string, unknown>;
    responses: Record<string, unknown>;
    schemas: Record<string, SchemaObject>;
  };
};

const pageParameter = {
  name: "page",
  in: "query",
  description: "Numero da pagina solicitada. A primeira pagina e 1.",
  required: false,
  schema: {
    type: "integer",
    minimum: 1,
    default: 1,
    example: 1
  }
};

const perPageParameter = {
  name: "perPage",
  in: "query",
  description: "Quantidade de itens por pagina.",
  required: false,
  schema: {
    type: "integer",
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10
  }
};

const sortParameter = {
  name: "sort",
  in: "query",
  description: "Campo usado para ordenacao.",
  required: false,
  schema: {
    type: "string",
    enum: ["name", "price", "createdAt"],
    default: "createdAt"
  }
};

const orderParameter = {
  name: "order",
  in: "query",
  description: "Direcao da ordenacao.",
  required: false,
  schema: {
    type: "string",
    enum: ["asc", "desc"],
    default: "desc"
  }
};

const requestIdHeader = {
  description: "Identificador da requisicao para rastreio em logs.",
  schema: {
    type: "string",
    example: "req_01J4V1Y4Q6K4NEZ6X37K3EZ7TP"
  }
};

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Catalog API",
    version: "2.0.0",
    description:
      "API REST de exemplo com OpenAPI, SQLite, Prisma, paginacao, versionamento por URL e status codes padronizados."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Ambiente local"
    }
  ],
  tags: [
    {
      name: "Health",
      description: "Verificacao de disponibilidade da API."
    },
    {
      name: "Products V1",
      description: "Versao estavel inicial do recurso de produtos."
    },
    {
      name: "Products V2",
      description: "Versao mais nova, com campos adicionais e operacoes de escrita."
    }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verifica se a API esta online",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "API disponivel.",
            headers: {
              "X-Request-Id": requestIdHeader
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status", "timestamp"],
                  properties: {
                    status: {
                      type: "string",
                      example: "ok"
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time"
                    }
                  }
                }
              }
            }
          },
          "500": {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      }
    },
    "/v1/products": {
      get: {
        tags: ["Products V1"],
        summary: "Lista produtos com paginacao",
        description:
          "Endpoint versionado em URL. A v1 retorna o contrato mais simples de produto.",
        operationId: "listProductsV1",
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/PerPage" },
          { $ref: "#/components/parameters/Sort" },
          { $ref: "#/components/parameters/Order" }
        ],
        responses: {
          "200": {
            description: "Lista paginada retornada com sucesso.",
            headers: {
              "X-Request-Id": requestIdHeader,
              "X-API-Version": {
                description: "Versao do contrato usada para processar a requisicao.",
                schema: {
                  type: "string",
                  example: "1"
                }
              }
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedProductsV1"
                }
              }
            }
          },
          "400": {
            $ref: "#/components/responses/BadRequest"
          },
          "429": {
            $ref: "#/components/responses/TooManyRequests"
          },
          "500": {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      }
    },
    "/v2/products": {
      get: {
        tags: ["Products V2"],
        summary: "Lista produtos com paginacao",
        description:
          "A v2 adiciona `stock`, `category` e `links.self` sem quebrar clientes da v1.",
        operationId: "listProductsV2",
        parameters: [
          { $ref: "#/components/parameters/Page" },
          { $ref: "#/components/parameters/PerPage" },
          { $ref: "#/components/parameters/Sort" },
          { $ref: "#/components/parameters/Order" }
        ],
        responses: {
          "200": {
            description: "Lista paginada retornada com sucesso.",
            headers: {
              "X-Request-Id": requestIdHeader,
              "X-API-Version": {
                description: "Versao do contrato usada para processar a requisicao.",
                schema: {
                  type: "string",
                  example: "2"
                }
              }
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/PaginatedProductsV2"
                }
              }
            }
          },
          "400": {
            $ref: "#/components/responses/BadRequest"
          },
          "429": {
            $ref: "#/components/responses/TooManyRequests"
          },
          "500": {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      },
      post: {
        tags: ["Products V2"],
        summary: "Cria um produto",
        description:
          "Operacao disponivel apenas na v2 para demonstrar evolucao de API sem alterar a v1.",
        operationId: "createProductV2",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CreateProductInput"
              }
            }
          }
        },
        responses: {
          "201": {
            description: "Produto criado com sucesso.",
            headers: {
              Location: {
                description: "URL canonica do novo recurso.",
                schema: {
                  type: "string",
                  example: "/v2/products/prd_123"
                }
              },
              "X-Request-Id": requestIdHeader,
              "X-API-Version": {
                description: "Versao do contrato usada para processar a requisicao.",
                schema: {
                  type: "string",
                  example: "2"
                }
              }
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductV2"
                }
              }
            }
          },
          "400": {
            $ref: "#/components/responses/BadRequest"
          },
          "409": {
            $ref: "#/components/responses/Conflict"
          },
          "422": {
            $ref: "#/components/responses/ValidationError"
          },
          "500": {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      }
    },
    "/v2/products/{productId}": {
      get: {
        tags: ["Products V2"],
        summary: "Busca um produto por ID",
        operationId: "getProductV2",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            description: "Identificador unico do produto.",
            schema: {
              type: "string",
              example: "prd_001"
            }
          }
        ],
        responses: {
          "200": {
            description: "Produto encontrado.",
            headers: {
              "X-Request-Id": requestIdHeader,
              "X-API-Version": {
                description: "Versao do contrato usada para processar a requisicao.",
                schema: {
                  type: "string",
                  example: "2"
                }
              }
            },
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/ProductV2"
                }
              }
            }
          },
          "404": {
            $ref: "#/components/responses/NotFound"
          },
          "500": {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      },
      delete: {
        tags: ["Products V2"],
        summary: "Remove um produto",
        operationId: "deleteProductV2",
        parameters: [
          {
            name: "productId",
            in: "path",
            required: true,
            description: "Identificador unico do produto.",
            schema: {
              type: "string",
              example: "prd_001"
            }
          }
        ],
        responses: {
          "204": {
            description: "Produto removido. Resposta sem corpo."
          },
          "404": {
            $ref: "#/components/responses/NotFound"
          },
          "500": {
            $ref: "#/components/responses/InternalServerError"
          }
        }
      }
    }
  },
  components: {
    parameters: {
      Page: pageParameter,
      PerPage: perPageParameter,
      Sort: sortParameter,
      Order: orderParameter
    },
    responses: {
      BadRequest: {
        description: "Parametros invalidos na requisicao.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            },
            examples: {
              invalidPagination: {
                summary: "Paginacao invalida",
                value: {
                  error: {
                    code: "BAD_REQUEST",
                    message: "page deve ser maior ou igual a 1",
                    statusCode: 400
                  }
                }
              }
            }
          }
        }
      },
      NotFound: {
        description: "Recurso nao encontrado.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      Conflict: {
        description: "A operacao conflita com o estado atual do recurso.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      ValidationError: {
        description: "Corpo da requisicao possui dados semanticamente invalidos.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ValidationErrorResponse"
            }
          }
        }
      },
      TooManyRequests: {
        description: "Limite de requisicoes excedido.",
        headers: {
          "Retry-After": {
            description: "Tempo em segundos antes de tentar novamente.",
            schema: {
              type: "integer",
              example: 60
            }
          }
        },
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            }
          }
        }
      },
      InternalServerError: {
        description: "Erro inesperado no servidor.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/ErrorResponse"
            }
          }
        }
      }
    },
    schemas: {
      ProductV1: {
        type: "object",
        required: ["id", "name", "price"],
        properties: {
          id: {
            type: "string",
            example: "prd_001"
          },
          name: {
            type: "string",
            example: "Mechanical Keyboard"
          },
          price: {
            type: "number",
            format: "float",
            example: 349.9
          }
        }
      },
      ProductV2: {
        allOf: [
          {
            $ref: "#/components/schemas/ProductV1"
          },
          {
            type: "object",
            required: ["stock", "category", "createdAt", "links"],
            properties: {
              stock: {
                type: "integer",
                minimum: 0,
                example: 12
              },
              category: {
                type: "string",
                example: "peripherals"
              },
              createdAt: {
                type: "string",
                format: "date-time",
                example: "2026-12-01T10:00:00.000Z"
              },
              links: {
                type: "object",
                required: ["self"],
                properties: {
                  self: {
                    type: "string",
                    example: "/v2/products/prd_001"
                  }
                }
              }
            }
          }
        ]
      },
      CreateProductInput: {
        type: "object",
        required: ["name", "price", "stock", "category"],
        properties: {
          name: {
            type: "string",
            minLength: 3,
            maxLength: 120,
            example: "USB-C Dock"
          },
          price: {
            type: "number",
            exclusiveMinimum: 0,
            example: 259.9
          },
          stock: {
            type: "integer",
            minimum: 0,
            example: 30
          },
          category: {
            type: "string",
            minLength: 2,
            example: "accessories"
          }
        }
      },
      PaginationMeta: {
        type: "object",
        required: ["page", "perPage", "totalItems", "totalPages", "hasNextPage", "hasPreviousPage"],
        properties: {
          page: {
            type: "integer",
            example: 1
          },
          perPage: {
            type: "integer",
            example: 10
          },
          totalItems: {
            type: "integer",
            example: 42
          },
          totalPages: {
            type: "integer",
            example: 5
          },
          hasNextPage: {
            type: "boolean",
            example: true
          },
          hasPreviousPage: {
            type: "boolean",
            example: false
          }
        }
      },
      PaginationLinks: {
        type: "object",
        required: ["self", "first", "last"],
        properties: {
          self: {
            type: "string",
            example: "/v2/products?page=1&perPage=10"
          },
          first: {
            type: "string",
            example: "/v2/products?page=1&perPage=10"
          },
          previous: {
            type: ["string", "null"],
            example: null
          },
          next: {
            type: ["string", "null"],
            example: "/v2/products?page=2&perPage=10"
          },
          last: {
            type: "string",
            example: "/v2/products?page=5&perPage=10"
          }
        }
      },
      PaginatedProductsV1: {
        type: "object",
        required: ["data", "meta", "links"],
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ProductV1"
            }
          },
          meta: {
            $ref: "#/components/schemas/PaginationMeta"
          },
          links: {
            $ref: "#/components/schemas/PaginationLinks"
          }
        }
      },
      PaginatedProductsV2: {
        type: "object",
        required: ["data", "meta", "links"],
        properties: {
          data: {
            type: "array",
            items: {
              $ref: "#/components/schemas/ProductV2"
            }
          },
          meta: {
            $ref: "#/components/schemas/PaginationMeta"
          },
          links: {
            $ref: "#/components/schemas/PaginationLinks"
          }
        }
      },
      ErrorResponse: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message", "statusCode"],
            properties: {
              code: {
                type: "string",
                example: "NOT_FOUND"
              },
              message: {
                type: "string",
                example: "Produto nao encontrado"
              },
              statusCode: {
                type: "integer",
                example: 404
              },
              requestId: {
                type: "string",
                example: "req_01J4V1Y4Q6K4NEZ6X37K3EZ7TP"
              }
            }
          }
        }
      },
      ValidationErrorResponse: {
        allOf: [
          {
            $ref: "#/components/schemas/ErrorResponse"
          },
          {
            type: "object",
            properties: {
              details: {
                type: "array",
                items: {
                  type: "object",
                  required: ["field", "message"],
                  properties: {
                    field: {
                      type: "string",
                      example: "price"
                    },
                    message: {
                      type: "string",
                      example: "price deve ser maior que zero"
                    }
                  }
                }
              }
            }
          }
        ]
      }
    }
  }
} satisfies OpenApiDocument;

if (process.argv[1]?.endsWith("openapi.ts")) {
  console.log(JSON.stringify(openApiDocument, null, 2));
}
