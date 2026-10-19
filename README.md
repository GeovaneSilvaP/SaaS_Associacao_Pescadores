# Sistema para Associação de Pescadores Artesanais

Sistema web para apoiar a gestão de uma associação de pescadores artesanais, substituindo controles manuais (fichas, planilhas e mensagens) por uma aplicação centralizada.

> **Status:** em desenvolvimento (MVP). Autenticação concluída; módulos de associados e mensalidades em andamento.

## Sobre o projeto

A ideia nasceu da rotina de trabalho em uma associação, onde o controle de associados e de mensalidades ainda é feito de forma manual. O objetivo é entregar primeiro um MVP pequeno, que resolva a dor principal, e evoluir a partir do uso real.

### Escopo do MVP

- Login do administrador (JWT)
- CRUD de associados
- Geração de mensalidades por competência (mês)
- Registro de pagamento
- Listagem de inadimplentes

## Funcionalidades

### Implementadas

- **Infraestrutura**
  - API em Node.js + TypeScript com Express
  - Conexão com MySQL (pool `mysql2`, SQL puro) e rota de health check
  - Configuração por variáveis de ambiente, com falha na inicialização se faltar alguma obrigatória
  - Tratamento centralizado de erros (`AppError` + `errorHandler`)
  - Ambiente completo com Docker Compose (API, frontend e MySQL)
  - Schema do banco criado automaticamente (`init.sql`)
- **Autenticação**
  - Login com e-mail e senha (`POST /api/auth/login`), retornando token JWT com expiração de 8 horas
  - Senhas armazenadas com hash (`bcrypt`)
  - Mensagem única para e-mail inexistente e senha incorreta, sem revelar quais e-mails estão cadastrados
  - Rota do usuário autenticado (`GET /api/auth/me`)
  - Middleware `authMiddleware` (valida o token) e `apenasAdmin` (restringe por perfil)
  - Script para criar o primeiro administrador (`npm run seed:admin`)
  - Validadores manuais (campo obrigatório, e-mail, senha)
- **Frontend**
  - Projeto React + TypeScript criado com Vite e integrado ao Docker Compose

### Em andamento / planejadas

- Módulo de associados (CRUD, validação de CPF, inativação)
- Módulo de mensalidades (geração, pagamento, inadimplentes)
- Telas do frontend (login, associados, mensalidades)

## Tecnologias

**Backend**
- Node.js + TypeScript
- Express
- MySQL (`mysql2`, SQL puro, sem ORM)
- JWT (`jsonwebtoken`) e `bcrypt`
- Validação manual, sem bibliotecas de schema

**Frontend**
- React + TypeScript (Vite)

**Infraestrutura**
- Docker e Docker Compose

## Arquitetura

O backend segue **MVC**, com as camadas de **services** e **repositories** separando regra de negócio e acesso a dados. Como a API serve um frontend separado, a "View" é a resposta JSON.

```
Route → Middleware → Controller → Validator → Service → Repository → MySQL
```

| Camada | Responsabilidade |
| --- | --- |
| Routes | Liga cada endpoint ao controller e aos middlewares |
| Controllers | Lê `req`, chama validators e services, devolve o JSON |
| Services | Regras de negócio (ex.: credenciais, CPF duplicado, geração de mensalidades) |
| Repositories | Queries SQL, sem regra de negócio |
| Models | Tipos/interfaces das entidades |
| Middlewares | Autenticação, autorização e tratamento de erros |
| Utils | Validadores e `AppError` |

Erros de negócio são lançados com `AppError` (mensagem + status HTTP) e convertidos em resposta pelo `errorHandler`. O Express 5 repassa erros de funções `async` ao handler automaticamente, então os controllers não precisam de `try/catch`.

## Estrutura de pastas

```
SaaS_Associacao_Pescadores/
├── docker-compose.yml
├── back_end/
│   ├── Dockerfile
│   ├── database/
│   │   └── init.sql
│   ├── src/
│   │   ├── config/          # env.ts, database.ts
│   │   ├── models/          # Usuario.ts
│   │   ├── repositories/    # UsuarioRepository.ts
│   │   ├── services/        # AuthService.ts
│   │   ├── controllers/     # AuthController.ts
│   │   ├── routes/          # index.ts, authRoutes.ts
│   │   ├── middlewares/     # authMiddleware.ts, errorHandler.ts
│   │   ├── scripts/         # seedAdmin.ts
│   │   ├── types/           # express.d.ts
│   │   ├── utils/           # AppError.ts, validators.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── .env                 # não versionado
│   └── package.json
└── front_end/
    ├── Dockerfile
    ├── .env.example
    └── src/
```

## Modelo de dados

- **usuarios**: acesso ao sistema (perfil `admin` ou `associado`)
- **associados**: dados cadastrais, registro de pesca (RGP), data de filiação e status
- **mensalidades**: uma por associado por competência (`AAAA-MM`), com valor, vencimento, data de pagamento e status

A restrição `UNIQUE (associado_id, competencia)` impede mensalidades duplicadas no mesmo mês. O script completo está em [`back_end/database/init.sql`](back_end/database/init.sql).

## Como executar com Docker

### Pré-requisitos

- [Docker](https://www.docker.com/) com Docker Compose
- [Git](https://git-scm.com/)

Não é necessário instalar Node.js nem MySQL na máquina.

### 1. Clonar o repositório

```bash
git clone https://github.com/GeovaneSilvaP/SaaS_Associacao_Pescadores.git
cd SaaS_Associacao_Pescadores
```

### 2. Criar o arquivo de variáveis de ambiente

Crie `back_end/.env` (o arquivo não é versionado):

```env
PORT=3333
FRONTEND_URL=http://localhost:5173
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=associacao
JWT_SECRET=troque_por_uma_chave_longa_e_aleatoria

# Usadas apenas pelo script de criação do admin (remova depois de rodar)
ADMIN_NOME=Administrador
ADMIN_EMAIL=admin@associacao.com
ADMIN_SENHA=uma_senha_forte_aqui
```

Observações:

- Dentro do Docker, o `DB_HOST` é sobrescrito para `db` pelo compose.
- Evite o caractere `$` na senha do banco: o compose tenta interpretá-lo como variável.
- A senha do admin precisa ter no mínimo 8 caracteres.

Opcionalmente, crie `front_end/.env` a partir do modelo `front_end/.env.example` (o valor padrão já é fornecido pelo compose).

### 3. Subir os containers

Na raiz do projeto:

```bash
docker compose --env-file back_end/.env up --build
```

O `--env-file` é necessário porque `DB_PASSWORD` e `DB_NAME` do serviço `db` são lidos do `.env` que está em `back_end`.

| Serviço | Descrição | Endereço |
| --- | --- | --- |
| `api` | Backend (Express) | http://localhost:3333/api |
| `web` | Frontend (React + Vite) | http://localhost:5173 |
| `db` | MySQL 8 | `localhost:3307` (acesso externo) |

Na primeira subida, o MySQL executa o `init.sql` e cria as tabelas.

### 4. Criar o primeiro administrador

Com os containers rodando, em outro terminal:

```bash
docker compose exec api npm run seed:admin
```

O script usa as variáveis `ADMIN_*` do `.env`. Depois de executar, **remova essas três linhas do `.env`**: a senha já foi gravada no banco (com hash).

> Se você editou o `.env` depois que os containers foram criados, recrie a API para ela receber os novos valores:
> `docker compose --env-file back_end/.env up -d --build`

### 5. Verificar

Health check:

```
GET http://localhost:3333/api/health
```

```json
{ "status": "ok", "banco": "conectado" }
```

Login (PowerShell):

```powershell
$r = Invoke-RestMethod -Method Post -Uri http://localhost:3333/api/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@associacao.com","senha":"uma_senha_forte_aqui"}'

Invoke-RestMethod -Uri http://localhost:3333/api/auth/me `
  -Headers @{ Authorization = "Bearer $($r.token)" }
```

Login (curl):

```bash
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@associacao.com","senha":"uma_senha_forte_aqui"}'
```

### Comandos úteis

```bash
# Subir em segundo plano
docker compose --env-file back_end/.env up -d --build

# Ver logs de um serviço
docker compose logs -f api
docker compose logs db

# Parar os containers
docker compose down

# Parar e apagar o banco (o init.sql roda de novo na próxima subida)
docker compose down -v
```

### Problemas comuns

| Sintoma | Causa e solução |
| --- | --- |
| `env file ... .env not found` | O compose foi executado fora da raiz ou o `back_end/.env` não existe. Rode da raiz e confirme o arquivo. |
| `db` encerra com `batch_readline` no log | `database/init.sql` não existia ao subir e o Docker criou uma **pasta** com esse nome. Rode `docker compose down -v`, apague a pasta, crie o arquivo e suba de novo. |
| `seed:admin` falha sem mensagem | O comando foi executado na máquina local, onde o MySQL não está em `localhost:3306`. Rode dentro do container com `docker compose exec api npm run seed:admin`. |
| `Variável de ambiente X não definida` | Falta variável no `.env`, ou o container foi criado antes de a variável existir. Recrie com `up -d --build`. |
| Tabelas não existem | O volume do banco foi criado antes do `init.sql` estar correto. Rode `docker compose down -v` e suba de novo. |

## Endpoints

| Método | Rota | Descrição | Acesso | Status |
| --- | --- | --- | --- | --- |
| GET | `/api/health` | Verifica API e conexão com o banco | Público | Pronto |
| POST | `/api/auth/login` | Login, retorna token JWT | Público | Pronto |
| GET | `/api/auth/me` | Dados do usuário autenticado | Autenticado | Pronto |
| GET/POST/PUT/DELETE | `/api/associados` | CRUD de associados | Admin | Planejado |
| POST | `/api/mensalidades/gerar` | Gerar mensalidades da competência | Admin | Planejado |
| PATCH | `/api/mensalidades/:id/pagar` | Registrar pagamento | Admin | Planejado |
| GET | `/api/mensalidades/inadimplentes` | Listar inadimplentes | Admin | Planejado |

### Autenticação

As rotas protegidas exigem o cabeçalho:

```
Authorization: Bearer <token>
```

**`POST /api/auth/login`**

```json
// requisição
{ "email": "admin@associacao.com", "senha": "uma_senha_forte_aqui" }

// resposta 200
{
  "token": "eyJhbGciOi...",
  "usuario": { "id": 1, "nome": "Administrador", "email": "admin@associacao.com", "perfil": "admin", "criado_em": "..." }
}
```

| Status | Situação |
| --- | --- |
| 400 | Campo ausente ou e-mail com formato inválido |
| 401 | E-mail ou senha inválidos; token ausente, inválido ou expirado |
| 403 | Perfil sem permissão para a rota |

## Roadmap

- [x] Definição do escopo do MVP e da arquitetura
- [x] Setup do backend (Express, TypeScript, configuração de ambiente)
- [x] Conexão com MySQL e rota de health check
- [x] Tratamento centralizado de erros (`AppError` + `errorHandler`)
- [x] Docker Compose (API + MySQL)
- [x] Modelo de dados inicial (`init.sql`)
- [x] Setup do frontend (React + TypeScript + Vite)
- [x] Módulo de autenticação (JWT, middleware, seed do admin)
- [ ] Módulo de associados
- [ ] Módulo de mensalidades
- [ ] Frontend: login e rotas protegidas
- [ ] Frontend: telas de associados e mensalidades
- [ ] Limite de tentativas de login (rate limit)
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

### Branches de trabalho

- `feature/auth` (concluída)
- `feature/frontend-setup` (concluída)
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
- Rotas protegidas por JWT, com expiração de 8 horas
- Controle de acesso por perfil (`apenasAdmin`)
- Queries com prepared statements
- Mensagem única para credenciais inválidas
- Arquivos `.env` **não** são versionados (apenas modelos `.env.example`)
- Variáveis `VITE_*` ficam visíveis no navegador, então o frontend nunca guarda segredos
- Atenção à LGPD: o sistema lida com CPF, documentos e dados financeiros

## Autor

**Geovane Silva** — [GitHub](https://github.com/GeovaneSilvaP)
