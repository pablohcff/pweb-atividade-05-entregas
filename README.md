# Delivery Tracker API

API REST para rastreamento de entregas com controle de ciclo de vida, histórico de eventos e validações de regras de negócio.

## Stack

- Node.js (ESModules)
- Express.js
- Banco de dados em memória (sem dependências externas)

## Instalação

```bash
npm install
```

## Executar

```bash
# produção
npm start

# desenvolvimento (auto-reload)
npm run dev
```

O servidor sobe em `http://localhost:3000`.

---

## Rotas

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/entregas` | Criar entrega |
| GET | `/api/entregas` | Listar todas |
| GET | `/api/entregas?status=EM_TRANSITO` | Filtrar por status |
| GET | `/api/entregas/:id` | Buscar por ID |
| PATCH | `/api/entregas/:id/avancar` | Avançar status |
| PATCH | `/api/entregas/:id/cancelar` | Cancelar entrega |
| GET | `/api/entregas/:id/historico` | Histórico de eventos |

---

## Exemplos de uso

### Criar entrega

```http
POST /api/entregas
Content-Type: application/json

{
  "descricao": "Notebook Dell",
  "origem": "São Paulo",
  "destino": "Recife"
}
```

### Avançar status (CRIADA → EM_TRANSITO → ENTREGUE)

```http
PATCH /api/entregas/1/avancar
```

### Cancelar entrega

```http
PATCH /api/entregas/1/cancelar
```

### Filtrar por status

```http
GET /api/entregas?status=EM_TRANSITO
```

### Consultar histórico

```http
GET /api/entregas/1/historico
```

---

## Ciclo de vida

```
CRIADA → EM_TRANSITO → ENTREGUE
   └──────────────────→ CANCELADA
```

Regras:
- Origem ≠ destino
- Não é possível avançar após `ENTREGUE` ou `CANCELADA`
- Não é possível cancelar uma entrega já `ENTREGUE`
- Não pode existir entrega ativa duplicada (mesma descrição + origem + destino)

---

## Estrutura do projeto

```
src/
├── controllers/       # Recebe req/res, delega ao service
├── services/          # Todas as regras de negócio
├── repositories/      # Acesso ao banco em memória
├── database/          # Simulação do banco de dados
├── routes/            # Definição das rotas + injeção de dependência
└── utils/             # AppError, constantes de status
```
