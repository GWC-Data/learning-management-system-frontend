import React from 'react';
import { useParams } from 'react-router-dom';
import { Course } from '../types';
import { Button } from '../../ui/button'; // Import Button from ShadCN
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../../ui/dialog'; // Import Dialog components


interface CourseDetailsProps {
  courses: Course[];
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ courses }) => {
  console.log('inside reute')
  const { courseId } = useParams();
  console.log('idd', courseId);
  const course = courses.find((course) => course.id.toString() === courseId);
  console.log('course', course);

  if (!course) {
    return (
      <div className="text-red-500 text-center text-xl mt-10">Course not found</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 rounded-lg border-2 border-gray-300 text-gray-700 mt-10 mb-10">
      <div className="text-center mb-6 flex flex-col items-center md:flex-row md:space-x-8 gap-48">
        {/* Course Title */}
        <h2 className="text-3xl font-semibold text-gray-800 mb-4 md:mb-0">{course.name}</h2>

        {/* Course Image */}
        <img
          src={course.image}
          alt={course.name}
          className="items-end justify-end mt-4 rounded-lg shadow-lg w-32 h-32 md:w-32 md:h-32 object-cover"
        />
      </div>

      <div className='grid grid-cols-2'>
          <div>
            <p className="text-lg text-gray-700 mb-6">{course.details}</p>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Syllabus</h3>
            <ul className="list-disc pl-6 space-y-2">
              {course.syllabus.map((item, index) => (
                <li key={index} className="text-gray-700 text-lg">{item}</li>
              ))}
            </ul>
          </div>
          <div>
            
          </div>
    
          
      </div>
      

      <div className="mt-8 text-center">
        {/* ShadCN Dialog Modal with Enroll Now Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="px-8 py-3 font-semibold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all">
              Enroll Now
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              Are you sure you want to enroll in this course?
            </DialogDescription>
            <div className="mt-4 flex justify-between">
              <Button
                variant="outline"
                onClick={() => console.log('Enrollment canceled')}
                className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={() => alert('You have enrolled in this course!')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default CourseDetails;
