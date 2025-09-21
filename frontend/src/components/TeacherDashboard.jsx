import React, { useEffect, useState } from "react";
import axios from "axios";
import AddFolderForm from "./AddFolderForm";

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null); // Track selected class
  const [toggleFolder, setToggleFolder] = useState(false);


  const folderToggle = (classId) => {
    setToggleFolder(true);
    setSelectedClass(classId);
  };
  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const teacherEmail = "muskan@example.com"; // Replace with the actual teacher's email
        const response = await axios.get(
          "http://localhost:3000/api/teachers/details",
          {
            params: {
              teacherEmail: teacherEmail,
            },
          }
        );

        setTeacher(response.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, []);

  const handleClassClick = async (classId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/classes/${classId}/folders`
      );
      setSelectedClass({ id: classId, folders: response.data });
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="pt-[12rem] pb-[12rem]">
      <h1>Teacher Dashboard</h1>
      {teacher ? (
        <div>
          <div className="pt-8 ">
            {teacher.classes.map((cls) => (
              <div key={cls._id}>
                <h4
                  onClick={() => folderToggle(cls._id)}
                  className="border-3 p-4 border-black cursor-pointer "
                >
                  {cls.className}
                </h4>
              </div>
            ))}
          </div>

          {toggleFolder && <AddFolderForm classId={selectedClass} />}
          {/* {selectedClass && (
                        <div>
                            <h3>Folders for Selected Class</h3>
                            <div>
                                {selectedClass.folders.map((folder) => (
                                    <div key={folder._id}>
                                        <h4>{folder.name}</h4>
                                        <p>{folder.description}</p>
                                        <a href={folder.questionFile} target="_blank" rel="noopener noreferrer">
                                            Download Question File
                                        </a>
                                        <a href={folder.keyFile} target="_blank" rel="noopener noreferrer">
                                            Download Key File
                                        </a>
                                    </div>
                                ))}
                            </div>
                           
                           
                        </div>
                    )} */}
        </div>
      ) : (
        <p>No teacher data available.</p>
      )}
    </div>
  );
};

export default TeacherDashboard;
