# tests/README.md — Estratégia de Testes do Delivery Tracker

## 1. Visão Geral

A suíte de testes segue a **pirâmide de testes**:

```
         /\
        /E2E\          ← poucos, lentos, validam fluxos reais (Playwright)
       /------\
      /Integração\     ← médio número, testam rotas HTTP com banco real de testes
     /------------\
    /  Unitários   \   ← muitos, rápidos, sem banco (mocks de repository)
   /-----------------\
```

| Camada        | Ferramenta  | Arquivo(s)                                         |
|---------------|-------------|----------------------------------------------------|
| Unitária      | Jest        | `tests/unit/services/`                             |
| Integração    | Jest + Supertest | `tests/integration/`                          |
| E2E           | Playwright  | `frontend/tests/e2e/`                              |

---

## 2. Como Executar

### Todos os testes unitários + integração
```bash
npm test
```

### Apenas unitários (sem banco de dados)
```bash
npm test -- --testPathPattern="tests/unit"
```
> ⚠️ Os testes unitários devem continuar passando mesmo com `DATABASE_URL` errada,
> pois não fazem nenhuma conexão com banco.

### Apenas integração
```bash
npm test -- --testPathPattern="tests/integration"
```

### Com cobertura de código
```bash
npm run test:coverage
# Relatório gerado em: coverage/lcov-report/index.html
```

### Modo watch (desenvolvimento)
```bash
npm run test:watch
```

### Testes E2E com Playwright
```bash
npm run test:e2e
# Ou diretamente:
# npx playwright test --config=frontend/playwright.config.js
```

> Os testes E2E sobem o servidor Express automaticamente via `webServer` no
> `playwright.config.js`. O servidor precisa de um banco semeado com ao menos
> um usuário (`prisma db seed`).

---

## 3. Banco de Dados de Testes

- Arquivo: `database.test.sqlite` (raiz do projeto)
- Criado automaticamente pelo `globalSetup` (`tests/setup.js`) via `prisma db push`
- As variáveis de ambiente são carregadas de `.env.test`

---

## 4. Análise de Cobertura (RF-07)

Execute `npm run test:coverage` e abra `coverage/lcov-report/index.html`.

### Limiares configurados no `jest.config.js`

| Camada             | Limiar mínimo |
|--------------------|---------------|
| `src/services/`    | 80% statements |
| `src/middleware/`  | 85% statements |
| `src/utils/`       | 75% statements |

---

### Trechos com cobertura zero identificados

#### 1. `src/services/EntregasService.js` — método `listarPorMotorista`

**Por que não está sendo testado:**
O método `listarPorMotorista` não possui casos de teste unitários nem de integração
nesta suíte inicial. Ele combina filtro de status com busca por motorista e envolve
lógica de validação do motorista (404 se não encontrado).

**Impacto de um bug:**
Um bug aqui faria com que a listagem de entregas de um motorista retornasse dados
incorretos ou lançasse erros não tratados, afetando dashboards de motoristas e
relatórios de produtividade.

**Vale a pena escrever um teste?**
**Sim.** É um método com lógica de negócio relevante (filtro duplo: motorista + status)
e com efeitos diretos em relatórios. Um teste unitário com mocks seria suficiente para
cobri-lo com baixo custo.

---

#### 2. `src/services/EntregasService.js` — método `atribuirMotorista`

**Por que não está sendo testado:**
`atribuirMotorista` não foi incluído nos testes unitários desta sprint por ser
considerado secundário em relação ao fluxo principal de status. Envolve validação de
motorista ativo/inativo e substituição de motorista em entrega já atribuída.

**Impacto de um bug:**
Permitir a atribuição de um motorista INATIVO ou exibir evento histórico errado
poderia causar inconsistências nos dados de rastreamento e dificultar auditorias.

**Vale a pena escrever um teste?**
**Sim.** O método tem múltiplos caminhos (motorista não encontrado, motorista inativo,
substituição de motorista) e cada um merece um caso de teste unitário. O custo é baixo
e o risco de regressão é alto dado que a lógica de atribuição é chamada com frequência.

---

## 5. Estrutura de Arquivos

```
tests/
├── unit/
│   └── services/
│       ├── EntregasService.test.js   ← RF-02
│       └── AuthService.test.js       ← RF-03
├── integration/
│   ├── auth.routes.test.js           ← RF-04
│   └── entregas.routes.test.js       ← RF-05
└── setup.js                          ← globalSetup: aplica migrações no banco de testes

frontend/
├── playwright.config.js              ← RF-06
└── tests/
    └── e2e/
        ├── pages/
        │   ├── LoginPage.js          ← Page Object: tela de login
        │   └── EntregasPage.js       ← Page Object: listagem de entregas
        ├── login.spec.js             ← RF-06: fluxos de autenticação E2E
        └── entregas.spec.js          ← RF-06: fluxos de listagem e logout E2E
```
