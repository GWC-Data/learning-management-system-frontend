// import React from 'react';
// import { Link, useLocation } from 'react-router-dom';

// interface BreadcrumbProps {
//   courseName?: string;
//   batchName?: string;
// }

// const Breadcrumb: React.FC<BreadcrumbProps> = ({ courseName, batchName }) => {
//   const location = useLocation();

//   // ✅ Remove 'admin' from the URL
//   const pathnames = location.pathname
//     .split('/')
//     .filter((x) => x && x.toLowerCase() !== 'admin');

//   const breadcrumbMap: { [key: string]: string } = {
//     'courses': 'Course',
//     'batch-management': 'Batch Management',
//     'manage-batch-schedules': 'Manage Schedule',
//   };

//   return (
//     <div className="flex space-x-2 text-sm font-medium text-gray-500 my-4">
//       {/* ✅ Always show Course as root */}
//       <Link to="/admin/courses" className="text-blue-500 hover:underline">
//         Course
//       </Link>

//       {pathnames.map((value, index) => {
//         const isLast = index === pathnames.length - 1;
//         const displayName = breadcrumbMap[value] || value.replace('-', ' ');

//         return (
//           <div key={index} className="flex items-center space-x-2">
//             <span>/</span>
//             {value === 'batch-management' && courseName ? (
//               <Link to="/admin/batch-management" className="text-blue-500 hover:underline">
//                 {courseName}
//               </Link>
//             ) : value === 'manage-batch-schedules' && batchName ? (
//               <span className="text-gray-500">{batchName}</span>
//             ) : isLast ? (
//               <span className="text-gray-500">{displayName}</span>
//             ) : (
//               <Link to={`/${pathnames.slice(0, index + 1).join('/')}`} className="text-blue-500 hover:underline">
//                 {displayName}
//               </Link>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Breadcrumb;



import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ Remove 'admin' from the URL
  const pathnames: string[] = location.pathname
    .split('/')
    .filter((x) => x && x.toLowerCase() !== 'admin');

  // ✅ Manually Map The Correct Breadcrumb Paths
  const breadcrumbMap: { [key: string]: string } = {
    'courses': 'Course',
    'batch-management': 'Batch Management',
    'manage-batch-schedules': 'Manage Schedule',
    'course-assignment': 'Course Assignment',
    'attendance': 'Attendance',
    'course-category': 'Course Category',
  };

  // ✅ Handle Navigation
  const handleNavigation = (index: number) => {
    const pathTo = `/${pathnames.slice(0, index + 1).join('/')}`;
    navigate(pathTo);
  };

  return (
    <div className="flex space-x-2 text-sm font-medium text-gray-500 my-4">
      {/* ✅ Always Show Course as Root */}
      <Link
        to="/admin/courses"
        className="text-blue-500 hover:underline"
      >
        Course
      </Link>

      {pathnames.map((value: string, index: number) => {
        const isLast = index === pathnames.length - 1;
        const displayName = breadcrumbMap[value] || value.replace('-', ' ');

        // ✅ Special Logic to Prevent Batch Management from Disappearing
        if (value === 'manage-batch-schedules' && !pathnames.includes('batch-management')) {
          // ✅ Manually Inject Batch Management Breadcrumb
          return (
            <div key="batch-management" className="flex items-center space-x-2">
              <span>/</span>
              <Link
                to="/admin/batch-management"
                className="text-blue-500 hover:underline"
              >
                Batch Management
              </Link>
              <span>/</span>
              <span className="text-gray-500">
                Manage Schedule
              </span>
            </div>
          );
        }

        return (
          <div key={index} className="flex items-center space-x-2">
            <span>/</span>
            {isLast ? (
              <span className="text-gray-500">
                {displayName}
              </span>
            ) : (
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => handleNavigation(index)}
              >
                {displayName}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Breadcrumb;
