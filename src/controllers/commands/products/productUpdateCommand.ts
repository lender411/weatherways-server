import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import * as ProductRepository from "../models/entities/productModel";
import { CommandResponse, Markers, MarkersSaveRequest } from "../../typeDefinitions";
import { MarkersModel } from "../models/entities/productModel";

const validateSaveRequest = (saveProductRequest: MarkersSaveRequest): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };

	if ((saveProductRequest.id == null) || (saveProductRequest.id.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2025;
	} else if ((saveProductRequest.location == null) || (saveProductRequest.location.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2026;
	} else if ((saveProductRequest.MarkerID == null) || isNaN(saveProductRequest.MarkerID)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if (saveProductRequest.MarkerID < 0) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	}

	return validationResponse;
};

export const execute = async (saveProductRequest: MarkersSaveRequest): Promise<CommandResponse<Markers>> => {
	const validationResponse: CommandResponse<Markers> = validateSaveRequest(saveProductRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	let updateTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((startedTransaction: Sequelize.Transaction): Promise<MarkersModel | null> => {
			updateTransaction = startedTransaction;

			return ProductRepository.queryById(<string>saveProductRequest.id, updateTransaction);
		}).then((queriedProduct: (MarkersModel | null)): Promise<MarkersModel> => {
			if (queriedProduct == null) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 404,
					message: ErrorCodeLookup.EC1001
				});
			}
			else
				return queriedProduct.update(
				<Object>{

					Longitude: saveProductRequest.Longitude,
					Latitude: saveProductRequest.Latitude,
					ArrivalTime: saveProductRequest.ArrivalTime
				},
				<Sequelize.InstanceUpdateOptions>{ transaction: updateTransaction });
		}).then((updatedProduct: MarkersModel): Promise<CommandResponse<Markers>> => {
			updateTransaction.commit();

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 200,
				data: <Markers>{
					id: updatedProduct.id,
					MarkerID: updatedProduct.MarkerID,
					Latitude:updatedProduct.Latitude,
					ArrivalTime: Helper.formatDate(updatedProduct.ArrivalTime),
					Longitude:updatedProduct.Longitude,
					Temperature: updatedProduct.Temperature,
					precipChance: updatedProduct.precipChance,
					location: updatedProduct.location
				}
			});
		}).catch((error: any): Promise<CommandResponse<Markers>> => {
			if (updateTransaction != null) {
				updateTransaction.rollback();
			}

			return Promise.reject(<CommandResponse<Markers>>{
				status: (error.status || 500),
				message: (error.messsage || ErrorCodeLookup.EC1002)
			});
		});
};
