// src/services/employee-service.ts

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

const EMPLOYEE_STORAGE_KEY = 'employees';

// Function to retrieve employees from local storage
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const storedEmployees = localStorage.getItem(EMPLOYEE_STORAGE_KEY);
    if (storedEmployees) {
      return JSON.parse(storedEmployees) as Employee[];
    }
    return [];
  } catch (error) {
    console.error("Error retrieving employees from local storage:", error);
    throw new Error("Failed to retrieve employees from local storage");
  }
};

// Function to add a new employee to local storage
export const addEmployee = async (employee: Employee): Promise<void> => {
  try {
    const existingEmployees = await getEmployees();
    const updatedEmployees = [...existingEmployees, employee];
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(updatedEmployees));
  } catch (error) {
    console.error("Error adding employee to local storage:", error);
    throw new Error("Failed to add employee to local storage");
  }
};

// Function to update an existing employee in local storage
export const updateEmployee = async (employee: Employee): Promise<void> => {
  try {
    const existingEmployees = await getEmployees();
    const updatedEmployees = existingEmployees.map(emp =>
      emp.id === employee.id ? employee : emp
    );
    localStorage.setItem(EMPLOYEE_STORAGE_KEY, JSON.stringify(updatedEmployees));
  } catch (error) {
    console.error("Error updating employee in local storage:", error);
    throw new Error("Failed to update employee in local storage");
  }
};
