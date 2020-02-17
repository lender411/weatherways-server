// Request object definitions
export interface MarkersSaveRequest {
	id?: string;
	MarkerID: number;
	Latitude: number;
	Temperature: number;
	location: string;
	Longitude: number;
	ArrivalTime: Date;
	precipChance: number;
}

export interface CartSaveRequest {
	id?: string;
	quantity_sold: number;
	lookupCode: string;
	price: number;
	cartid: string;
}

export interface EmployeeSaveRequest {
    first_name: string;
    last_name: string;
    employee_id: string;
    active: boolean;
    role: string;
    manager: string;
	password: string;
	amount_of_money_made: number;
}
// End request object definitions

export interface Params {
	product_id: string;
	cart_id: string;
}

// Response object definitions
// Response data object definitions
export interface Markers {
	id: string;
	Temperature: number;
	ArrivalTime: string;
	location: string;
	Latitude: number;
	Longitude: number;
	precipChance: number;
	MarkerID: number;
}

export interface Cart {
	id: string;
	quantity_sold: number;
	createdOn: string;
	lookupCode: string;
	price: number;
	cartid: string;
}

export interface Employee {
    first_name: string;
    last_name: string;
    employee_id: string;
    active: boolean;
    role: string;
    manager: string;
	password: string;
	amount_of_money_made: number;
}
// End response data object definitions

// API response data
export interface ApiResponse {
	errorMessage?: string;
}

export interface ProductSaveResponse extends ApiResponse {
	markers: Markers;
}
export interface EmployeeSaveResponse extends ApiResponse {
	employee: Employee;
}
// End API response data
// End response object definitions

export interface CommandResponse<T> {
	data?: T;
	status: number;
	message?: string;
}
