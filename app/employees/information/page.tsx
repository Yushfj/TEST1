'use client';

import Image from 'next/image';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {useEffect, useState} from 'react';
import {Trash2, Edit} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useToast} from '@/hooks/use-toast';
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
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Link from 'next/link';

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

const EmployeeInformationPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const {toast} = useToast();
  const [deletePassword, setDeletePassword] = useState('');
  const ADMIN_PASSWORD = 'admin'; // Store this securely in a real application

  useEffect(() => {
    // Retrieve employees from local storage on component mount
    const storedEmployees = localStorage.getItem('employees');
    if (storedEmployees) {
      setEmployees(JSON.parse(storedEmployees));
    }
  }, []);

  // Update employees state whenever local storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedEmployees = localStorage.getItem('employees');
      if (storedEmployees) {
        setEmployees(JSON.parse(storedEmployees));
      } else {
        setEmployees([]);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Filter employees by branch
  const labasaEmployees = employees.filter(employee => employee.branch === 'labasa');
  const suvaEmployees = employees.filter(employee => employee.branch === 'suva');

  const handleDeleteEmployee = (employeeId: string) => {
    if (deletePassword !== ADMIN_PASSWORD) {
      toast({
        title: 'Error',
        description: 'Incorrect password. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    const updatedEmployees = employees.filter(employee => employee.id !== employeeId);
    localStorage.setItem('employees', JSON.stringify(updatedEmployees));
    toast({
      title: 'Success',
      description: 'Employee deleted successfully!',
    });
    setDeletePassword('');
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

      {/* Content */}
      <Card className="w-full max-w-4xl bg-transparent backdrop-blur-md shadow-lg rounded-lg border border-accent/40">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            Employee Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Labasa Branch Employees */}
          <h2 className="text-xl text-white mb-2">Labasa Branch</h2>
          {labasaEmployees.length === 0 ? (
            <p className="text-white text-center">No employee information available for Labasa Branch.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {labasaEmployees.map((employee, index) => (
                <div
                  key={index}
                  className="bg-secondary/70 rounded-lg p-4 text-white shadow-md relative"
                >
                    <div className="absolute top-2 right-2 flex">
                        <Link href={`/employees/change?id=${employee.id}`} className="mr-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:text-blue-500"
                            >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                            </Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:text-red-500"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="sr-only">Delete</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to delete {employee.name}?
                                        This action cannot be undone.
                                        Please enter the admin password to confirm.
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
                                    <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                  <h3 className="text-lg font-semibold">{employee.name}</h3>
                  <p>Position: {employee.position}</p>
                  <p>Hourly Wage: ${employee.hourlyWage}</p>
                  <p>FNPF No: {employee.fnpfNo}</p>
                  {employee.paymentMethod === 'online' ? (
                    <>
                      <p>Bank Code: {employee.bankCode}</p>
                      <p>Bank Account No: {employee.bankAccountNumber}</p>
                    </>
                  ) : (
                    <p>Payment Method: Cash Wages</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Suva Branch Employees */}
          <h2 className="text-xl text-white mb-2 mt-4">Suva Branch</h2>
          {suvaEmployees.length === 0 ? (
            <p className="text-white text-center">No employee information available for Suva Branch.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suvaEmployees.map((employee, index) => (
                <div
                  key={index}
                  className="bg-secondary/70 rounded-lg p-4 text-white shadow-md relative"
                >
                      <div className="absolute top-2 right-2 flex">
                          <Link href={`/employees/change?id=${employee.id}`} className="mr-2">
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white hover:text-blue-500"
                              >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                              </Button>
                          </Link>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-white hover:text-red-500"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Are you sure you want to delete {employee.name}?
                                          This action cannot be undone.
                                          Please enter the admin password to confirm.
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
                                      <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>
                                          Delete
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  <h3 className="text-lg font-semibold">{employee.name}</h3>
                  <p>Position: {employee.position}</p>
                  <p>Hourly Wage: ${employee.hourlyWage}</p>
                  <p>FNPF No: {employee.fnpfNo}</p>
                  {employee.paymentMethod === 'online' ? (
                    <>
                      <p>Bank Code: {employee.bankCode}</p>
                      <p>Bank Account No: {employee.bankAccountNumber}</p>
                    </>
                  ) : (
                    <p>Payment Method: Cash Wages</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Cash Wages Employees */}
          <h2 className="text-xl text-white mb-2 mt-4">Cash Wages</h2>
          {employees.filter(employee => employee.paymentMethod === 'cash').length === 0 ? (
            <p className="text-white text-center">No employee uses cash wages.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {employees.filter(employee => employee.paymentMethod === 'cash').map((employee, index) => (
                <div
                  key={index}
                  className="bg-secondary/70 rounded-lg p-4 text-white shadow-md relative"
                >
                      <div className="absolute top-2 right-2 flex">
                          <Link href={`/employees/change?id=${employee.id}`} className="mr-2">
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-white hover:text-blue-500"
                              >
                                  <Edit className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                              </Button>
                          </Link>
                          <AlertDialog>
                              <AlertDialogTrigger asChild>
                                  <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-white hover:text-red-500"
                                  >
                                      <Trash2 className="h-4 w-4" />
                                      <span className="sr-only">Delete</span>
                                  </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                  <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                      <AlertDialogDescription>
                                          Are you sure you want to delete {employee.name}?
                                          This action cannot be undone.
                                          Please enter the admin password to confirm.
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
                                      <AlertDialogAction onClick={() => handleDeleteEmployee(employee.id)}>
                                          Delete
                                      </AlertDialogAction>
                                  </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  <h3 className="text-lg font-semibold">{employee.name}</h3>
                  <p>Branch: {employee.branch === 'labasa' ? 'Labasa' : 'Suva'}</p>
                  <p>Position: {employee.position}</p>
                  <p>Hourly Wage: ${employee.hourlyWage}</p>
                  <p>FNPF No: {employee.fnpfNo}</p>
                  <p>Payment Method: Cash Wages</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeInformationPage;
