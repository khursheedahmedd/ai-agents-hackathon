const axios = require('axios');

class FastAPIService {
  constructor() {
    this.baseUrl = process.env.FASTAPI_SERVER_URL || process.env.FLASK_SERVER_URL || 'http://127.0.0.1:8000';
    this.isFastAPI = this.baseUrl.includes('8000');
    this.timeout = 120000; // 2 minutes timeout
  }

  /**
   * Check if FastAPI backend is healthy
   */
  async checkHealth() {
    try {
      const healthEndpoint = this.isFastAPI 
        ? `${this.baseUrl}/api/v1/grading/health`
        : `${this.baseUrl}/health`;
      
      const response = await axios.get(healthEndpoint, {
        timeout: 5000
      });
      
      return {
        healthy: response.status === 200,
        status: response.status,
        data: response.data
      };
    } catch (error) {
      console.error('FastAPI health check failed:', error.message);
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Get service status
   */
  async getStatus() {
    try {
      if (!this.isFastAPI) {
        return { status: 'flask', healthy: true };
      }

      const response = await axios.get(`${this.baseUrl}/api/v1/grading/status`, {
        timeout: 5000
      });
      
      return {
        status: 'fastapi',
        healthy: response.status === 200,
        data: response.data
      };
    } catch (error) {
      console.error('FastAPI status check failed:', error.message);
      return {
        status: 'fastapi',
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Grade student answer
   */
  async gradeAnswer(formData) {
    try {
      const gradingEndpoint = this.isFastAPI 
        ? `${this.baseUrl}/api/v1/grading/grade-answer`
        : `${this.baseUrl}/api/grade_answer`;
      
      console.log(`Grading endpoint: ${gradingEndpoint}`);
      
      const response = await axios.post(gradingEndpoint, formData, {
        headers: formData.getHeaders(),
        timeout: this.timeout
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Grading request failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Generate Excel report
   */
  async generateExcel(submissions) {
    try {
      const excelEndpoint = this.isFastAPI 
        ? `${this.baseUrl}/api/v1/grading/generate-excel`
        : `${this.baseUrl}/api/generate_excel`;
      
      console.log(`Excel generation endpoint: ${excelEndpoint}`);
      
      const response = await axios.post(excelEndpoint, {
        submissions
      }, {
        timeout: 60000 // 1 minute timeout
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Excel generation failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Upload answer key and extract Q&A pairs
   */
  async uploadAnswerKey(formData) {
    try {
      if (!this.isFastAPI) {
        throw new Error('Answer key upload only supported with FastAPI backend');
      }

      const response = await axios.post(`${this.baseUrl}/api/v1/grading/upload-key`, formData, {
        headers: formData.getHeaders(),
        timeout: 60000
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Answer key upload failed:', error.message);
      return {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }
  }

  /**
   * Get backend information
   */
  getBackendInfo() {
    return {
      baseUrl: this.baseUrl,
      isFastAPI: this.isFastAPI,
      timeout: this.timeout
    };
  }
}

module.exports = new FastAPIService();
