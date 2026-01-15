import React, { useState } from "react";
import "./AppCalendar.css";

interface DoctorCalendarProps {
  onDayClick?: (day: Date) => void;
}

export const AppCalendar: React.FC<DoctorCalendarProps> = ({ onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Helper to get number of days in a month
  const daysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  // Move to previous month
  const prevMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setCurrentDate(new Date(year, month - 1, 1));
  };

  // Move to next month
  const nextMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const numDays = daysInMonth(year, month);

  const firstDay = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Build array of day numbers (with empty slots for first week)
  const calendarDays: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= numDays; i++) {
    calendarDays.push(i);
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth}>←</button>
        <span>{monthName} {year}</span>
        <button onClick={nextMonth}>→</button>
      </div>

      <div className="calendar-grid">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}

        {calendarDays.map((day, idx) => (
          <div
            key={idx}
            className={`calendar-day ${selectedDate?.getDate() === day &&
              selectedDate?.getMonth() === month ? "selected" : ""}`}
            onClick={() => {
              if (day) {
                const selectedDay = new Date(year, month, day);
                setSelectedDate(selectedDay);
                onDayClick?.(selectedDay);
              }
            }}
          >
            {day || ""}
          </div>
        ))}
      </div>
    </div>
  );
};
