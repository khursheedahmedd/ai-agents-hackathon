# 🐠 Coral Protocol Integration for Smart Grade AI FastAPI

This document describes the Coral Protocol integration implemented in the Smart Grade AI FastAPI application, enabling multi-agent communication and orchestration for automated grading workflows.

## 🏗️ Architecture Overview

The Coral Protocol integration transforms the existing FastAPI grading system into a sophisticated multi-agent system where specialized agents communicate and coordinate through the Coral Server.

### Core Components

1. **Coral Server** - Central orchestration hub
2. **Coral Studio** - Web-based agent management interface
3. **MCP (Model Context Protocol)** - Communication layer between agents
4. **FastAPI Integration** - RESTful API endpoints for Coral workflows
5. **Specialized Agents** - Four Coral-compatible agents for different tasks

## 🤖 Coral Agents

### 1. OCR Agent (`coral-ocr-agent`)

- **Purpose**: Extract text from PDFs and images using Mistral Vision API
- **Tools**:
  - `extract_text_from_pdf` - Process PDF files
  - `extract_text_from_image` - Process image files
  - `process_document` - Universal document processor
- **Configuration**: Uses Mistral API for OCR processing

### 2. Grading Agent (`coral-grading-agent`)

- **Purpose**: Evaluate student answers against correct answers using rubrics
- **Tools**:
  - `grade_answer_with_rubric` - Rubric-based grading
  - `grade_simple_answer` - Simple criteria grading
  - `extract_qa_pairs` - Extract Q&A pairs from text
  - `process_text_with_gpt` - Structure text with GPT
- **Configuration**: Uses Azure OpenAI for intelligent grading

### 3. Feedback Agent (`coral-feedback-agent`)

- **Purpose**: Generate comprehensive student feedback and suggestions
- **Tools**:
  - `analyze_performance` - Analyze overall performance
  - `generate_suggestions` - Create improvement suggestions
  - `create_comprehensive_feedback` - Generate detailed feedback reports
  - `generate_encouragement` - Create motivational messages
- **Configuration**: Uses Azure OpenAI for feedback generation

### 4. Document Agent (`coral-document-agent`)

- **Purpose**: Process documents and extract structured Q&A pairs
- **Tools**:
  - `process_text_with_gpt` - Structure text with GPT
  - `extract_qa_pairs` - Extract Q&A pairs
  - `structure_document_content` - Organize document content
  - `validate_qa_pairs` - Validate and clean Q&A pairs
- **Configuration**: Uses Azure OpenAI for text processing

## 🚀 Quick Start

### Prerequisites

1. **Coral Server** - Must be running on `http://localhost:8080`
2. **Coral Studio** - Available at `http://localhost:3000`
3. **Environment Configuration** - Copy `env.example` to `.env` and configure

### Required Environment Variables

```bash
# Coral Protocol Configuration
CORAL_SSE_URL=http://localhost:8080/sse
CORAL_MAIN_AGENT_ID=fastapi-grading-system
CORAL_OCR_AGENT_ID=ocr-agent
CORAL_GRADING_AGENT_ID=grading-agent
CORAL_FEEDBACK_AGENT_ID=feedback-agent
CORAL_DOCUMENT_AGENT_ID=document-agent
CORAL_ORCHESTRATION_RUNTIME=production
TIMEOUT_MS=30000

# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name

# Mistral API Configuration
MISTRAL_API_KEY=your_mistral_api_key
```

### Starting the System

1. **Start Coral Server** (from Multi-Agent-Demo directory):

   ```bash
   cd Multi-Agent-Demo
   ./start-server.sh
   ```

2. **Start Coral Studio**:

   ```bash
   cd Multi-Agent-Demo
   ./start-studio.sh
   ```

3. **Start Coral Agents**:

   ```bash
   cd fastapi
   ./start-coral-agents.sh
   ```

4. **Start FastAPI Application**:
   ```bash
   cd fastapi
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## 📡 API Endpoints

### Coral Protocol Endpoints

| Endpoint                                 | Method | Description                            |
| ---------------------------------------- | ------ | -------------------------------------- |
| `/api/v1/coral/health`                   | GET    | Health check for Coral integration     |
| `/api/v1/coral/status`                   | GET    | Detailed Coral service status          |
| `/api/v1/coral/grade-with-coral`         | POST   | Grade using Coral multi-agent workflow |
| `/api/v1/coral/process-document`         | POST   | Process document using Coral agents    |
| `/api/v1/coral/agent-status`             | GET    | Get status of all Coral agents         |
| `/api/v1/coral/initialize-agents`        | POST   | Manually initialize Coral agents       |
| `/api/v1/coral/test-agent-communication` | POST   | Test agent communication               |

### Example Usage

#### Grade with Coral Protocol

```bash
curl -X POST "http://localhost:8000/api/v1/coral/grade-with-coral" \
  -H "Content-Type: multipart/form-data" \
  -F "answer_file=@student_answer.pdf" \
  -F "key_file=@answer_key.pdf" \
  -F "rubric={\"questions\":[{\"questionNumber\":1,\"questionText\":\"Question 1\",\"totalMarks\":10,\"rubric\":{\"accuracy\":\"50%\",\"completeness\":\"30%\",\"clarity\":\"20%\"}}]}" \
  -F "student_name=John Doe" \
  -F "exam_title=Math Assessment"
```

#### Process Document

```bash
curl -X POST "http://localhost:8000/api/v1/coral/process-document" \
  -H "Content-Type: multipart/form-data" \
  -F "document_file=@document.pdf" \
  -F "processing_type=qa_extraction"
```

#### Check Agent Status

```bash
curl -X GET "http://localhost:8000/api/v1/coral/agent-status"
```

## 🔄 Workflow Process

### Grading Workflow

1. **Document Processing**: OCR and Document agents extract and structure Q&A pairs
2. **Answer Grading**: Grading agent compares student answers against answer keys
3. **Feedback Generation**: Feedback agent creates comprehensive feedback
4. **Response Synthesis**: FastAPI combines all agent responses into final result

### Agent Communication Flow

```
FastAPI Request → Coral Service → Agent Thread → Agent Mentions → Agent Responses → Response Synthesis → FastAPI Response
```

## 🛠️ Development

### Agent Development

Each agent is located in `agents/coral-{agent-name}-agent/` with:

- `coral-agent.toml` - Agent configuration
- `main.py` - Agent implementation
- `run_agent.sh` - Startup script

### Adding New Agents

1. Create agent directory: `agents/coral-new-agent/`
2. Add configuration: `coral-agent.toml`
3. Implement agent: `main.py`
4. Create startup script: `run_agent.sh`
5. Update registry: `coral-registry.toml`
6. Update environment variables

### Testing

```bash
# Test agent communication
curl -X POST "http://localhost:8000/api/v1/coral/test-agent-communication"

# Check health
curl -X GET "http://localhost:8000/api/v1/coral/health"
```

## 🔧 Configuration

### Agent Configuration (`coral-agent.toml`)

```toml
[agent]
name = "agent-name"
version = "1.0.0"
description = "Agent description"

[options.MODEL_API_KEY]
type = "string"
description = "API key for the model provider"

[runtimes.executable]
command = ["python", "main.py"]
```

### Registry Configuration (`coral-registry.toml`)

```toml
[[local-agent]]
path = "agents/coral-ocr-agent"

[[local-agent]]
path = "agents/coral-grading-agent"
```

## 🐛 Troubleshooting

### Common Issues

1. **Agents not connecting**:

   - Check Coral Server is running
   - Verify `CORAL_SSE_URL` is correct
   - Check agent environment variables

2. **Agent communication failures**:

   - Verify all agents are registered in Coral Server
   - Check agent thread creation
   - Monitor agent logs

3. **Grading workflow errors**:
   - Check file upload permissions
   - Verify rubric format
   - Monitor agent responses

### Debugging

1. **Check agent status**:

   ```bash
   curl -X GET "http://localhost:8000/api/v1/coral/agent-status"
   ```

2. **Test communication**:

   ```bash
   curl -X POST "http://localhost:8000/api/v1/coral/test-agent-communication"
   ```

3. **Monitor Coral Studio**: Visit `http://localhost:3000`

## 📊 Monitoring

### Health Checks

- **FastAPI Health**: `/api/v1/coral/health`
- **Agent Status**: `/api/v1/coral/agent-status`
- **Coral Studio**: `http://localhost:3000`

### Logs

- Agent logs are written to console
- FastAPI logs include Coral integration events
- Coral Server logs available in Multi-Agent-Demo directory

## 🚀 Production Deployment

### Docker Deployment

1. Build agent containers
2. Deploy Coral Server
3. Configure environment variables
4. Start all services

### Scaling

- Agents can be scaled independently
- Coral Server handles load balancing
- FastAPI can be scaled horizontally

## 📚 Additional Resources

- [Coral Protocol Documentation](https://docs.coralprotocol.org/)
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/)
- [LangChain MCP Adapters](https://github.com/langchain-ai/langchain-mcp-adapters)

## 🤝 Contributing

1. Follow existing agent patterns
2. Update documentation
3. Add tests for new functionality
4. Ensure backward compatibility

---

**Note**: This integration maintains full backward compatibility with existing FastAPI endpoints while adding powerful multi-agent capabilities through Coral Protocol.
