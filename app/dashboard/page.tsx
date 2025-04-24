"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {useEffect, useState} from 'react';
import {cn} from "@/lib/utils";

interface WageRecord {
  employeeId: string;
  employeeName: string;
  hourlyWage: number;
  hoursWorked: number;
  fnpfDeduction: number;
  otherDeductions: number;
  grossPay: number;
  netPay: number;
  dateFrom: Date;
  dateTo: Date;
}

const DashboardPage = () => {
  const [wageRecords, setWageRecords] = useState<WageRecord[]>([]);

  useEffect(() => {
    // Load wage records from local storage
    const storedWageRecords = localStorage.getItem('wageRecords');
    if (storedWageRecords) {
      setWageRecords(
        JSON.parse(storedWageRecords).map((record: any) => ({
          ...record,
          dateFrom: new Date(record.dateFrom),
          dateTo: new Date(record.dateTo),
        }))
      );
    }
  }, []);

  // Group wage records by pay period
  const payPeriodData = wageRecords.reduce((acc: any, record) => {
    const payWeek = `${record.dateFrom.toLocaleDateString()} - ${record.dateTo.toLocaleDateString()}`;
    if (!acc[payWeek]) {
      acc[payWeek] = {
        payWeek: payWeek,
        totalNetPay: 0,
      };
    }
    acc[payWeek].totalNetPay += record.netPay;
    return acc;
  }, {});

  // Convert grouped data into an array for Recharts
  const chartData = Object.values(payPeriodData);

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background Image */}
      <Image
        src="https://picsum.photos/1920/1080"
        alt="Lal's Motor Winders Background"
        fill
        style={{ objectFit: 'cover' }}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      {/* Overlay for better readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-9" />
      
      {/* Menu on Top */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-center bg-transparent backdrop-blur-md text-white shadow-lg rounded-lg border border-accent/40">
        <h1 className="text-2xl text-center">Welcome to Lal's Motor Winders (FIJI) PTE Limited Dashboard</h1>
      </div>

      {/* Options Menu */}
      <div className="absolute top-20 left-0 w-full p-4 flex justify-center bg-transparent text-black shadow-lg rounded-lg border border-accent/40">
        <nav className="flex space-x-4">
          <Button asChild variant="gradient">
            <Link href="/employees">Employee Management</Link>
          </Button>
          <Button asChild variant="gradient">
            <Link href="/wages">Wages Management</Link>
          </Button>
        </nav>
      </div>

      {/* Graph */}
      <div className="absolute top-44 left:0 w-full p-4 flex justify-center bg-transparent backdrop-blur-md text-black shadow-lg rounded-lg border border-accent/40">
          <div className="w-full mb-8">
              <h3 className="text-xl text-center mb-2 text-white">Total Net Pay Trend for Each Pay Week</h3>
              <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}
                             margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#fff" opacity={0.3}/>
                      <XAxis dataKey="payWeek" stroke="#fff" tick={{fontSize: 12}}/>
                      <YAxis stroke="#fff" tickFormatter={(value) => `$${value}`} tick={{fontSize: 12}}/>
                      <Tooltip
                          contentStyle={{ backgroundColor: '#222', border: 'none', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff' }}
                          formatter={(value) => `$${value}`}
                          labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                          labelFormatter={(value, name, props) => {
                              const dataPoint = chartData.find(item => item.payWeek === value);
                              return `${value}`;
                          }}
                      />
                      <Legend wrapperStyle={{ color: '#fff', fontSize: '14px' }} iconType="circle"/>
                      <Line
                          type="monotone"
                          dataKey="totalNetPay"
                          stroke="#8884d8" // Customize the line color
                          strokeWidth={3}
                          dot={true}
                          connectNulls={true}
                          name="Total Net Pay"
                      />
                  </LineChart>
              </ResponsiveContainer>
          </div>
      </div>
    </div>
  );
};

export default DashboardPage;
