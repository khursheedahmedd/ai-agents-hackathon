# Smart Grade AI - Detailed Architecture Diagram

## System Overview

Smart Grade AI is a comprehensive AI-powered educational assessment platform that uses Coral Protocol for multi-agent orchestration. The system consists of a React frontend, Node.js backend, FastAPI grading service, and multiple Coral agents working together to provide intelligent document processing, automated grading, and personalized feedback.

## Detailed Architecture Diagram

```mermaid
graph TB
    %% User Layer
    subgraph "User Layer"
        T[👨‍🏫 Teacher]
        S[👨‍🎓 Student]
        A[👤 Admin]
    end

    %% Frontend Layer
    subgraph "Frontend Layer - React + Vite"
        FE[React Frontend<br/>Port: 5173]

        subgraph "Frontend Components"
            HOME[Home Page]
            LOGIN[Login/Signup]
            TDASH[Teacher Dashboard]
            SDASH[Student Dashboard]
            UPLOAD[Upload Papers]
            ASSESS[Assessments]
        end

        subgraph "Frontend Libraries"
            TAILWIND[Tailwind CSS]
            FRAMER[Framer Motion]
            CHART[Chart.js/Recharts]
            CLERK_AUTH[Clerk Auth]
            FILE_PROC[Mammoth/XLSX]
        end
    end

    %% Authentication Layer
    subgraph "Authentication - Clerk"
        CLERK[Clerk Service<br/>🔐 Authentication & Authorization]
    end

    %% Backend Services Layer
    subgraph "Backend Services"
        subgraph "Node.js Backend - Port 3000"
            NODE[Node.js + Express<br/>📊 User Management & API Gateway]

            subgraph "Node.js Modules"
                USER_MGMT[User Management]
                CLASS_MGMT[Class Management]
                FILE_MGMT[File Management]
                WEBHOOK[Webhooks]
                HEALTH[Health Checks]
            end

            subgraph "Node.js Services"
                FASTAPI_SVC[FastAPI Service<br/>🔗 Integration Layer]
            end
        end

        subgraph "FastAPI Backend - Port 8000"
            FASTAPI[FastAPI + Python<br/>🤖 AI Processing Engine]

            subgraph "FastAPI Modules"
                GRADING_API[Grading API]
                OCR_API[OCR API]
                HEALTH_API[Health API]
                CORAL_API[Coral API]
            end

            subgraph "FastAPI Services"
                OCR_SVC[OCR Service]
                GRADING_SVC[Grading Service]
                FEEDBACK_SVC[Feedback Service]
                CORAL_SVC[Coral Service]
                NODE_INT[Node Integration]
            end
        end
    end

    %% Coral Protocol Layer
    subgraph "Coral Protocol - Multi-Agent System"
        CORAL_SERVER[Coral Server<br/>Port: 8080<br/>🔄 Agent Orchestration]

        subgraph "Coral Agents"
            OCR_AGENT[OCR Agent<br/>🖼️ Document Processing]
            GRADING_AGENT[Grading Agent<br/>📝 Answer Evaluation]
            FEEDBACK_AGENT[Feedback Agent<br/>💬 Student Feedback]
            DOCUMENT_AGENT[Document Agent<br/>📄 Report Generation]
        end

        subgraph "Agent Communication"
            MCP[MCP Protocol<br/>📡 Inter-Agent Communication]
            SSE[Server-Sent Events<br/>⚡ Real-time Updates]
        end
    end

    %% AI Services Layer
    subgraph "AI Services"
        subgraph "Azure OpenAI"
            AZURE_OPENAI[Azure OpenAI GPT-4<br/>🧠 Core AI Processing]
        end

        subgraph "Mistral AI"
            MISTRAL[Mistral Vision API<br/>👁️ OCR Processing]
        end

        subgraph "Cloud Storage"
            CLOUDINARY[Cloudinary<br/>☁️ File Storage & CDN]
        end
    end

    %% Database Layer
    subgraph "Database Layer"
        COSMOS[Azure Cosmos DB<br/>MongoDB API<br/>💾 Primary Database]

        subgraph "Database Collections"
            USERS[Users Collection]
            TEACHERS[Teachers Collection]
            STUDENTS[Students Collection]
            CLASSES[Classes Collection]
            ASSESSMENTS[Assessments Collection]
            SUBMISSIONS[Submissions Collection]
        end
    end

    %% External Integrations
    subgraph "External Services"
        AZURE_DEPLOY[Azure Container Apps<br/>🚀 Production Deployment]
        WEBHOOKS[Webhook Endpoints<br/>🔗 External Integrations]
    end

    %% Data Flow Connections
    T --> FE
    S --> FE
    A --> FE

    FE --> CLERK
    CLERK --> NODE
    FE --> NODE

    NODE --> COSMOS
    NODE --> FASTAPI_SVC
    FASTAPI_SVC --> FASTAPI

    FASTAPI --> CORAL_SVC
    CORAL_SVC --> CORAL_SERVER

    CORAL_SERVER --> OCR_AGENT
    CORAL_SERVER --> GRADING_AGENT
    CORAL_SERVER --> FEEDBACK_AGENT
    CORAL_SERVER --> DOCUMENT_AGENT

    OCR_AGENT --> MISTRAL
    GRADING_AGENT --> AZURE_OPENAI
    FEEDBACK_AGENT --> AZURE_OPENAI
    DOCUMENT_AGENT --> AZURE_OPENAI

    FASTAPI --> CLOUDINARY
    NODE --> CLOUDINARY

    CORAL_SERVER --> MCP
    CORAL_SERVER --> SSE

    FASTAPI --> NODE_INT
    NODE_INT --> NODE

    %% Styling with better text visibility
    classDef userClass fill:#e3f2fd,stroke:#0277bd,stroke-width:3px,color:#000000
    classDef frontendClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000000
    classDef backendClass fill:#e8f5e8,stroke:#388e3c,stroke-width:3px,color:#000000
    classDef coralClass fill:#fff8e1,stroke:#f57c00,stroke-width:3px,color:#000000
    classDef aiClass fill:#fce4ec,stroke:#c2185b,stroke-width:3px,color:#000000
    classDef dbClass fill:#e0f2f1,stroke:#00695c,stroke-width:3px,color:#000000
    classDef externalClass fill:#f1f8e9,stroke:#558b2f,stroke-width:3px,color:#000000

    class T,S,A userClass
    class FE,HOME,LOGIN,TDASH,SDASH,UPLOAD,ASSESS,TAILWIND,FRAMER,CHART,CLERK_AUTH,FILE_PROC frontendClass
    class NODE,FASTAPI,USER_MGMT,CLASS_MGMT,FILE_MGMT,WEBHOOK,HEALTH,FASTAPI_SVC,GRADING_API,OCR_API,HEALTH_API,CORAL_API,OCR_SVC,GRADING_SVC,FEEDBACK_SVC,CORAL_SVC,NODE_INT backendClass
    class CORAL_SERVER,OCR_AGENT,GRADING_AGENT,FEEDBACK_AGENT,DOCUMENT_AGENT,MCP,SSE coralClass
    class AZURE_OPENAI,MISTRAL,CLOUDINARY aiClass
    class COSMOS,USERS,TEACHERS,STUDENTS,CLASSES,ASSESSMENTS,SUBMISSIONS dbClass
    class CLERK,AZURE_DEPLOY,WEBHOOKS externalClass
```

## Key Architecture Components

### 1. Frontend Layer (React + Vite)

- **Framework**: React 18 with Vite for fast development
- **UI**: Tailwind CSS with Framer Motion animations
- **Authentication**: Clerk integration for user management
- **File Processing**: Mammoth for .docx, XLSX for Excel files
- **Charts**: Chart.js and Recharts for data visualization

### 2. Backend Services

#### Node.js Backend (Port 3000)

- **Role**: API Gateway and User Management
- **Features**: User authentication, class management, file handling
- **Integration**: Communicates with FastAPI for AI processing
- **Database**: Azure Cosmos DB with MongoDB API

#### FastAPI Backend (Port 8000)

- **Role**: AI Processing Engine
- **Features**: Document processing, grading, feedback generation
- **AI Integration**: Azure OpenAI GPT-4, Mistral Vision API
- **Coral Integration**: Orchestrates multi-agent workflows

### 3. Coral Protocol Multi-Agent System

#### Coral Server (Port 8080)

- **Role**: Agent orchestration and communication hub
- **Protocol**: MCP (Model Context Protocol) for inter-agent communication
- **Real-time**: Server-Sent Events for live updates

#### Specialized Agents

1. **OCR Agent**: Document text extraction using Mistral Vision
2. **Grading Agent**: Answer evaluation against rubrics using GPT-4
3. **Feedback Agent**: Personalized student feedback generation
4. **Document Agent**: Report formatting and metadata extraction

### 4. AI Services Integration

- **Azure OpenAI**: GPT-4 for core AI processing (grading, feedback)
- **Mistral Vision**: OCR and document image processing
- **Cloudinary**: File storage, image processing, and CDN

### 5. Database Architecture

- **Azure Cosmos DB**: Primary database with MongoDB API
- **Collections**: Users, Teachers, Students, Classes, Assessments, Submissions
- **Scalability**: Globally distributed, auto-scaling

## Data Flow Architecture

### 1. Document Upload & Processing Flow

```
User Upload → Node.js → FastAPI → Coral Server → OCR Agent → Mistral Vision
                                                         ↓
Grading Results ← Node.js ← FastAPI ← Coral Server ← Grading Agent ← Azure OpenAI
```

### 2. Multi-Agent Workflow

```
Document Input → OCR Agent (Text Extraction)
                    ↓
Grading Agent (Answer Evaluation)
                    ↓
Feedback Agent (Student Feedback)
                    ↓
Document Agent (Report Generation)
```

### 3. Authentication & Authorization Flow

```
User Login → Clerk Authentication → Node.js (Role Assignment) → Frontend (Protected Routes)
```

## Technology Stack Summary

| Layer               | Technology                         | Purpose                  |
| ------------------- | ---------------------------------- | ------------------------ |
| Frontend            | React 18 + Vite                    | User Interface           |
| UI Framework        | Tailwind CSS + Framer Motion       | Styling & Animations     |
| Authentication      | Clerk                              | User Management          |
| API Gateway         | Node.js + Express                  | Backend Services         |
| AI Engine           | FastAPI + Python                   | AI Processing            |
| Agent Orchestration | Coral Protocol                     | Multi-Agent Coordination |
| AI Models           | Azure OpenAI GPT-4, Mistral Vision | AI Processing            |
| Database            | Azure Cosmos DB (MongoDB API)      | Data Storage             |
| File Storage        | Cloudinary                         | File Management          |
| Deployment          | Azure Container Apps               | Cloud Deployment         |

## Key Features

1. **Multi-Agent Architecture**: Coral Protocol enables specialized agents to work together
2. **Intelligent Document Processing**: OCR, grading, and feedback generation
3. **Role-Based Access**: Teacher and student dashboards with appropriate permissions
4. **Real-time Communication**: Server-Sent Events for live updates
5. **Scalable Cloud Architecture**: Azure-based deployment with auto-scaling
6. **Comprehensive API**: RESTful APIs for all major operations
7. **File Format Support**: PDF, DOCX, images, Excel files
8. **Advanced Analytics**: Chart.js integration for performance insights

This architecture provides a robust, scalable, and intelligent educational assessment platform that can handle complex grading workflows while maintaining high performance and user experience.
