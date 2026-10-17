# Sistema para Associação de Pescadores Artesanais

Sistema web para apoiar a gestão de uma associação de pescadores artesanais, substituindo controles manuais (fichas, planilhas e mensagens) por uma aplicação centralizada.

> **Status:** em desenvolvimento (MVP).

## Sobre o projeto

A ideia nasceu da rotina de trabalho em uma associação, onde o controle de associados e de mensalidades ainda é feito de forma manual. O objetivo é entregar primeiro um MVP pequeno, que resolva a dor principal, e evoluir a partir do uso real.

### Escopo do MVP

- Login do administrador (JWT)
- CRUD de associados
- Geração de mensalidades por competência (mês)
- Registro de pagamento
- Listagem de inadimplentes

## Tecnologias

**Backend**
- Node.js + TypeScript
- Express
- MySQL (`mysql2`, SQL puro, sem ORM)
- JWT (`jsonwebtoken`) e `bcrypt` para autenticação
- Validação manual, sem bibliotecas de schema

**Frontend**
- React + TypeScript (Vite)

**Infraestrutura**
- Docker e Docker Compose (API, frontend e banco)

## Arquitetura

O backend segue **MVC**, com as camadas de **services** e **repositories** separando regra de negócio e acesso a dados. Como a API serve um frontend separado, a "View" é a resposta JSON.

```
Route → Middleware → Controller → Validator → Service → Repository → MySQL
```

| Camada | Responsabilidade |
| --- | --- |
| Routes | Liga cada endpoint ao controller e aos middlewares |
| Controllers | Lê `req`, chama validators e services, devolve o JSON |
| Services | Regras de negócio (ex.: CPF duplicado, geração de mensalidades) |
| Repositories | Queries SQL, sem regra de negócio |
| Models | Tipos/interfaces das entidades |
| Middlewares | Autenticação e tratamento de erros |
| Utils | Validadores e `AppError` |

Erros de negócio são lançados com `AppError` (mensagem + status HTTP) e convertidos em resposta pelo `errorHandler`.

## Estrutura de pastas

```
projeto_associacao/
├── docker-compose.yml
├── back_end/
│   ├── Dockerfile
│   ├── database/
│   │   └── init.sql
│   ├── src/
│   │   ├── config/          # env.ts, database.ts
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env
│   └── package.json
└── front_end/
    ├── Dockerfile
    └── src/
```

## Modelo de dados

- **usuarios**: acesso ao sistema (perfil `admin` ou `associado`)
- **associados**: dados cadastrais, registro de pesca (RGP), data de filiação e status
- **mensalidades**: uma por associado por competência (`AAAA-MM`), com valor, vencimento, data de pagamento e status

A restrição `UNIQUE (associado_id, competencia)` impede mensalidades duplicadas no mesmo mês. O script completo está em [`back_end/database/init.sql`](back_end/database/init.sql).

## Como executar

### Pré-requisitos

- [Docker](https://www.docker.com/) e Docker Compose
- Node.js 20+ (opcional, para rodar fora do Docker)

### 1. Variáveis de ambiente

Crie o arquivo `back_end/.env`:

```env
PORT=3333
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=associacao
JWT_SECRET=troque_por_uma_chave_longa_e_aleatoria
```

> Dentro do Docker, o `DB_HOST` é sobrescrito para `db` pelo compose.

### 2. Subir os containers

Na raiz do projeto:

```bash
docker compose --env-file back_end/.env up --build
```

| Serviço | Endereço |
| --- | --- |
| API | http://localhost:3333/api |
| Frontend | http://localhost:5173 |
| MySQL (acesso externo) | localhost:3307 |

### 3. Verificar

```
GET http://localhost:3333/api/health
```

Resposta esperada:

```json
{ "status": "ok", "banco": "conectado" }
```

### Resetar o banco

O `init.sql` só é executado na primeira criação do volume. Para recriar o banco do zero:

```bash
docker compose down -v
```

## Endpoints

| Método | Rota | Descrição | Status |
| --- | --- | --- | --- |
| GET | `/api/health` | Verifica API e conexão com o banco | Pronto |
| POST | `/api/auth/login` | Login | Planejado |
| GET/POST/PUT/DELETE | `/api/associados` | CRUD de associados | Planejado |
| POST | `/api/mensalidades/gerar` | Gerar mensalidades da competência | Planejado |
| PATCH | `/api/mensalidades/:id/pagar` | Registrar pagamento | Planejado |
| GET | `/api/mensalidades/inadimplentes` | Listar inadimplentes | Planejado |

## Roadmap

- [x] Definição do escopo do MVP e da arquitetura
- [x] Setup do backend (Express, TypeScript, configuração de ambiente)
- [x] Conexão com MySQL e rota de health check
- [x] Tratamento centralizado de erros (`AppError` + `errorHandler`)
- [x] Docker Compose (API + MySQL)
- [x] Modelo de dados inicial (`init.sql`)
- [ ] Setup do frontend (React + TypeScript) e Docker
- [ ] Módulo de autenticação (JWT)
- [ ] Módulo de associados
- [ ] Módulo de mensalidades
- [ ] Telas do frontend
- [ ] Registro de produção/pescaria (pós-MVP)
- [ ] Controle de vendas (pós-MVP)

## Fluxo de trabalho (Git)

### Branches

| Branch | Uso |
| --- | --- |
| `main` | Código estável. Só recebe merges vindos da `develop` |
| `develop` | Integração. Recebe as features concluídas |
| `feature/<nome>` | Novas funcionalidades |
| `fix/<nome>` | Correção de bugs |
| `chore/<nome>` | Configuração, dependências, Docker, documentação |

Fluxo: `feature/*` → (Pull Request) → `develop` → (Pull Request) → `main`.

### Branches planejadas

- `feature/frontend-setup`
- `feature/auth`
- `feature/associados`
- `feature/mensalidades`
- `feature/frontend-auth`
- `feature/frontend-associados`
- `feature/frontend-mensalidades`

### Padrão de commits

Baseado em [Conventional Commits](https://www.conventionalcommits.org/pt-br/):

```
feat: adiciona cadastro de associados
fix: corrige cálculo de vencimento
chore: atualiza configuração do docker
docs: atualiza README
refactor: extrai validação de CPF
```

## Segurança e boas práticas

- Senhas armazenadas com hash (`bcrypt`)
- Rotas protegidas por JWT
- Queries com prepared statements
- O arquivo `.env` **não** deve ser versionado
- Atenção à LGPD: o sistema lida com CPF, documentos e dados financeiros

## Autor

**Geovane Silva** — [GitHub](https://github.com/GeovaneSilvaP)
