import { BarChart, LineChart } from '@mui/x-charts';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, PieChart, Pie, Cell, Tooltip } from 'recharts';

const TrainersActivityPage = () => {
  const feedbackData = [
    { subject: 'Communication', Trainer1: 4.5, Trainer2: 4.2, Trainer3: 4.8, Trainer4: 4.1, Trainer5: 4.6, Trainer6: 4.3, Trainer7: 4.9, Trainer8: 4.2 },
    { subject: 'Knowledge', Trainer1: 3.8, Trainer2: 4.0, Trainer3: 4.2, Trainer4: 4.5, Trainer5: 4.1, Trainer6: 4.9, Trainer7: 4.6 },
    { subject: 'Punctuality', Trainer1: 4.2, Trainer2: 4.5, Trainer3: 4.0, Trainer4: 3.5, Trainer5: 3.9, Trainer6: 4.0, Trainer7: 4.2 },
    { subject: 'Engagement', Trainer1: 4.7, Trainer2: 4.1, Trainer3: 4.5, Trainer4: 4.2, Trainer5: 4.6, Trainer6: 3.6, Trainer7: 3.9 },
    { subject: 'Support', Trainer1: 3.9, Trainer2: 4.3, Trainer3: 3.8, Trainer4: 4.6, Trainer5: 4.2, Trainer6: 3.7, Trainer7: 4.6 },
  ];

  const performanceData = [
    { name: 'Excellent', value: 40 },
    { name: 'Good', value: 35 },
    { name: 'Average', value: 15 },
    { name: 'Below Average', value: 10 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-6 space-y-6 bg-gray-200">
      <h1 className="text-3xl font-bold text-center mb-6">Trainers Activity Dashboard</h1>

      {/* First Row: Overall Performance (Full Width) */}
      <div className="bg-white p-6 rounded-2xl shadow-md w-full">
        <h2 className="text-xl font-semibold text-center mb-4">Trainers Overall Performance</h2>
        <PieChart width={500} height={300} className="mx-auto">
          <Pie
            data={performanceData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {performanceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>

      {/* Second Row: Productivity & Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-center mb-4">Trainers Productivity</h2>
          <BarChart
            width={500}
            height={300}
            series={[
              { data: [40, 35, 50, 45, 30, 55, 60], label: 'Productivity (Hours)', id: 'prodId' },
            ]}
            xAxis={[{ data: ['Ajay', 'Deveswar', 'Sakthi', 'Sathya', 'Aarthi', 'Nithish', 'Jayakumar'], scaleType: 'band' }]}
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-center mb-4">Trainers Attendance</h2>
          <LineChart
            width={500}
            height={300}
            series={[
              { data: [90, 85, 95, 80, 88, 92, 89], label: 'Attendance (%)', id: 'attendanceId' },
            ]}
            xAxis={[{ data: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7'], scaleType: 'point' }]}
          />
        </div>
      </div>

      {/* Third Row: Students Feedback & Coming Soon */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-xl font-semibold text-center mb-4">Students Feedback</h2>
          <RadarChart outerRadius={90} width={500} height={300} data={feedbackData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={30} domain={[0, 5]} />
            <Radar name="Ajay" dataKey="Trainer1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Radar name="Deveswar" dataKey="Trainer2" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
            <Radar name="Sakthi" dataKey="Trainer3" stroke="#3EB3F2" fill="#3EB3F2" fillOpacity={0.6} />
            <Radar name="Sathya" dataKey="Trainer4" stroke="#B79F6F" fill="#B79F6F" fillOpacity={0.6} />
            <Radar name="Aarthi" dataKey="Trainer5" stroke="#CAA928" fill="#CAA928" fillOpacity={0.6} />
            <Radar name="Nithish" dataKey="Trainer6" stroke="#F05D0E" fill="#F05D0E" fillOpacity={0.6} />
            <Radar name="Jayakumar" dataKey="Trainer7" stroke="#0B737D" fill="#0B737D" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-md flex justify-center items-center">
          <h2 className="text-2xl font-bold text-gray-500">More insights coming soon....</h2>
        </div>
      </div>
    </div>
  );
};

export default TrainersActivityPage;
