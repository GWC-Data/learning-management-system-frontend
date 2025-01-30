import React from "react";
import { DayPicker } from "react-day-picker"; // Make sure you import DayPicker correctly

const CalenderManage: React.FC = () => {
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date || null);
  };

  return (
    <div className="p-4 ml-32 -mt-8">
      <div className="ml-8">
        <div className="border rounded-lg p-5 h-[450px] w-[350px] ml-[70px]  flex flex-col mt-5">
          <h2 className="text-lg font-bold mt-3 text-slate-800">
            Calendar Management
          </h2>
          <p className="mb-5">Plan your schedule effectively!</p>

          <DayPicker
            selected={selectedDate || undefined}
            onDayClick={handleDateChange}
            className="rounded-lg custom-calendar items-center justify-center"
          />

          {selectedDate && (
            <p className="text-sm text-gray-700">
              Selected Date: {selectedDate.toDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalenderManage;
