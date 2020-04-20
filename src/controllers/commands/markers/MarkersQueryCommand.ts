import * as Helper from "../helpers/helper";
import { CommandResponse, Markers } from "../../typeDefinitions";
import * as MarkersRepository from "../models/entities/MarkerEntity";
import { MarkerEntity } from "../models/entities/MarkerEntity";

export const query = async (): Promise<CommandResponse<Markers[]>> => {
	return MarkersRepository.queryAll()
		.then((existingMarkers: MarkerEntity[]): Promise<CommandResponse<Markers[]>> => {
			return Promise.resolve(<CommandResponse<Markers[]>>{
				status: 200,
				data: existingMarkers.map<Markers>((existingMarker: MarkerEntity) => {
					return <Markers>{
						id: existingMarker.id,
						MarkerID: existingMarker.MarkerID,
						Latitude: existingMarker.Latitude,
						ArrivalTime: Helper.formatDate(existingMarker.ArrivalTime),
						Longitude: existingMarker.Longitude,
						Temperature: existingMarker.Temperature,
						precipChance: existingMarker.precipChance,
						location: existingMarker.location
					};
				})
			});
		});
};
