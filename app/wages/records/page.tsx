'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Button} from '@/components/ui/button';
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {CalendarIcon} from 'lucide-react';
import {DateRange} from 'react-day-picker';
import {useToast} from '@/hooks/use-toast';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
} from '@/components/ui/alert-dialog';
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

interface Employee {
  id: string;
  name: string;
  position: string;
  hourlyWage: string;
  fnpfNo: string;
  bankCode: string;
  bankAccountNumber: string;
  paymentMethod: 'cash' | 'online';
  branch: 'labasa' | 'suva';
}

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

const WagesRecordsPage = () => {
  const [wageRecords, setWageRecords] = useState<WageRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: null,
    to: null,
  });
  const [filteredWageRecords, setFilteredWageRecords] = useState<WageRecord[]>([]);
  const {toast} = useToast();
  const [deletePassword, setDeletePassword] = useState('');
  const ADMIN_PASSWORD = 'admin'; // Store this securely in a real application

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

    // Load employees from local storage
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  }, []);

  useEffect(() => {
    // Filter wage records based on selected date range
    if (dateRange?.from && dateRange?.to) {
      const filteredRecords = wageRecords.filter(record => {
        return (
          record.dateFrom >= dateRange.from! && record.dateTo <= dateRange.to!
        );
      });
      setFilteredWageRecords(filteredRecords);
    } else {
      setFilteredWageRecords(wageRecords);
    }
  }, [dateRange, wageRecords]);

  const handleDeleteRecords = () => {
    if (deletePassword !== ADMIN_PASSWORD) {
      toast({
        title: 'Error',
        description: 'Incorrect password. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Error',
        description: 'Please select a date range to delete.',
        variant: 'destructive',
      });
      return;
    }

    // Filter out the records within the selected date range
    const updatedWageRecords = wageRecords.filter(record => {
      return !(record.dateFrom >= dateRange.from! && record.dateTo <= dateRange.to!);
    });

    // Update the local storage with the filtered records
    localStorage.setItem('wageRecords', JSON.stringify(updatedWageRecords));

    // Update the state
    setWageRecords(updatedWageRecords);
    setFilteredWageRecords([]); // Clear filtered records

    toast({
      title: 'Success',
      description: 'Wage records for the selected date range deleted successfully!',
    });

    // Clear the date range and password
    setDateRange({from: null, to: null});
    setDeletePassword('');
  };

  const exportToCSV = (type: string) => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Error',
        description: 'Please select a date range.',
        variant: 'destructive',
      });
      return;
    }

    const wageRecordsToExport: WageRecord[] = filteredWageRecords.filter(record => {
      const employee = employees.find(emp => emp.id === record.employeeId);
      return employee?.paymentMethod === 'online';
    });

    if (!wageRecordsToExport || wageRecordsToExport.length === 0) {
      toast({
        title: 'Error',
        description: 'No wage records available to export.',
        variant: 'destructive',
      });
      return;
    }

    let csvData = '';

    if (type === 'BSP') {
      const csvRows = [];

      wageRecordsToExport.forEach(record => {
        const employeeDetails = employees.find(emp => emp.id === record.employeeId);
        csvRows.push([
          employeeDetails?.bankCode || '',
          employeeDetails?.bankAccountNumber || '',
          record.netPay.toFixed(2),
          'Salary', // Adding "Salary" to the fourth column
          record.employeeName, // Adding employee name to the fifth column
        ].join(','));
      });

      csvData = csvRows.join('\n');
    } else if (type === 'BRED') {
      const csvRows: string[] = [];
      wageRecordsToExport.forEach(record => {
        const employeeDetails = employees.find(emp => emp.id === record.employeeId);
        csvRows.push([
          employeeDetails?.bankCode || '',
          record.employeeName,
          '', // Empty Employee 2 Column
          employeeDetails?.bankAccountNumber || '',
          record.netPay.toFixed(2),
          'Salary',
        ].join('\n'));
      });

      csvData = csvRows.join('\n');
    }

    const blob = new Blob([csvData], {type: 'text/csv'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `wage_records_${type}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Success',
      description: `Wage records exported to CSV (${type}) successfully!`,
    });
  };

  const handleExportToBSPCsv = () => {
    exportToCSV('BSP');
  };

  const handleExportToBREDCsv = () => {
    exportToCSV('BRED');
  };

  // Function to generate a color for each employee
  const employeeColors: { [employeeId: string]: string } = {};
  const getEmployeeColor = (employeeId: string) => {
    if (!employeeColors[employeeId]) {
      // Generate a random color
      employeeColors[employeeId] = `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }
    return employeeColors[employeeId];
  };

  // Group wage records by employee
  const employeeWageData = filteredWageRecords.reduce((acc: any, record) => {
    if (!acc[record.employeeId]) {
      acc[record.employeeId] = {
        employeeName: record.employeeName,
        data: [],
      };
    }
    acc[record.employeeId].data.push({
      payWeek: `${format(record.dateFrom, 'MMM dd')} - ${format(record.dateTo, 'MMM dd')}`,
      netPay: record.netPay,
      employeeName: record.employeeName, // Include employeeName in data for tooltip
    });
    return acc;
  }, {});

  // Combine data for all employees into a single dataset
  const allEmployeeData = Object.values(employeeWageData).flatMap((employeeData: any) => employeeData.data.map((item: any) => ({
    ...item,
    employeeName: employeeData.employeeName, // Ensure employeeName is included
  })));

  return (
    <div className="relative flex items-center justify-center min-h-screen">
      {/* Background Image */}
      <Image
        src="https://picsum.photos/1920/1080"
        alt="Lal's Motor Winders Background"
        fill
        style={{objectFit: 'cover'}}
        className="absolute top-0 left-0 w-full h-full -z-10"
      />

      {/* Overlay for better readability */}
      <div className="absolute top-0 left-0 w-full h-full bg-black opacity-50 -z-9" />

      <Card className="w-full max-w-5xl bg-transparent backdrop-blur-md shadow-lg rounded-lg border border-accent/40">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Wages Records
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <div className="mb-4 flex items-center justify-between">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={'outline'}
                  className={cn(
                    'w-[300px] justify-start text-left font-normal',
                    !dateRange?.from && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'MMM dd, yyyy')} - ${format(
                        dateRange.to,
                        'MMM dd, yyyy'
                      )}`
                    ) : (
                      format(dateRange.from, 'MMM dd, yyyy')
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto p-0"
                align="start"
                side="bottom"
              >
                <Calendar
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  disabled={{
                    before: new Date(new Date().setDate(new Date().getDate() - 365)),
                    after: new Date(),
                  }}
                />
              </PopoverContent>
            </Popover>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Records</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the wage records for the selected date range? This action cannot be undone.
                    Please enter the admin password to confirm.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2">
                  <Label htmlFor="password">Admin Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={deletePassword}
                    onChange={e => setDeletePassword(e.target.value)}
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteRecords}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Wage Chart */}
          <div className="w-full mb-8">
            <h3 className="text-xl text-center mb-2 text-white">Net Pay Trend for All Employees</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={allEmployeeData}
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
                    const dataPoint = allEmployeeData.find(item => item.payWeek === value);
                    return `${value} (${dataPoint?.employeeName || 'Unknown'})`;
                  }}
                />
                <Legend wrapperStyle={{ color: '#fff', fontSize: '14px' }} iconType="circle"/>
                {employees.map(employee => (
                  <Line
                    key={employee.id}
                    type="monotone"
                    dataKey="netPay"
                    stroke={getEmployeeColor(employee.id)} // Use the function to get the stroke color
                    strokeWidth={3}
                    dot={true}
                    connectNulls={true}
                    name={employee.name}
                    data={allEmployeeData.filter(item => item.employeeName === employee.name)}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          {allEmployeeData.length === 0 && (
            <p className="text-white text-center">No wage data available for the selected date range to display the chart.</p>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[150px]">Employee Name</TableHead>
                <TableHead className="w-[150px]">Bank Code</TableHead>
                <TableHead className="w-[150px]">Bank Account Number</TableHead>
                <TableHead>Hourly Wage</TableHead>
                <TableHead>Hours Worked</TableHead>
                <TableHead>FNPF Deduction</TableHead>
                <TableHead>Other Deductions</TableHead>
                <TableHead>Gross Pay</TableHead>
                <TableHead>Net Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWageRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-white">
                    No wage records available for the selected date range.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWageRecords.map((record, index) => {
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-white">
                        {record.employeeName}
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {
                          employees.find(employee => employee.id === record.employeeId)
                            ?.bankCode || 'N/A'
                        }
                      </TableCell>
                      <TableCell className="font-medium text-white">
                        {
                          employees.find(employee => employee.id === record.employeeId)
                            ?.bankAccountNumber || 'N/A'
                        }
                      </TableCell>
                      <TableCell className="text-white">${record.hourlyWage.toFixed(2)}</TableCell>
                      <TableCell className="text-white">{record.hoursWorked.toFixed(2)}</TableCell>
                      <TableCell className="text-white">
                        ${record.fnpfDeduction.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-white">
                        ${record.otherDeductions.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-white">${record.grossPay.toFixed(2)}</TableCell>
                      <TableCell className="text-white">${record.netPay.toFixed(2)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <div className="flex justify-between mt-4">
            <Button variant="gradient" onClick={handleExportToBSPCsv}>
              Export to CSV (BSP)
            </Button>
            <Button variant="gradient" onClick={handleExportToBREDCsv}>
              Export to CSV (BRED)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WagesRecordsPage;
