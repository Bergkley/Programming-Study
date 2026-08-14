-- ============================================================
-- 5 QUERIES OTIMIZADAS - E-COMMERCE
-- PostgreSQL
-- ============================================================
--
-- Banco:
-- ecommerce_ficticio
--
-- Volume aproximado:
-- 10.000 clientes
-- 5.000 produtos
-- 50.000 pedidos
-- 100.000 itens_pedido
-- 50.000 pagamentos
--
-- Objetivo:
-- Demonstrar consultas SQL, índices e EXPLAIN ANALYZE.
-- ============================================================



-- ============================================================
-- ÍNDICES
-- ============================================================
-- Criar índices para as consultas otimizadas.
-- ============================================================


CREATE INDEX IF NOT EXISTS idx_pedidos_cliente
ON pedidos(id_cliente);


CREATE INDEX IF NOT EXISTS idx_produtos_categoria
ON produtos(id_categoria);


CREATE INDEX IF NOT EXISTS idx_itens_produto
ON itens_pedido(id_produto);


CREATE INDEX IF NOT EXISTS idx_itens_pedido
ON itens_pedido(id_pedido);


CREATE INDEX IF NOT EXISTS idx_pedidos_data
ON pedidos(data_pedido);


-- ============================================================
-- QUERY 1
-- BUSCAR CLIENTE PELO E-MAIL
-- ============================================================
--
-- Objetivo:
-- Encontrar rapidamente um cliente específico.
--
-- Conceitos:
-- WHERE
-- INDEX
-- EXPLAIN ANALYZE
--
-- ============================================================

EXPLAIN ANALYZE
SELECT
    id_cliente,
    nome,
    email,
    telefone,
    cidade,
    estado
FROM clientes
WHERE email = 'cliente5000@email.com';


-- ============================================================
-- QUERY 2
-- BUSCAR PEDIDOS DE UM CLIENTE
-- ============================================================
--
-- Objetivo:
-- Listar os pedidos realizados por determinado cliente.
--
--
-- Conceitos:
-- WHERE
-- ORDER BY
-- INDEX
-- ============================================================

EXPLAIN ANALYZE
SELECT
    p.id_pedido,
    p.data_pedido,
    p.status,
    p.valor_total
FROM pedidos p
WHERE p.id_cliente = 5000
ORDER BY p.data_pedido DESC;


-- ============================================================
-- QUERY 3
-- PRODUTOS DE UMA CATEGORIA
-- ============================================================
--
-- Objetivo:
-- Buscar produtos pertencentes a uma categoria.
--
--
-- Conceitos:
-- JOIN
-- WHERE
-- ORDER BY
-- INDEX
-- ============================================================

EXPLAIN ANALYZE
SELECT
    p.id_produto,
    p.nome AS produto,
    p.preco,
    p.estoque,
    c.nome AS categoria
FROM produtos p
INNER JOIN categorias c
    ON c.id_categoria = p.id_categoria
WHERE p.id_categoria = 50
ORDER BY p.preco DESC;


-- ============================================================
-- QUERY 4
-- PRODUTOS MAIS VENDIDOS
-- ============================================================
--
-- Objetivo:
-- Descobrir os 10 produtos com maior quantidade vendida.
--
--
-- Conceitos:
-- JOIN
-- SUM
-- GROUP BY
-- ORDER BY
-- LIMIT
-- ============================================================

EXPLAIN ANALYZE
SELECT
    p.id_produto,
    p.nome AS produto,
    SUM(i.quantidade) AS quantidade_vendida
FROM itens_pedido i
INNER JOIN produtos p
    ON p.id_produto = i.id_produto
GROUP BY
    p.id_produto,
    p.nome
ORDER BY quantidade_vendida DESC
LIMIT 10;


-- ============================================================
-- QUERY 5
-- FATURAMENTO POR MÊS
-- ============================================================
--
-- Objetivo:
-- Calcular a quantidade de pedidos e o faturamento
-- de cada mês.
--
--
-- Conceitos:
-- DATE_TRUNC
-- COUNT
-- SUM
-- GROUP BY
-- ORDER BY
-- EXPLAIN ANALYZE
-- ============================================================

EXPLAIN ANALYZE
SELECT
    DATE_TRUNC('month', data_pedido) AS mes,

    COUNT(*) AS quantidade_pedidos,

    SUM(valor_total) AS faturamento

FROM pedidos

WHERE status <> 'Cancelado'

GROUP BY
    DATE_TRUNC('month', data_pedido)

ORDER BY mes;


