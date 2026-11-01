# Regras de negócio

## 1. Produtos

Todo produto deverá possuir:

- Nome.
- Categoria.
- Unidade de medida.
- Quantidade em estoque.
- Estoque mínimo.
- Valor de referência.

## 2. Compras

Toda compra deverá possuir:

- Fornecedor.
- Data.
- Número ou identificação do documento.
- Itens comprados.
- Quantidades.
- Valores unitários.
- Valor total.

Uma compra confirmada deverá gerar entradas
correspondentes no estoque.

## 3. Movimentações

Tipos de movimentação:

- PURCHASE_ENTRY
- CONSUMPTION
- DETERIORATION
- POSITIVE_ADJUSTMENT
- NEGATIVE_ADJUSTMENT

## 4. Controle de estoque

O estoque deverá ser atualizado através de
movimentações registradas.

Não será permitido alterar o saldo diretamente
sem gerar um registro de movimentação.

## 5. Histórico

As movimentações deverão preservar:

- Produto.
- Tipo.
- Quantidade.
- Data.
- Responsável.
- Motivo.

Registros incorretos deverão ser corrigidos
através de estornos ou ajustes auditáveis.
