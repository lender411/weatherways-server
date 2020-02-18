export enum ParameterLookup {
	id = "id",
	MarkerID = "MarkerID",
}

export enum RouteLookup {
	// API routing
	API = "/api",
	Test = "/test",

	// Markers
	Markers = "/markers",
	ByMarkerID = "/byMarkerID",


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
	EC2001 = "Unable to retrieve product listing.",
	EC2001B = "Unable to retrieve cart listing.",
	EC2002 = "Unable to retrieve product details",
	EC2025 = "The provided product record ID is not valid.",
	EC2026 = "Please provide a valid product lookup code.",
	EC2026B = "Please provide a valid product search.",
	EC2027 = "Please provide a valid product count.",
	EC2027B = "Please provide a valid product quantity_sold.",
	EC2028 = "Product count may not be negative.",
	EC2029 = "Conflict on parameter: lookupcode.",
	EC2028B = "Product price cannot be negative",
	// End general - product
}
// End error codes
