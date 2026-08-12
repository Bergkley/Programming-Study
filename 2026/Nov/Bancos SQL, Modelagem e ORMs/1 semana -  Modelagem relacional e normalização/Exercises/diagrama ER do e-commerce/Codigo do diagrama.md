

Table CLIENTE {
  id_cliente integer [primary key, increment]
  nome varchar
  email varchar [unique]
  senha varchar
  telefone varchar
  data_cadastro timestamp
}

Table ENDERECO {
  id_endereco integer [primary key, increment]
  id_cliente integer
  rua varchar
  numero varchar
  cidade varchar
  estado varchar
  cep varchar
}

Table CATEGORIA {
  id_categoria integer [primary key, increment]
  nome varchar
  descricao varchar
}

Table PRODUTO {
  id_produto integer [primary key, increment]
  id_categoria integer
  nome varchar
  descricao varchar
  preco decimal
  estoque integer
}

Table PEDIDO {
  id_pedido integer [primary key, increment]
  id_cliente integer
  id_endereco integer
  data_pedido timestamp
  status varchar
  valor_total decimal
}

Table ITEM_PEDIDO {
  id_item integer [primary key, increment]
  id_pedido integer
  id_produto integer
  quantidade integer
  preco_unitario decimal
}

Table PAGAMENTO {
  id_pagamento integer [primary key, increment]
  id_pedido integer
  tipo varchar
  valor decimal
  status varchar
  data_pagamento timestamp
}

Table AVALIACAO {
  id_avaliacao integer [primary key, increment]
  id_cliente integer
  id_produto integer
  nota integer
  comentario varchar
  data_avaliacao timestamp
}



Ref: CLIENTE.id_cliente < ENDERECO.id_cliente

Ref: CATEGORIA.id_categoria < PRODUTO.id_categoria

Ref: CLIENTE.id_cliente < PEDIDO.id_cliente

Ref: ENDERECO.id_endereco < PEDIDO.id_endereco

Ref: PEDIDO.id_pedido < ITEM_PEDIDO.id_pedido

Ref: PRODUTO.id_produto < ITEM_PEDIDO.id_produto

Ref: PEDIDO.id_pedido - PAGAMENTO.id_pedido

Ref: CLIENTE.id_cliente < AVALIACAO.id_cliente

Ref: PRODUTO.id_produto < AVALIACAO.id_produto

site : https://dbdiagram.io/d