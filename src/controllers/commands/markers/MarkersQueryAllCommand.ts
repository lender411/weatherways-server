import sequelize, { Sequelize } from "/sequelize";
import * as Helper from "../helpers/helper";
import { CommandResponse, Markers } from "../../typeDefinitions";
import * as MarkersRepository from "../models/entities/MarkerEntity";
import { MarkerEntity, MarkerInstance, UserInstance } from "../models/entities/MarkerEntity";
import { ErrorCodeLookup } from "../../lookups/stringLookup";

const validation = (validationQuery: string): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };

	if ((validationQuery == null) || (validationQuery.trim() === "")) {
		validationResponse.status = 423	;
		validationResponse.message = ErrorCodeLookup.EC2026B;
	}
	return validationResponse;
};

export const queryAllbyUserID = (id: string): Promise<CommandResponse<Markers[]>> => {
	const validationResponse = validation(id);

	if (validationResponse.status !== 200)	{
		return Promise.reject(validationResponse);
	}

	return MarkersRepository.queryByAllUserId(id)
		.then((existingMarkers: MarkerInstance[]): Promise<CommandResponse<Markers[]>> => {
			return Promise.resolve(<CommandResponse<Markers[]>> { status: 200 ,
				data: existingMarkers.map<Markers>((existingMarkers: MarkerInstance) => {
					return <Markers>{
						id: existingMarkers.id,
						MarkerID: existingMarkers.MarkerID,
						Temperature: existingMarkers.Temperature,
						precipChance: existingMarkers.precipChance,
						Latitude: existingMarkers.Latitude,
						Longitude: existingMarkers.Longitude,
						location: existingMarkers.location,
						ArrivalTime: Helper.formatDate(existingMarkers.ArrivalTime)
					};
				})
			});
		});
};