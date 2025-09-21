import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css"; // Import Toastify styles


const AddFolderForm = ({ classId }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [questionFile, setQuestionFile] = useState(null);
    const [keyFile, setKeyFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('questionFile', questionFile);
        formData.append('keyFile', keyFile);
        formData.append('classId',classId)

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_NODE_SERVER_URL}/api/folders/add-folder`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            toast.success('Class added successfully!', { autoClose: 3000 });
            console.log(response.data);
            // Reset form fields
            setName('');
            setDescription('');
            setQuestionFile(null);
            setKeyFile(null);
        } catch (error) {
            console.error('Error adding folder:', error);
            setError('Failed to add folder. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <h2 className="text-xl font-bold mb-4">Add Folder</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Folder Name:</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Description:</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded"
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Question File:</label>
                <input
                    type="file"
                    onChange={(e) => setQuestionFile(e.target.files[0])}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Key File:</label>
                <input
                    type="file"
                    onChange={(e) => setKeyFile(e.target.files[0])}
                    className="w-full p-2 border border-gray-300 rounded"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
                {loading ? 'Adding...' : 'Add Folder'}
            </button>
        </form>
    );
};

export default AddFolderForm;