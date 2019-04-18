import Bluebird from "bluebird";
import Sequelize from "sequelize";
import { CommandResponse } from "../../typeDefinitions";
import { ErrorCodeLookup } from "../../lookups/stringLookup";
import { ProductInstance } from "../models/entities/cartEntity";
import * as DatabaseConnection from "../models/databaseConnection";
import * as CartRepository from "../models/repositories/cartRepository";

export let execute = (productId?: string): Bluebird<CommandResponse<void>> => {
	if ((productId == null) || (productId.trim() === "")) {
		return Bluebird.resolve(<CommandResponse<void>>{ status: 204 });
	}

	let deleteTransaction: Sequelize.Transaction;

	return DatabaseConnection.startTransaction()
		.then((startedTransaction: Sequelize.Transaction): Bluebird<ProductInstance | null> => {
			deleteTransaction = startedTransaction;

			return CartRepository.queryById(productId, deleteTransaction);
		}).then((queriedProduct: (ProductInstance | null)): Bluebird<void> => {
			if (queriedProduct == null) {
				return Bluebird.resolve();
			}

			return CartRepository.destroy(queriedProduct, deleteTransaction);
		}).then((): Bluebird<CommandResponse<void>> => {
			deleteTransaction.commit();

			return Bluebird.resolve(<CommandResponse<void>>{ status: 204 });
		}).catch((error: any): Bluebird<CommandResponse<void>> => {
			if (deleteTransaction != null) {
				deleteTransaction.rollback();
			}

			return Bluebird.reject(<CommandResponse<void>>{
				status: (error.status || 500),
				message: (error.message || ErrorCodeLookup.EC1003)
			});
		});
};
