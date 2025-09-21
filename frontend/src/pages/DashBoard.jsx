import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import TeacherDashboard from '../components/TeacherDashboard'
import StudentDashboard from '../components/StudentDashboard';

export default function Dashboard() {
  const { user } = useUser();
  const [role, setRole] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 p-8"
    >
      <div className="max-w-7xl mx-auto">
        {user?.unsafeMetadata.role === 'teacher' ? (
          console.log('Role: ' + user.publicMetadata.role),
          <TeacherDashboard />
        ) : (
          <StudentDashboard />
        )}
      </div>
    </motion.div>
  );
}