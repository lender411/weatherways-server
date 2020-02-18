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
// End request object definitions


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
// End response data object definitions

// API response data
export interface ApiResponse {
	errorMessage?: string;
}

export interface ProductSaveResponse extends ApiResponse {
	markers: Markers;
}
// End API response data
// End response object definitions

export interface CommandResponse<T> {
	data?: T;
	status: number;
	message?: string;
}
