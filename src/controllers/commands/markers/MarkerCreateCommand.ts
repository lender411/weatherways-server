import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import * as MarkersRepository from "../models/entities/MarkerEntity";
import { CommandResponse, Markers, MarkersSaveRequest } from "../../typeDefinitions";
import { MarkerEntity } from "../models/entities/MarkerEntity";

const validateSaveRequest = (saveMarkersRequest: MarkersSaveRequest): CommandResponse<Markers> => {
	const validationResponse: CommandResponse<Markers> =
		<CommandResponse<Markers>>{ status: 200 };
	if ((saveMarkersRequest.MarkerID == null) || isNaN(saveMarkersRequest.MarkerID)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if((saveMarkersRequest.id == null || saveMarkersRequest.id.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2026;
	}  else if (saveMarkersRequest.MarkerID < 0) {
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

	const request = require("request");
	const openWeatherKey = "80f0f7a1ea95a376129420c77fe45bb9";
	const url = `http://api.openweathermap.org/data/2.5/weather?lat=${saveMarkersRequest.Latitude}&lon=${saveMarkersRequest.Longitude}&appid=${openWeatherKey}&units=imperial`;
    let object = "";
	request(url, function (err, response, body) {
		if(err) {
			console.log("error:", err);
		} else {
			object = body;
			// console.log("body:", body);
		}
	});
	console.log("json", object);
	const weather = JSON.parse(object);

	console.log("it breaks in create3", object);
	// sends current data not arrival time data
	// sends cloud cover instead of precipitation chance because I cant find it in the messages anymore
	const markerToCreate: MarkerEntity = <MarkerEntity>{
		id:saveMarkersRequest.id,
		Temperature: weather.main.temp,
		MarkerID: saveMarkersRequest.MarkerID,
		precipChance: weather.clouds.all,
		Latitude: saveMarkersRequest.Latitude,
		Longitude: saveMarkersRequest.Longitude,
		location: saveMarkersRequest.location,
		ArrivalTime: saveMarkersRequest.ArrivalTime
	};

	let createMarker: Sequelize.Transaction;

	return DatabaseConnection.startTransaction() 
		.then((createdTransaction: Sequelize.Transaction): Promise<MarkerEntity> => {
			createMarker = createdTransaction;
			console.log("it breaks in create2", object);
			return MarkersRepository.created(markerToCreate, createMarker);
		}).then((createdMarker: MarkerEntity): Promise<CommandResponse<Markers>> => {
			createMarker.commit();

			return Promise.resolve(<CommandResponse<Markers>>{
				status: 201,
				data: <Markers>{
					id: createdMarker.id,
					MarkerID: createdMarker.MarkerID,
					location: createdMarker.location,
					ArrivalTime: Helper.formatDate(createdMarker.ArrivalTime),
					Longitude: createdMarker.Longitude,
					Latitude: createdMarker.Latitude,
					Temperature: createdMarker.Temperature,
					precipChance: createdMarker.precipChance
				}
			});
		}).catch((error: any): Promise<CommandResponse<Markers>> => {
			if (createMarker != null) {

				console.log("it breaks in create", object);
				createMarker.rollback();

					}

			return Promise.reject(<CommandResponse<Markers>>{
				console: "it breaks in create",
				status: (error.status || 500),
				message: (error.message || ErrorCodeLookup.EC1002)
			});
		});
};
