import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import * as MarkersRepository from "../models/entities/MarkersModel";
import { CommandResponse, Markers, MarkersSaveRequest } from "../../typeDefinitions";
import { MarkersModel } from "../models/entities/MarkersModel";

const validateSaveRequest = (saveMarkerRequest: MarkersSaveRequest): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };

	if ((saveMarkerRequest.id == null) || (saveMarkerRequest.id.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2025;
	} else if ((saveMarkerRequest.MarkerID == null) || isNaN(saveMarkerRequest.MarkerID)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if (saveMarkerRequest.MarkerID < 0) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	}

	return validationResponse;
};

export const execute = async (saveMarkersRequest: MarkersSaveRequest): Promise<CommandResponse<Markers>> => {
	const validationResponse: CommandResponse<Markers> = validateSaveRequest(saveMarkersRequest);
	if (validationResponse.status !== 200) {
		return Promise.reject(validationResponse);
	}

	let updateTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((startedTransaction: Sequelize.Transaction): Promise<MarkersModel | null> => {
			updateTransaction = startedTransaction;

			return MarkersRepository.queryById(<string>saveMarkersRequest.id, updateTransaction);
		}).then((queriedMarker: (MarkersModel | null)): Promise<MarkersModel> => {
			if (queriedMarker == null) {
				return Promise.reject(<CommandResponse<Markers>>{
					status: 404,
					message: ErrorCodeLookup.EC1001
				});
			}
			else
				return queriedMarker.update(
				<Object>{

					Longitude: saveMarkersRequest.Longitude,
					Latitude: saveMarkersRequest.Latitude,
					ArrivalTime: saveMarkersRequest.ArrivalTime
				},
				<Sequelize.InstanceUpdateOptions>{ transaction: updateTransaction });
		}).then((updatedMarker: MarkersModel): Promise<CommandResponse<Markers>> => {
			updateTransaction.commit();

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 200,
				data: <Markers>{
					id: updatedMarker.id,
					MarkerID: updatedMarker.MarkerID,
					Latitude:updatedMarker.Latitude,
					ArrivalTime: Helper.formatDate(updatedMarker.ArrivalTime),
					Longitude:updatedMarker.Longitude,
					Temperature: updatedMarker.Temperature,
					precipChance: updatedMarker.precipChance,
					location: updatedMarker.location
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
