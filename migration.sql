-- migration.sql
-- Execução idempotente: CREATE TABLE IF NOT EXISTS garante que pode rodar do zero

CREATE TABLE IF NOT EXISTS motoristas (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nome          TEXT    NOT NULL,
  cpf           TEXT    NOT NULL UNIQUE,
  placa_veiculo TEXT    NOT NULL,
  status        TEXT    NOT NULL DEFAULT 'ATIVO'
    CHECK (status IN ('ATIVO', 'INATIVO'))
);

CREATE TABLE IF NOT EXISTS entregas (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  descricao    TEXT    NOT NULL,
  origem       TEXT    NOT NULL,
  destino      TEXT    NOT NULL,
  status       TEXT    NOT NULL DEFAULT 'CRIADA'
    CHECK (status IN ('CRIADA', 'EM_TRANSITO', 'ENTREGUE', 'CANCELADA')),
  motorista_id INTEGER REFERENCES motoristas(id)
);

CREATE TABLE IF NOT EXISTS eventos_entrega (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  entrega_id INTEGER NOT NULL REFERENCES entregas(id) ON DELETE CASCADE,
  data       TEXT    NOT NULL,
  descricao  TEXT    NOT NULL
);
