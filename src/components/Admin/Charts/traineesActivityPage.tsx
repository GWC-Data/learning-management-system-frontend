import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Table as TableIcon, BarChart } from 'lucide-react';


import { fetchCourseModuleApi } from '@/helpers/api/courseModuleApi';
import { fetchAssignmentCompletionsApi } from '@/helpers/api/assignmentCompletionsApi';

Chart.register(...registerables);

interface ModuleData {
  moduleName: string;
  daysPresent: number;
  totalDays: number;
  gradePercentage: number;
}

interface AssessmentData {
  assessmentName: string;
  score: number;
}

const TraineesActivityPage: React.FC = () => {
  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [moduleData, setModuleData] = useState<ModuleData[]>([]);
  const [assessmentData, setAssessmentData] = useState<AssessmentData[]>([]);
  const [totalAssignments, setTotalAssignments] = useState(0);
  const [feedback, setFeedback] = useState({
    communication: '',
    technical: '',
    logicalThinking: '',
    overall: '',
  });

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const moduleResponse = await fetchCourseModuleApi();
  
        if (!Array.isArray(moduleResponse)) {
          console.error("Invalid module response:", moduleResponse);
          return;
        }
  
        // Extract necessary fields from API response
        const modules = moduleResponse.map((module: any) => ({
          moduleName: module.moduleName,
          daysPresent: module.daysPresent ?? Math.floor(Math.random() * 20) + 1, // Fallback random data
          totalDays: module.totalDays ?? 20, // Assuming totalDays is 20 by default
          gradePercentage: module.gradePercentage ?? Math.floor(Math.random() * 100), // Fallback random grade
        }));
  
        const assignmentsResponse = await fetchAssignmentCompletionsApi();
        console.log("Assignments API Response:", assignmentsResponse); // Debugging
  
        // Ensure `Assignments` exists and is an array before filtering
        const assignmentCount = Array.isArray(assignmentsResponse?.Assignments)
          ? assignmentsResponse.Assignments.filter(
              (assign: any) => assign.courseAssignmentAnswerFile
            ).length
          : 0;
  
        console.log("Total Assignments Submitted:", assignmentCount);
  
        setTotalAssignments(assignmentCount);
        setModuleData(modules);
      } catch (error) {
        console.error("Error fetching module data:", error);
      }
    };
    const dummyAssessments = [
      { assessmentName: 'Assessment 1', score: 78 },
      { assessmentName: 'Assessment 2', score: 85 },
      { assessmentName: 'Assessment 3', score: 92 },
      { assessmentName: 'Assessment 4', score: 74 },
      { assessmentName: 'Assessment 5', score: 88 },
    ];

    setAssessmentData(dummyAssessments);

    fetchModules();
  }, []);


  // Attendance Chart Data
  const attendanceChartData = {
    labels: moduleData.map((item) => item.moduleName),
    datasets: [
      {
        label: 'Attendance Percentage',
        data: moduleData.map((item) => (item.daysPresent / item.totalDays) * 100),
        backgroundColor: '#16D9EC',
        borderColor: '#16D9EB',
        borderWidth: 1,
      },
    ],
  };

  // Assignment Chart Data
  const assignmentChartData = {
    labels: moduleData.map((item) => item.moduleName),
    datasets: [
      {
        label: 'Assignment Grade %',
        data: moduleData.map((item) => item.gradePercentage),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  // Module-wise Assessment Grade % (Line Chart)
  const moduleWiseAssessmentChartData = {
    labels: moduleData.map((item) => item.moduleName),
    datasets: [
      {
        label: 'Module-wise Assessment Grade %',
        data: moduleData.map((item) => item.gradePercentage),
        borderColor: '#4CAF50',
        backgroundColor: 'rgba(76, 175, 80, 0.2)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };


  // Assessment-wise Score (Bar Chart)
  const assessmentScoreChartData = {
    labels: assessmentData.map((item) => item.assessmentName),
    datasets: [
      {
        label: 'Assessment Score',
        data: assessmentData.map((item) => item.score),
        backgroundColor: '#FF9800',
        borderColor: '#FF9800',
        borderWidth: 1,
      },
    ],
  };

  // Calculate average assessment score
  const averageAssessmentScore = assessmentData.length
    ? (assessmentData.reduce((sum, item) => sum + item.score, 0) / assessmentData.length).toFixed(2)
    : 'N/A';

  return (
    <div className="p-6 bg-gray-200">

      <h1 className="text-2xl font-bold mb-4">Overall Trainee Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Assignments Submitted</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{totalAssignments}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Late Submissions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">15</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Average Assignment Grade</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {moduleData.length
              ? (moduleData.reduce((sum, item) => sum + item.gradePercentage, 0) / moduleData.length).toFixed(2) + '%'
              : 'N/A'}
          </CardContent>
        </Card>
        {/* New Assessment Submission Card */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment Submissions</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{assessmentData.length}</CardContent>
        </Card>
        {/* New Average Assessment Score Card */}
        <Card>
          <CardHeader>
            <CardTitle>Average Assessment Score</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{averageAssessmentScore}</CardContent>
        </Card>
      </div>

      <Button onClick={() => setView(view === 'chart' ? 'table' : 'chart')} className="mb-4 flex items-center gap-2">
        {view === 'chart' ? <TableIcon className="w-5 h-5" /> : <BarChart className="w-5 h-5" />}
        {view === 'chart' ? 'View Table' : 'View Chart'}
      </Button>

      {view === 'chart' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-96 bg-white rounded-lg shadow-md p-4">
            <Bar data={attendanceChartData} />
          </div>
          <div className="h-96 bg-white rounded-lg shadow-md p-4">
            <Line data={assignmentChartData} />
          </div>
          {/* Module-wise Assessment Grade % (Line Chart) */}
          <div className="h-96 bg-white rounded-lg shadow-md p-4">
            <Line data={moduleWiseAssessmentChartData} />
          </div>
          {/* Assessment-wise Score (Bar Chart) */}
          <div className="h-96 bg-white rounded-lg shadow-md p-4">
            <Bar data={assessmentScoreChartData} />
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module Name</TableHead>
                <TableHead>Days Present</TableHead>
                <TableHead>Total Days</TableHead>
                <TableHead>Attendance %</TableHead>
                <TableHead>Grade %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {moduleData.map((module, index) => (
                <TableRow key={index}>
                  <TableCell>{module.moduleName}</TableCell>
                  <TableCell>{module.daysPresent}</TableCell>
                  <TableCell>{module.totalDays}</TableCell>
                  <TableCell>{((module.daysPresent / module.totalDays) * 100).toFixed(2)}%</TableCell>
                  <TableCell>{module.gradePercentage}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Feedback Section */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Feedback</h2>
        {['communication', 'technical', 'logicalThinking', 'overall'].map((key) => (
          <div key={key} className="mb-4">
            <label className="block font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
            <textarea
              className="w-full p-2 border rounded-md resize-none"
              rows={3}
              value={feedback[key as keyof typeof feedback]}
              onChange={(e) => setFeedback({ ...feedback, [key]: e.target.value })}
              placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1')} feedback`}
            />
          </div>
        ))}

        {/* Centered Submit Button */}
        <div className="flex justify-center">
          <button className="w-40 h-10 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition">
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TraineesActivityPage;
