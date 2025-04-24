'use client';

import {useState} from 'react';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import Image from 'next/image';
import {useToast} from '@/hooks/use-toast';
import {v4 as uuidv4} from 'uuid';
import {useRouter} from 'next/navigation';
import {addEmployee} from '@/services/employee-service';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import { Checkbox } from "@/components/ui/checkbox"

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

const CreateEmployeePage = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [hourlyWage, setHourlyWage] = useState('');
  const [fnpfNo, setFnpfNo] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>('cash');
  const [branch, setBranch] = useState<'labasa' | 'suva'>('labasa');
  const {toast} = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Basic validation
    if (!name || !position || !hourlyWage || !fnpfNo) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    if (paymentMethod === 'online' && (!bankCode || !bankAccountNumber)) {
      toast({
        title: 'Error',
        description: 'Please fill in Bank Code and Account Number for online transfer.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newEmployee: Employee = {
        id: uuidv4(),
        name,
        position,
        hourlyWage,
        fnpfNo,
        bankCode,
        bankAccountNumber,
        paymentMethod,
        branch,
      };

      await addEmployee(newEmployee);

      toast({
        title: 'Success',
        description: 'Employee created successfully!',
      });

      // Clear the form
      setName('');
      setPosition('');
      setHourlyWage('');
      setFnpfNo('');
      setBankCode('');
      setBankAccountNumber('');
      setPaymentMethod('cash');
      setBranch('labasa');

      // Redirect to employee information page to see the updated info
      router.push('/employees/information');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create employee.',
        variant: 'destructive',
      });
    }
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

      <Card className="w-full max-w-md bg-transparent backdrop-blur-md shadow-lg rounded-lg border border-accent/40">
        <CardHeader>
          <CardTitle className="text-2xl text-white text-center">
            New Employee
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={handleSubmit}>

            {/* Branch Selection */}
            <div className="grid gap-2">
              <Label className="text-white">Select Branch</Label>
              <RadioGroup onValueChange={(value) => setBranch(value === 'labasa' ? 'labasa' : 'suva')} defaultValue={branch}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="labasa" id="r3" />
                  <Label htmlFor="r3" className="text-white">Labasa Branch</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="suva" id="r4" />
                  <Label htmlFor="r4" className="text-white">Suva Branch</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name" className="text-white">
                Employee Name
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Employee Name"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position" className="text-white">
                Employee Position
              </Label>
              <Input
                id="position"
                type="text"
                placeholder="Employee Position"
                value={position}
                onChange={e => setPosition(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hourlyWage" className="text-white">
                Hourly Wage
              </Label>
              <Input
                id="hourlyWage"
                type="number"
                placeholder="Hourly Wage"
                value={hourlyWage}
                onChange={e => setHourlyWage(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="fnpfNo" className="text-white">
                FNPF No
              </Label>
              <Input
                id="fnpfNo"
                type="text"
                placeholder="FNPF No"
                value={fnpfNo}
                onChange={e => setFnpfNo(e.target.value)}
              />
            </div>

            {/* Payment Method Selection */}
            <div className="grid gap-2">
              <Label className="text-white">Payment Method</Label>
              <RadioGroup onValueChange={(value) => setPaymentMethod(value === 'cash' ? 'cash' : 'online')} defaultValue={paymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="r1" />
                  <Label htmlFor="r1" className="text-white">Cash Wages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="online" id="r2" />
                  <Label htmlFor="r2" className="text-white">Online Transfer</Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'online' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="bankCode" className="text-white">
                    Bank Code
                  </Label>
                  <Input
                    id="bankCode"
                    type="text"
                    placeholder="Bank Code"
                    value={bankCode}
                    onChange={e => setBankCode(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="bankAccountNumber" className="text-white">
                    Bank Account Number
                  </Label>
                  <Input
                    id="bankAccountNumber"
                    type="text"
                    placeholder="Bank Account Number"
                    value={bankAccountNumber}
                    onChange={e => setBankAccountNumber(e.target.value)}
                  />
                </div>
              </>
            )}

            <Button className="w-full mt-6" type="submit" variant="gradient">
              Create Employee
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEmployeePage;
