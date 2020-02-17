import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { CommandResponse, Markers } from "../../typeDefinitions";
import * as MarkersRepository from "../models/entities/productModel";
import { MarkersModel } from "../models/entities/productModel";

export const mapProductData = (queriedProduct: MarkersModel): Markers => {
	return <Markers>{
		id: queriedProduct.id,
		MarkerID: queriedProduct.MarkerID,
		Latitude: queriedProduct.Latitude,
		ArrivalTime: Helper.formatDate(queriedProduct.ArrivalTime),
		Longitude: queriedProduct.Longitude,
		Temperature: queriedProduct.Temperature,
		precipChance: queriedProduct.precipChance,
		location: queriedProduct.location
	};
};

export const queryById = async (recordId?: string): Promise<CommandResponse<Markers>> => {
	if (!recordId || (recordId.trim() === "")) {
		return Promise.reject(<CommandResponse<Markers>>{
			status: 422,
			message: ErrorCodeLookup.EC2025
		});
	}

	return MarkersRepository.queryById(recordId)
		.then((existingProduct: (MarkersModel | null)): Promise<CommandResponse<Markers>> => {
			if (!existingProduct) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 404,
					message: ErrorCodeLookup.EC1001
				});
			}

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 200,
				data: mapProductData(existingProduct)
			});
		});
};

export const queryByLookupCode = async (MarkerID: number): Promise<CommandResponse<Markers>> => {
	if (MarkerID == 0) {
		return Promise.reject(<CommandResponse<Markers>>{
			status: 422,
			message: ErrorCodeLookup.EC2026
		});
	}

	return MarkersRepository.queryByLookupCode(MarkerID)
		.then((existingProduct: (MarkersModel | null)): Promise<CommandResponse<Markers>> => {
			if (!existingProduct) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 404,
					message: ErrorCodeLookup.EC1001
				});
			}

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 200,
				data: mapProductData(existingProduct)
			});
		});
};
