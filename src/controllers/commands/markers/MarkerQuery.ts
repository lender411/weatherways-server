import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { CommandResponse, Markers } from "../../typeDefinitions";
import * as MarkersRepository from "../models/entities/MarkersModel";
import { MarkersModel } from "../models/entities/MarkersModel";

export const mapMarkerData = (queriedMarker: MarkersModel): Markers => {
	return <Markers>{
		id: queriedMarker.id,
		MarkerID: queriedMarker.MarkerID,
		Latitude: queriedMarker.Latitude,
		ArrivalTime: Helper.formatDate(queriedMarker.ArrivalTime),
		Longitude: queriedMarker.Longitude,
		Temperature: queriedMarker.Temperature,
		precipChance: queriedMarker.precipChance,
		location: queriedMarker.location
	};
};

export const queryById = async (id?: string): Promise<CommandResponse<Markers>> => {
	if (!id || (id.trim() === "")) {
		return Promise.reject(<CommandResponse<Markers>>{
			status: 422,
			message: ErrorCodeLookup.EC2025
		});
	}

	return MarkersRepository.queryById(id)
		.then((existingMarker: (MarkersModel | null)): Promise<CommandResponse<Markers>> => {
			if (!existingMarker) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 404,
					message: ErrorCodeLookup.EC1001
				});
			}

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 200,
				data: mapMarkerData(existingMarker)
			});
		});
};

export const queryByMarkerID = async (MarkerID: number): Promise<CommandResponse<Markers>> => {
	if (MarkerID == 0) {
		return Promise.reject(<CommandResponse<Markers>>{
			status: 422,
			message: ErrorCodeLookup.EC2026
		});
	}

	return MarkersRepository.queryByMarkerID(MarkerID)
		.then((existingMarker: (MarkersModel | null)): Promise<CommandResponse<Markers>> => {
			if (!existingMarker) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 404,
					message: ErrorCodeLookup.EC1001
				});
			}

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 200,
				data: mapMarkerData(existingMarker)
			});
		});
};
