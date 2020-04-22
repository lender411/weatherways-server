export enum ParameterLookup {
	id = "id",
	MarkerID = "MarkerID",
}

export enum RouteLookup {
	// API routing
	API = "/api",
	Test = "/test",

	// Markers
	User = "/User",
	Markers = "/markers",
	ByMarkerID = "/byMarkerID",
	AllUserID = "/AllUserID",
	ADD = "/Add",

	// Search
	Search = "/search",

	// Parameters
	MarkersSearchQuery = "/:search",
	idParameter = "/:id",
	MarkersIdParameter = "/:MarkersID",
	// End parameters
	// End product
	// End API routing
}

// Error codes
export enum ErrorCodeLookup {
	// Database
	// Database - Markers
	EC1001 = "Marker was not found.",
	EC1002 = "Unable to save marker.",
	EC1003 = "Unable to delete marker.",
	// End database - product

	// General
	// General - product
	EC2001 = "Unable to retrieve markers listing.",
	EC2002 = "Unable to retrieve user details",
	EC2025 = "The provided user ID is not valid.",
	EC2026 = "Marker Id is invalid",
	EC2026B = "Please provide a valid marker search.",
	EC2027 = "Please provide a markerid.",
	EC2027B = "Please provide a valid product quantity_sold.",
	EC2028 = "MarkerID may not be negative.",
	EC2029 = "Conflict on parameter: markerID.",
	EC2028B = "Product price cannot be negative",
	// End general - product
}
// End error codes
