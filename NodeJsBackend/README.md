# 🚀 Smart Grade AI - Node.js Backend

## 📋 **Overview**

This is the main backend service for Smart Grade AI, built with Node.js and Express. It handles user management, file operations, database interactions, and integrates with the FastAPI AI grading service.

## 🏗️ **Architecture**

```
Frontend (React/Vite)
    ↓
Node.js Backend (This Service)
    ↓ (calls FastAPI)
FastAPI Backend (AI Grading)
    ↓ (returns results)
Node.js Backend (saves to database)
    ↓
MongoDB (Cosmos DB)
```

## 🔧 **Features**

### **Core Functionality**

- **User Management**: Teacher and student authentication via Clerk
- **Class Management**: Create and manage classes
- **Assessment Management**: Create folders and assessments
- **File Handling**: Upload and manage files via Cloudinary
- **AI Integration**: Seamless integration with FastAPI AI service
- **Database Operations**: MongoDB/Cosmos DB integration

### **AI Integration**

- **Grading**: Automatic AI-powered answer grading
- **Excel Generation**: Generate detailed Excel reports
- **Answer Key Processing**: Extract Q&A pairs from answer keys
- **Health Monitoring**: Monitor FastAPI service health

## 🚀 **Quick Start**

### **1. Prerequisites**

- Node.js 18+
- MongoDB/Cosmos DB
- Cloudinary account
- Clerk account
- FastAPI backend running

### **2. Installation**

```bash
# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Edit environment variables
nano .env
```

### **3. Environment Configuration**

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
COSMOS_DB_CONNECTION_STRING=your_cosmos_connection_string

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Clerk Authentication
CLERK_SECRET_KEY=your_clerk_secret_key

# FastAPI Integration
FASTAPI_SERVER_URL=http://localhost:8000
```

### **4. Start the Server**

```bash
# Development
npm run dev

# Production
npm start
```

## 🔌 **API Endpoints**

### **Authentication**

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/users/me` - Get current user info

### **Teachers**

- `POST /api/teachers` - Create teacher
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `POST /api/teachers/generate-excel` - Generate Excel report

### **Students**

- `POST /api/students` - Create student
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `POST /api/students/submit-task` - Submit assignment

### **Classes**

- `POST /api/classes` - Create class
- `GET /api/classes` - Get all classes
- `GET /api/classes/:id` - Get class by ID
- `PUT /api/classes/:id` - Update class
- `DELETE /api/classes/:id` - Delete class

### **Folders/Assessments**

- `POST /api/folders` - Create assessment folder
- `GET /api/folders` - Get all folders
- `GET /api/folders/:id` - Get folder by ID
- `PUT /api/folders/:id` - Update folder
- `DELETE /api/folders/:id` - Delete folder

### **Answer Keys**

- `POST /api/answer-keys/upload-key` - Upload answer key

### **Health Checks**

- `GET /` - Basic health check
- `GET /api/health/fastapi` - FastAPI integration health
- `GET /api/health/detailed` - Detailed system health

## 🤖 **FastAPI Integration**

### **Service Configuration**

The Node.js backend automatically detects and uses the FastAPI backend:

```javascript
// Automatic backend detection
const fastapiUrl =
  process.env.FASTAPI_SERVER_URL || process.env.FLASK_SERVER_URL;
const isFastAPI = fastapiUrl.includes("8000");
```

### **Grading Flow**

1. Student submits answer via frontend
2. Node.js uploads file to Cloudinary
3. Node.js calls FastAPI for grading
4. FastAPI processes with AI and returns results
5. Node.js saves results to database
6. Node.js returns results to frontend

### **Excel Generation Flow**

1. Teacher requests Excel report
2. Node.js collects submission data
3. Node.js calls FastAPI for Excel generation
4. FastAPI generates Excel and uploads to Cloudinary
5. Node.js returns Excel URL to frontend

## 🧪 **Testing**

### **Run Integration Tests**

```bash
# Test Node.js + FastAPI integration
npm test

# Test FastAPI backend only
npm run test:fastapi
```

### **Manual Testing**

```bash
# Test Node.js health
curl http://localhost:3000/

# Test FastAPI integration
curl http://localhost:3000/api/health/fastapi

# Test detailed health
curl http://localhost:3000/api/health/detailed
```

## 📊 **Health Monitoring**

### **Health Check Endpoints**

- **Basic**: `GET /` - Simple health check
- **FastAPI Integration**: `GET /api/health/fastapi` - Check FastAPI connectivity
- **Detailed**: `GET /api/health/detailed` - Complete system status

### **Health Response Format**

```json
{
  "nodejs": {
    "status": "healthy",
    "timestamp": "2024-01-01T00:00:00.000Z"
  },
  "fastapi": {
    "healthy": true,
    "status": "healthy",
    "backend_info": {
      "baseUrl": "http://localhost:8000",
      "isFastAPI": true,
      "timeout": 120000
    }
  }
}
```

## 🔧 **Configuration**

### **Environment Variables**

| Variable                      | Description              | Default                 |
| ----------------------------- | ------------------------ | ----------------------- |
| `NODE_ENV`                    | Environment mode         | `development`           |
| `PORT`                        | Server port              | `3000`                  |
| `COSMOS_DB_CONNECTION_STRING` | MongoDB connection       | Required                |
| `CLOUDINARY_CLOUD_NAME`       | Cloudinary cloud name    | Required                |
| `CLOUDINARY_API_KEY`          | Cloudinary API key       | Required                |
| `CLOUDINARY_API_SECRET`       | Cloudinary API secret    | Required                |
| `CLERK_SECRET_KEY`            | Clerk authentication key | Required                |
| `FASTAPI_SERVER_URL`          | FastAPI backend URL      | `http://localhost:8000` |

### **FastAPI Service Configuration**

The FastAPI service automatically configures itself based on the environment:

```javascript
// FastAPI Service Configuration
{
  baseUrl: process.env.FASTAPI_SERVER_URL || process.env.FLASK_SERVER_URL,
  isFastAPI: baseUrl.includes('8000'),
  timeout: 120000 // 2 minutes for AI processing
}
```

## 🚀 **Deployment**

### **Docker Deployment**

```bash
# Build image
docker build -t smart-grade-nodejs .

# Run container
docker run -p 3000:3000 smart-grade-nodejs
```

### **Docker Compose**

```bash
# Start all services
docker-compose up --build
```

### **Azure Container Apps**

```bash
# Deploy to Azure
az containerapp create --name nodejs-backend --resource-group your-rg
```

## 🔍 **Troubleshooting**

### **Common Issues**

#### **1. FastAPI Connection Failed**

```bash
# Check if FastAPI is running
curl http://localhost:8000/health

# Check Node.js logs
npm run dev
```

#### **2. Database Connection Issues**

```bash
# Check MongoDB connection
# Verify COSMOS_DB_CONNECTION_STRING
```

#### **3. File Upload Issues**

```bash
# Check Cloudinary configuration
# Verify CLOUDINARY_* environment variables
```

#### **4. Authentication Issues**

```bash
# Check Clerk configuration
# Verify CLERK_SECRET_KEY
```

### **Debug Mode**

```bash
# Enable debug logging
DEBUG=* npm run dev
```

## 📝 **API Documentation**

### **Request/Response Examples**

#### **Submit Task**

```javascript
// Request
POST /api/students/submit-task
Content-Type: multipart/form-data

{
  "taskName": "Math Assignment",
  "folderId": "folder123",
  "answerFile": <file>,
  "studentName": "John Doe",
  "studentEmail": "john@example.com"
}

// Response
{
  "message": "Task submitted successfully",
  "taskId": "task123",
  "gradingResults": { ... }
}
```

#### **Generate Excel**

```javascript
// Request
POST /api/teachers/generate-excel
Content-Type: application/json

{
  "folderId": "folder123"
}

// Response
{
  "excelUrl": "https://cloudinary.com/excel-file.xlsx"
}
```

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 **License**

This project is licensed under the ISC License.

## 🆘 **Support**

For issues and support:

1. Check the troubleshooting section
2. Review the logs
3. Test the integration
4. Create an issue with detailed information
