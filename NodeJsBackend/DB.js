const mongoose = require('mongoose');

/**
 * Connect to Azure Cosmos DB using Mongoose.
 * @param {string} connectionString - The connection string for Azure Cosmos DB.
 */
const connectToDatabase = async (connectionString) => {
    try {
        await mongoose.connect(connectionString, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            retryWrites: false, // Set to true if you want to enable retry writes
        });
      
    } catch (error) {
        console.error('Connection error:', error);
        throw error; // Rethrow the error for further handling if needed
    }
};

module.exports = { connectToDatabase };