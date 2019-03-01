import Bluebird from "bluebird";
import Sequelize from "sequelize";
import * as Helper from "../helpers/helper";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import * as DatabaseConnection from "../models/databaseConnection";
import * as EmployeeRepository from "../models/repositories/employeeRepository";
import { CommandResponse, Employee, EmployeeSaveRequest } from "../../typeDefinitions";
import { EmployeeInstance, EmployeeAttributes } from "../models/entities/employeeEntity";

const validateSaveRequest = (saveEmployeeRequest: EmployeeSaveRequest): CommandResponse<Employee> => {
	const validationResponse: CommandResponse<Employee> =
		<CommandResponse<Employee>>{ status: 200 };

	if ((saveEmployeeRequest.id == null) || isNaN(saveEmployeeRequest.id)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2026;
	} else if (saveEmployeeRequest.id < 0) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	} else if (saveEmployeeRequest.firstName == null) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if (saveEmployeeRequest.lastName == null) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if ((saveEmployeeRequest.employeeId == null) || isNaN(saveEmployeeRequest.employeeId)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if (saveEmployeeRequest.employeeId < 0) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	} else if (saveEmployeeRequest.active == null) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2027;
	} else if ((saveEmployeeRequest.manager == null ) || isNaN(saveEmployeeRequest.employeeId)) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	} else if (saveEmployeeRequest.manager < 0) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2028;
	} else if ((saveEmployeeRequest.password == null) || (saveEmployeeRequest.password.trim() === "")) {
		validationResponse.status = 422;
		validationResponse.message = ErrorCodeLookup.EC2026;
	}

	return validationResponse;
};

export let execute = (saveEmployeeRequest: EmployeeSaveRequest): Bluebird<CommandResponse<Employee>> => {
	const validationResponse: CommandResponse<Employee> = validateSaveRequest(saveEmployeeRequest);
	if (validationResponse.status !== 200) {
		return Bluebird.reject(validationResponse);
	}

	const employeeToCreate: EmployeeAttributes = <EmployeeAttributes>{
		id: saveEmployeeRequest.id,
		firstName: saveEmployeeRequest.firstName,
		lastName: saveEmployeeRequest.lastName,
		employeeId: saveEmployeeRequest.employeeId,
		active: saveEmployeeRequest.active,
		role: saveEmployeeRequest.role,
		manager: saveEmployeeRequest.manager,
		password: saveEmployeeRequest.password
	};

	let createEmployee: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((createdTransaction: Sequelize.Transaction): Bluebird<EmployeeInstance | null> => {
			createEmployee = createdTransaction;

			return EmployeeRepository.queryById(
				saveEmployeeRequest.id,
				createEmployee);
		}).then((existingEmployee: (EmployeeInstance | null)): Bluebird<EmployeeInstance> => {
			if (existingEmployee != null) {
				return Bluebird.reject(<CommandResponse<Employee>>{
					status: 409,
					message: ErrorCodeLookup.EC2029
				});
			}

			return EmployeeRepository.create(employeeToCreate, createEmployee);
		}).then((createdEmployee: EmployeeInstance): Bluebird<CommandResponse<Employee>> => {
			createEmployee.commit();

			return Bluebird.resolve(<CommandResponse<Employee>>{
				status: 201,
				data: <Employee>{
					id: createdEmployee.id,
					firstName: createdEmployee.firstName,
					lastName: createdEmployee.lastName,
					employeeId: createdEmployee.employeeId,
					active: createdEmployee.active,
					role: createdEmployee.role,
					manager: createdEmployee.manager,
					password: createdEmployee.password,
					createdOn: Helper.formatDate(createdEmployee.createdOn)
				}
			});
		}).catch((error: any): Bluebird<CommandResponse<Employee>> => {
			if (createEmployee != null) {
				createEmployee.rollback();
			}

			return Bluebird.reject(<CommandResponse<Employee>>{
				status: (error.status || 500),
				message: (error.message || ErrorCodeLookup.EC1002)
			});
		});
};
