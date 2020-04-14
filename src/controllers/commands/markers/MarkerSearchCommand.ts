import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { CommandResponse, Markers } from "../../typeDefinitions";
import * as MarkersRepository from "../models/entities/MarkersModel";
import { MarkersModel } from "../models/entities/MarkersModel";
import * as Helper from "../helpers/helper";

const validation = (validationQuery: string): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };

	if ((validationQuery == null) || (validationQuery.trim() === "")) {
		validationResponse.status = 422	;
		validationResponse.message = ErrorCodeLookup.EC2026B;
	}
	return validationResponse;
};

export const search = async (query: string): Promise<CommandResponse<Markers[]>> => {
	const validationResponse = validation(query);
	if (validationResponse.status !== 200)	{
		return Promise.reject(validationResponse);
	}

	return MarkersRepository.searchAll(query)
		.then((existingMarkers: MarkersModel[]): Promise<CommandResponse<Markers[]>> => {
			return Promise.resolve(<CommandResponse<Markers[]>>{
				status: 200,
				data: existingMarkers.map<Markers>((existingMarker: MarkersModel) => {
					return <Markers>{
						id: existingMarker.id,
						MarkerID: existingMarker.MarkerID,
						Latitude:existingMarker.Latitude,
						ArrivalTime: Helper.formatDate(existingMarker.ArrivalTime),
						Longitude:existingMarker.Longitude,
						Temperature: existingMarker.Temperature,
						precipChance: existingMarker.precipChance,
						location: existingMarker.location
					};
				})
			});
		});
};