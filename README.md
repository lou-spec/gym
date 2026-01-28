# Gym Management System

<p align="center">
  <a href="#english">English</a>
  &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#portuguese">Português</a>
</p>

---

<div id="english">

## About

A comprehensive full-stack fitness management platform designed for gyms and personal trainers. The system provides complete workout planning, user management, real-time chat, and QR code check-in functionality.

## Features

- Secure authentication with JWT tokens and bcrypt encryption
- Role-based access control (Admin, Personal Trainer, User)
- Comprehensive workout planning and management
- Exercise library with video tutorials
- QR code generation for gym check-ins
- Real-time chat system using Socket.io
- User profile management
- Email notifications via Nodemailer
- Media storage with Cloudinary integration
- Responsive UI with SCSS and Bootstrap
- Testing suite with Jest and Supertest

## Technologies

### Frontend
- **React 18.2.0** - UI library with Vite build tool
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **SCSS** - Styling
- **Bootstrap 5.3.8** - UI components
- **SweetAlert2** - Modern alerts
- **Recharts** - Data visualization
- **Swiper** - Carousel component
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Socket.io** - WebSocket server
- **Nodemailer** - Email service
- **Multer** - File upload handling
- **Cloudinary** - Media management

### Database
- **MongoDB** - NoSQL database

### Testing
- **Jest** - Testing framework
- **Supertest** - HTTP testing
- **Vitest** - Frontend unit testing

### Additional Tools
- **Swagger** - API documentation
- **ESLint** - Code linting
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

## Project Structure

```
gym-produção/
├── backend/
│   ├── config/
│   │   └── cloudinary.js       # Media storage config
│   ├── data/
│   │   ├── users/              # User data layer
│   │   ├── workouts/           # Workout data layer
│   │   └── chat/               # Chat data layer
│   ├── middleware/
│   │   └── token.js            # JWT verification
│   ├── server/
│   │   ├── auth.js             # Authentication routes
│   │   ├── users.js            # User management
│   │   ├── workouts.js         # Workout management
│   │   ├── chat.js             # Chat functionality
│   │   └── swagger.js          # API docs
│   ├── tests/                  # Test suites
│   └── index.js                # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPage/      # Admin dashboard
│   │   │   ├── PersonalPage/   # Trainer dashboard
│   │   │   ├── UserPage/       # User dashboard
│   │   │   ├── Login/          # Authentication
│   │   │   └── Register/       # User registration
│   │   ├── contexts/           # React contexts
│   │   ├── hooks/              # Custom hooks
│   │   └── utils/              # Utility functions
│   └── tests/                  # Frontend tests
└── package.json
```

## Key Features Breakdown

### Authentication & Authorization
- JWT-based authentication
- Password encryption with bcrypt
- Role-based permissions (Admin, Personal Trainer, User)
- Secure route protection

### Workout Management
- Create and assign workout plans
- Exercise library with videos
- Set tracking (reps, weight, rest time)
- Calendar view for workout scheduling
- Progress tracking

### User Management
- Admin dashboard for user oversight
- Personal trainer client management
- User profile customization
- Activity tracking

### Real-time Features
- Live chat between users and trainers
- Socket.io integration
- Instant notifications

### Media Management
- Cloudinary integration for images/videos
- Exercise demonstration videos
- Profile pictures
- Workout thumbnails

## Installation

### Prerequisites
- Node.js 18+ 
- MongoDB
- npm or yarn

### Setup

1. Clone the repository
```bash
git clone https://github.com/lou-spec/gym.git
cd gym
```

2. Install backend dependencies
```bash
cd backend
npm install
```

3. Install frontend dependencies
```bash
cd ../frontend
npm install
```

4. Configure environment variables

Create `.env` in backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

5. Start backend server
```bash
cd backend
npm start
```

6. Start frontend development server
```bash
cd frontend
npm start
```

Application will run at `http://localhost:8100`

## API Documentation

Access Swagger documentation at `/api-docs` endpoint when server is running.

## Testing

### Run backend tests
```bash
cd backend
npm test
```

### Run frontend tests
```bash
cd frontend
npm test
```

## Deployment

The application is configured for deployment on Render.

### Backend
Deploy backend to Render with MongoDB Atlas

### Frontend
Deploy frontend to Vercel with environment variables

## Live Demo

Website: [gym-pwa-three.vercel.app](https://gym-pwa-three.vercel.app/)

## License

This project is licensed under the ISC License.

## Authors

ArpaoCeleste & lou-spec

</div>

---

<div id="portuguese">

## Sobre

Uma plataforma completa de gestão fitness full-stack projetada para ginásios e personal trainers. O sistema disponibiliza planeamento completo de treinos, gestão de utilizadores, chat em tempo real e funcionalidade de check-in por código QR.

## Funcionalidades

- Autenticação segura com tokens JWT e encriptação bcrypt
- Controlo de acesso baseado em funções (Admin, Personal Trainer, Utilizador)
- Planeamento e gestão abrangente de treinos
- Biblioteca de exercícios com tutoriais em vídeo
- Geração de códigos QR para check-in no ginásio
- Sistema de chat em tempo real usando Socket.io
- Gestão de perfis de utilizadores
- Notificações por email via Nodemailer
- Armazenamento de media com integração Cloudinary
- UI responsiva com SCSS e Bootstrap
- Suite de testes com Jest e Supertest

## Tecnologias

### Frontend
- **React 18.2.0** - Biblioteca UI com ferramenta de build Vite
- **React Router** - Routing do lado do cliente
- **React Hook Form** - Gestão de formulários
- **SCSS** - Estilização
- **Bootstrap 5.3.8** - Componentes UI
- **SweetAlert2** - Alertas modernos
- **Recharts** - Visualização de dados
- **Swiper** - Componente carrossel
- **Socket.io Client** - Comunicação em tempo real

### Backend
- **Node.js** - Ambiente de execução
- **Express.js** - Framework web
- **Mongoose** - ODM para MongoDB
- **JWT** - Tokens de autenticação
- **Bcrypt** - Hash de passwords
- **Socket.io** - Servidor WebSocket
- **Nodemailer** - Serviço de email
- **Multer** - Gestão de upload de ficheiros
- **Cloudinary** - Gestão de media

### Base de Dados
- **MongoDB** - Base de dados NoSQL

### Testes
- **Jest** - Framework de testes
- **Supertest** - Testes HTTP
- **Vitest** - Testes unitários frontend

### Ferramentas Adicionais
- **Swagger** - Documentação da API
- **ESLint** - Linting de código
- **Cookie Parser** - Gestão de cookies
- **CORS** - Partilha de recursos entre origens

## Estrutura do Projeto

```
gym-produção/
├── backend/
│   ├── config/
│   │   └── cloudinary.js       # Configuração armazenamento media
│   ├── data/
│   │   ├── users/              # Camada de dados utilizadores
│   │   ├── workouts/           # Camada de dados treinos
│   │   └── chat/               # Camada de dados chat
│   ├── middleware/
│   │   └── token.js            # Verificação JWT
│   ├── server/
│   │   ├── auth.js             # Rotas autenticação
│   │   ├── users.js            # Gestão utilizadores
│   │   ├── workouts.js         # Gestão treinos
│   │   ├── chat.js             # Funcionalidade chat
│   │   └── swagger.js          # Docs API
│   ├── tests/                  # Suites de testes
│   └── index.js                # Ponto entrada servidor
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminPage/      # Dashboard admin
│   │   │   ├── PersonalPage/   # Dashboard trainer
│   │   │   ├── UserPage/       # Dashboard utilizador
│   │   │   ├── Login/          # Autenticação
│   │   │   └── Register/       # Registo utilizador
│   │   ├── contexts/           # Contextos React
│   │   ├── hooks/              # Hooks personalizados
│   │   └── utils/              # Funções utilitárias
│   └── tests/                  # Testes frontend
└── package.json
```

## Descrição das Funcionalidades Principais

### Autenticação & Autorização
- Autenticação baseada em JWT
- Encriptação de passwords com bcrypt
- Permissões baseadas em funções (Admin, Personal Trainer, Utilizador)
- Proteção de rotas seguras

### Gestão de Treinos
- Criar e atribuir planos de treino
- Biblioteca de exercícios com vídeos
- Rastreamento de séries (repetições, peso, tempo de descanso)
- Vista de calendário para agendamento de treinos
- Rastreamento de progresso

### Gestão de Utilizadores
- Dashboard admin para supervisão de utilizadores
- Gestão de clientes para personal trainers
- Personalização de perfil de utilizador
- Rastreamento de atividade

### Funcionalidades em Tempo Real
- Chat ao vivo entre utilizadores e trainers
- Integração Socket.io
- Notificações instantâneas

### Gestão de Media
- Integração Cloudinary para imagens/vídeos
- Vídeos demonstração de exercícios
- Fotografias de perfil
- Miniaturas de treinos

## Instalação

### Pré-requisitos
- Node.js 18+
- MongoDB
- npm ou yarn

### Configuração

1. Clonar o repositório
```bash
git clone https://github.com/lou-spec/gym.git
cd gym
```

2. Instalar dependências backend
```bash
cd backend
npm install
```

3. Instalar dependências frontend
```bash
cd ../frontend
npm install
```

4. Configurar variáveis de ambiente

Criar `.env` no diretório backend:
```env
MONGO_URI=string_conexao_mongodb
JWT_SECRET=segredo_jwt
CLOUDINARY_CLOUD_NAME=nome_cloud
CLOUDINARY_API_KEY=chave_api
CLOUDINARY_API_SECRET=segredo_api
EMAIL_USER=email
EMAIL_PASS=password_email
```

5. Iniciar servidor backend
```bash
cd backend
npm start
```

6. Iniciar servidor desenvolvimento frontend
```bash
cd frontend
npm start
```

Aplicação irá executar em `http://localhost:8100`

## Documentação da API

Aceder à documentação Swagger no endpoint `/api-docs` quando o servidor estiver a executar.

## Testes

### Executar testes backend
```bash
cd backend
npm test
```

### Executar testes frontend
```bash
cd frontend
npm test
```

## Deploy

A aplicação está configurada para deploy no Render.

### Backend
Fazer deploy do backend no Render com MongoDB Atlas

### Frontend
Fazer deploy do frontend no Vercel com variáveis de ambiente

## Demo ao Vivo

Website: [gym-pwa-three.vercel.app](https://gym-pwa-three.vercel.app/)

## Licença

Este projeto está licenciado sob a Licença MIT.

## Autores

ArpaoCeleste & lou-spec

</div>
