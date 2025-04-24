'use client';

import {useState, useEffect} from 'react';
import Image from 'next/image';
import {useToast} from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {Button} from '@/components/ui/button'; // Import Button component
import {Calendar} from '@/components/ui/calendar';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';
import {CalendarIcon} from 'lucide-react';
import {DateRange} from 'react-day-picker';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Label} from '@/components/ui/label';
import {getEmployees} from '@/services/employee-service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter, // Import AlertDialogFooter
} from '@/components/ui/alert-dialog';
import {Input} from '@/components/ui/input';
import * as XLSX from 'xlsx';


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

const CreateWagesPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [wageData, setWageData] = useState<{[employeeId: string]: {hoursWorked: string; otherDeductions: string}}>({});
  const {toast} = useToast();
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: null,
    to: null,
  });
  const [totalNetWages, setTotalNetWages] = useState<number>(0);
  const [totalFnpfDeduction, setTotalFnpfDeduction] = useState<number>(0);
  const [totalSuvaWages, setTotalSuvaWages] = useState<number>(0);
  const [totalLabasaWages, setTotalLabasaWages] = useState<number>(0);
  const [totalCashWages, setTotalCashWages] = useState<number>(0);
  const [deletePassword, setDeletePassword] = useState('');
  const ADMIN_PASSWORD = 'admin'; // Store this securely in a real application

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const employeeData = await getEmployees();
      setEmployees(employeeData);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch employees.',
        variant: 'destructive',
      });
    }
  };

  // Initialize wageData when employees are loaded
  useEffect(() => {
    const initialWageData: {[employeeId: string]: {hoursWorked: string; otherDeductions: string}} =
      {};
    employees.forEach(employee => {
      initialWageData[employee.id] = {hoursWorked: '', otherDeductions: ''};
    });
    setWageData(initialWageData);
  }, [employees]);

  useEffect(() => {
    // Calculate totals whenever wageData changes
    calculateTotals();
  }, [wageData]);

  const handleHoursWorkedChange = (employeeId: string, hoursWorked: string) => {
    setWageData(prev => ({
      ...prev,
      [employeeId]: {...prev[employeeId], hoursWorked},
    }));
  };

  const handleOtherDeductionsChange = (employeeId: string, otherDeductions: string) => {
    setWageData(prev => ({
      ...prev,
      [employeeId]: {...prev[employeeId], otherDeductions},
    }));
  };

  const calculateWages = (employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) {
      toast({
        title: 'Error',
        description: 'Selected employee not found.',
        variant: 'destructive',
      });
      return null;
    }

    const hourlyWage = parseFloat(employee.hourlyWage);
    const hoursWorked = parseFloat(wageData[employeeId]?.hoursWorked || '0');
    const otherDeductions = parseFloat(wageData[employeeId]?.otherDeductions || '0');

    const grossPay = hourlyWage * hoursWorked;
    const fnpfDeduction = grossPay * 0.08;
    const netPay = grossPay - fnpfDeduction - otherDeductions;

    return {
      employeeId,
      employeeName: employee.name,
      hourlyWage,
      hoursWorked,
      fnpfDeduction,
      otherDeductions,
      grossPay,
      netPay,
      branch: employee.branch, // Include branch for totals
      paymentMethod: employee.paymentMethod, // Include payment method for totals
    };
  };

  const calculateTotals = () => {
    let totalNet = 0;
    let totalFnpf = 0;
    let totalSuva = 0;
    let totalLabasa = 0;
    let totalCash = 0;

    employees.forEach(employee => {
      const wageDetails = calculateWages(employee.id);
      if (wageDetails) {
        totalNet += wageDetails.netPay;
        totalFnpf += wageDetails.fnpfDeduction;

        if (wageDetails.branch === 'suva') {
          totalSuva += wageDetails.netPay;
        } else if (wageDetails.branch === 'labasa') {
          totalLabasa += wageDetails.netPay;
        }

        if (wageDetails.paymentMethod === 'cash') {
          totalCash += wageDetails.netPay;
        }
      }
    });

    setTotalNetWages(totalNet);
    setTotalFnpfDeduction(totalFnpf);
    setTotalSuvaWages(totalSuva);
    setTotalLabasaWages(totalLabasa);
    setTotalCashWages(totalCash);
  };

  const handleCalculateWages = () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast({
        title: 'Error',
        description: 'Please select a date range.',
        variant: 'destructive',
      });
      return;
    }

    const newWageRecords: WageRecord[] = [];

    employees.forEach(employee => {
      const wageDetails = calculateWages(employee.id);
      if (wageDetails) {
        newWageRecords.push({
          employeeId: wageDetails.employeeId,
          employeeName: wageDetails.employeeName,
          hourlyWage: wageDetails.hourlyWage,
          hoursWorked: wageDetails.hoursWorked,
          fnpfDeduction: wageDetails.fnpfDeduction,
          otherDeductions: wageDetails.otherDeductions,
          grossPay: wageDetails.grossPay,
          netPay: wageDetails.netPay,
          dateFrom: dateRange.from!,
          dateTo: dateRange.to!,
        });
      }
    });

    // Load existing wage records from local storage
    const storedWageRecords = localStorage.getItem('wageRecords');
    const existingWageRecords: WageRecord[] = storedWageRecords
      ? JSON.parse(storedWageRecords)
      : [];

    // Check if wage records already exist for this date range
    const existingRecordsForDateRange = existingWageRecords.filter(record => {
        const recordDateFrom = new Date(record.dateFrom);
        const recordDateTo = new Date(record.dateTo);
      return (
        recordDateFrom.getTime() === dateRange.from!.getTime() &&
        recordDateTo.getTime() === dateRange.to!.getTime()
      );
    });

    if (existingRecordsForDateRange.length > 0) {
        // Prompt for admin password
        // Show AlertDialog to ask for admin password
        document.getElementById('adminPasswordDialog')?.click();
    } else {
      saveWageRecords(newWageRecords, existingWageRecords);
    }
  };

  const saveWageRecords = (newWageRecords: WageRecord[], existingWageRecords: WageRecord[]) => {
       // Add the new wage records to the existing records
       const updatedWageRecords = [...existingWageRecords, ...newWageRecords];

       // Save the updated wage records back to local storage
       localStorage.setItem('wageRecords', JSON.stringify(updatedWageRecords));
 
       toast({
         title: 'Success',
         description: 'Wages calculated and recorded successfully!',
       });
  }

  const confirmSaveWageRecords = () => {
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

    const newWageRecords: WageRecord[] = [];

    employees.forEach(employee => {
      const wageDetails = calculateWages(employee.id);
      if (wageDetails) {
        newWageRecords.push({
          employeeId: wageDetails.employeeId,
          employeeName: wageDetails.employeeName,
          hourlyWage: wageDetails.hourlyWage,
          hoursWorked: wageDetails.hoursWorked,
          fnpfDeduction: wageDetails.fnpfDeduction,
          otherDeductions: wageDetails.otherDeductions,
          grossPay: wageDetails.grossPay,
          netPay: wageDetails.netPay,
          dateFrom: dateRange.from!,
          dateTo: dateRange.to!,
        });
      }
    });

    // Load existing wage records from local storage
    const storedWageRecords = localStorage.getItem('wageRecords');
    const existingWageRecords: WageRecord[] = storedWageRecords
      ? JSON.parse(storedWageRecords)
      : [];

    // Filter out existing records for the selected date range
    const updatedWageRecords = existingWageRecords.filter(record => {
        const recordDateFrom = new Date(record.dateFrom);
        const recordDateTo = new Date(record.dateTo);

        return !(recordDateFrom.getTime() === dateRange.from!.getTime() &&
                 recordDateTo.getTime() === dateRange.to!.getTime());
    });

    // Add the new wage records to the filtered existing records
    const finalWageRecords = [...updatedWageRecords, ...newWageRecords];

    localStorage.setItem('wageRecords', JSON.stringify(finalWageRecords));

    toast({
      title: 'Success',
      description: 'Wage records updated successfully!',
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

      const wageRecords: WageRecord[] = [];

       employees.forEach(employee => {
          const wageDetails = calculateWages(employee.id);
          if (wageDetails) {
              wageRecords.push({
                  employeeId: wageDetails.employeeId,
                  employeeName: wageDetails.employeeName,
                  hourlyWage: wageDetails.hourlyWage,
                  hoursWorked: wageDetails.hoursWorked,
                  fnpfDeduction: wageDetails.fnpfDeduction,
                  otherDeductions: wageDetails.otherDeductions,
                  grossPay: wageDetails.grossPay,
                  netPay: wageDetails.netPay,
                  dateFrom: dateRange.from!,
                  dateTo: dateRange.to!,
              });
          }
      });


      if (!wageRecords || wageRecords.length === 0) {
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

          // Filter for online transfer employees
          const onlineTransferRecords = wageRecords.filter(record => {
              const employee = employees.find(emp => emp.id === record.employeeId);
              return employee?.paymentMethod === 'online';
          });
          // Add records
          onlineTransferRecords.forEach(record => {
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
          const csvRows = [];
          // Add headers
         csvRows.push([
              'BIC',
              'Employee',
              'Employee',
              'Account N',
              'Amount',
              'Purpose of Note (optional)',
          ].join(','));

          // Filter for online transfer employees
          const onlineTransferRecords = wageRecords.filter(record => {
              const employee = employees.find(emp => emp.id === record.employeeId);
              return employee?.paymentMethod === 'online';
          });

          // Add records for online transfer employees
          onlineTransferRecords.forEach(record => {
              const employeeDetails = employees.find(emp => emp.id === record.employeeId);
              csvRows.push([
                  employeeDetails?.bankCode || '',
                  record.employeeName,
                  '', // Empty Employee 2 Column
                  employeeDetails?.bankAccountNumber || '',
                  record.netPay.toFixed(2),
                  'Salary',
              ].join(','));
          });

          csvData = csvRows.join('\n');
      }

      const blob = new Blob([csvData], { type: 'text/csv' });
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

    const handleExportAndSave = async (type: string) => {
        await exportToCSV(type);
        if (!dateRange?.from || !dateRange?.to) {
            toast({
                title: 'Error',
                description: 'Please select a date range.',
                variant: 'destructive',
            });
            return;
        }

        const newWageRecords: WageRecord[] = [];

         employees.forEach(employee => {
          const wageDetails = calculateWages(employee.id);
          if (wageDetails) {
              newWageRecords.push({
                  employeeId: wageDetails.employeeId,
                  employeeName: wageDetails.employeeName,
                  hourlyWage: wageDetails.hourlyWage,
                  hoursWorked: wageDetails.hoursWorked,
                  fnpfDeduction: wageDetails.fnpfDeduction,
                  otherDeductions: wageDetails.otherDeductions,
                  grossPay: wageDetails.grossPay,
                  netPay: wageDetails.netPay,
                  dateFrom: dateRange.from!,
                  dateTo: dateRange.to!,
              });
          }
      });

        // Load existing wage records from local storage
        const storedWageRecords = localStorage.getItem('wageRecords');
        const existingWageRecords: WageRecord[] = storedWageRecords
            ? JSON.parse(storedWageRecords)
            : [];

        // Check if wage records already exist for this date range
        const existingRecordsForDateRange = existingWageRecords.filter(record => {
            const recordDateFrom = new Date(record.dateFrom);
            const recordDateTo = new Date(record.dateTo);

            return (
                recordDateFrom.getTime() === dateRange.from!.getTime() &&
                recordDateTo.getTime() === dateRange.to!.getTime()
            );
        });

        if (existingRecordsForDateRange.length > 0) {
            // Prompt for admin password
            // Show AlertDialog to ask for admin password
            document.getElementById('adminPasswordDialog')?.click();
        } else {
            saveWageRecords(newWageRecords, existingWageRecords);
        }
    };

    const handleExportToExcel = () => {
        if (!dateRange?.from || !dateRange?.to) {
            toast({
                title: 'Error',
                description: 'Please select a date range.',
                variant: 'destructive',
            });
            return;
        }

       const wageRecords: WageRecord[] = [];

        employees.forEach(employee => {
          const wageDetails = calculateWages(employee.id);
          if (wageDetails) {
              wageRecords.push({
                  employeeId: wageDetails.employeeId,
                  employeeName: wageDetails.employeeName,
                  hourlyWage: wageDetails.hourlyWage,
                  hoursWorked: wageDetails.hoursWorked,
                  fnpfDeduction: wageDetails.fnpfDeduction,
                  otherDeductions: wageDetails.otherDeductions,
                  grossPay: wageDetails.grossPay,
                  netPay: wageDetails.netPay,
                  dateFrom: dateRange.from!,
                  dateTo: dateRange.to!,
              });
          }
      });

        if (!wageRecords || wageRecords.length === 0) {
            toast({
                title: 'Error',
                description: 'No wage records available to export.',
                variant: 'destructive',
            });
            return;
        }

        // Prepare data for Excel
        const excelData = [
            [
                'Employee Name',
                'Hourly Wage',
                'Hours Worked',
                'FNPF Deduction',
                'Other Deductions',
                'Gross Pay',
                'Net Pay',
                'Date From',
                'Date To',
            ],
            ...wageRecords.map(record => [
                record.employeeName,
                record.hourlyWage,
                record.hoursWorked,
                record.fnpfDeduction,
                record.otherDeductions,
                record.grossPay,
                record.netPay,
                format(record.dateFrom, 'MMM dd, yyyy'),
                format(record.dateTo, 'MMM dd, yyyy'),
            ]),
             // Add totals row
             [
                'Totals',
                '',
                '',
                totalFnpfDeduction,
                '',
                '',
                totalNetWages,
                '',
                '',
            ],
        ];

        // Create workbook and add data
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(excelData);
        XLSX.utils.book_append_sheet(wb, ws, 'Wage Records');

        // Generate Excel file and trigger download
        XLSX.writeFile(wb, `wage_records.xlsx`);


        toast({
            title: 'Success',
            description: 'Wage records exported to Excel successfully!',
        });
    };


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

      <div className="w-full max-w-5xl bg-transparent backdrop-blur-md shadow-lg rounded-lg border border-accent/40 p-4">
        <h2 className="text-2xl text-white text-center mb-4">Calculate Wages</h2>
        <div className="mb-4">
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
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-white">Employee Name</TableHead>
              <TableHead className="text-white">Bank Code</TableHead>
              <TableHead className="text-white">Bank Account Number</TableHead>
              <TableHead className="text-white">Hourly Wage</TableHead>
              <TableHead className="text-white">Hours Worked</TableHead>
              <TableHead className="text-white">Other Deductions</TableHead>
              <TableHead className="text-white">FNPF Deduction</TableHead>
              <TableHead className="text-white">Net Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map(employee => (
              <TableRow key={employee.id}>
                <TableCell className="text-white">{employee.name}</TableCell>
                <TableCell className="text-white">{employee?.bankCode}</TableCell>
                <TableCell className="text-white">{employee?.bankAccountNumber}</TableCell>
                <TableCell className="text-white">${employee.hourlyWage}</TableCell>
                <TableCell>
                  <input
                    type="number"
                    placeholder="Hours Worked"
                    value={wageData[employee.id]?.hoursWorked || ''}
                    onChange={e => handleHoursWorkedChange(employee.id, e.target.value)}
                    className="w-24 p-1 border rounded text-black"
                  />
                </TableCell>
                <TableCell>
                  <input
                    type="number"
                    placeholder="Other Deductions"
                    value={wageData[employee.id]?.otherDeductions || ''}
                    onChange={e => handleOtherDeductionsChange(employee.id, e.target.value)}
                    className="w-24 p-1 border rounded text-black"
                  />
                </TableCell>
                <TableCell className="text-white">
                  $
                  {calculateWages(employee.id)?.fnpfDeduction.toFixed(2) || '0.00'}
                </TableCell>
                <TableCell className="text-white">
                  ${calculateWages(employee.id)?.netPay.toFixed(2) || '0.00'}
                </TableCell>
              </TableRow>
            ))}
            {/* Total Wage Display */}
            <TableRow>
              <TableCell colSpan={6} className="text-right text-white">
                Total:
              </TableCell>
              <TableCell className="text-white">
                ${totalFnpfDeduction.toFixed(2)}
              </TableCell>
              <TableCell className="text-white">
                ${totalNetWages.toFixed(2)}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <div className="flex justify-between mt-4">
          <Button variant="gradient" onClick={handleCalculateWages}>
            Save
          </Button>
          <Button variant="gradient" onClick={() => handleExportAndSave('BSP')}>
            Export to CSV (BSP)
          </Button>
          <Button variant="gradient" onClick={() => handleExportAndSave('BRED')}>
            Export to CSV (BRED)
          </Button>
           <Button variant="gradient" onClick={handleExportToExcel}>
            Export to Excel
          </Button>
        </div>

        {/* Branch-wise Total Wage Display */}
        
        <div className="text-lg text-white text-center mt-2">
          Total Suva Branch Wages: ${totalSuvaWages.toFixed(2)}
        </div>
        <div className="text-lg text-white text-center mt-2">
          Total Labasa Branch Wages: ${totalLabasaWages.toFixed(2)}
        </div>
        <div className="text-lg text-white text-center mt-2">
          Total Cash Wages: ${totalCashWages.toFixed(2)}
        </div>
        
      </div>
       {/* AlertDialog for admin password */}
       <AlertDialog>
            <AlertDialogTrigger id="adminPasswordDialog" asChild>
                <Button variant="ghost" style={{display:"none"}}>Show Dialog</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Save/Update</AlertDialogTitle>
                    <AlertDialogDescription>
                        Wage records already exist for the selected date range.
                        Please enter the admin password to confirm the save or update.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="grid gap-2">
                    <Label htmlFor="password">Admin Password</Label>
                    <Input
                        id="password"
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmSaveWageRecords}>
                        Confirm
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
};

export default CreateWagesPage;

