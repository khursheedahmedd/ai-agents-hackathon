const cloudinary = require('././../cloudinaryConfig');
const streamifier = require('streamifier');
const Folder = require('../Models/Folder');
const Class = require('../Models/Classs');

// Function to upload files to Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: 'auto', folder },
            (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
    });
};

// Add a folder to a class
const addFolderToClass = async (req, res) => {
    console.log("controller working ");
    // try {
    //     const { classId } = req.params;
    //     const { name, description } = req.body;
    //      console.log(req.body)
    //     const questionFile = req.files['questionFile']?.[0];
    //     const keyFile = req.files['keyFile']?.[0];

    //     let questionFileUrl = '';
    //     let keyFileUrl = '';

    //     if (questionFile) {
    //         questionFileUrl = await uploadToCloudinary(questionFile.buffer, 'question_files');
    //     }

    //     if (keyFile) {
    //         keyFileUrl = await uploadToCloudinary(keyFile.buffer, 'key_files');
    //     }

    //     // Create a new folder
    //     const newFolder = new Folder({
    //         name,
    //         description,
    //         questionFile: questionFileUrl,
    //         keyFile: keyFileUrl,
    //         class: classId
    //     });

    //     await newFolder.save();

    //     // Add folder to class
    //     const classToUpdate = await Class.findById(classId);
    //     if (!classToUpdate) {
    //         return res.status(404).json({ message: 'Class not found' });
    //     }

    //     classToUpdate.folders.push(newFolder._id);
    //     await classToUpdate.save();

    //     res.status(201).json({ message: 'Folder added successfully', folder: newFolder });
    // } catch (error) {
    //     console.error('Error adding folder:', error);
    //     res.status(500).json({ message: 'Server error' });
    // }
};

module.exports = {
 addFolderToClass
};