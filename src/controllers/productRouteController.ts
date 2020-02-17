import * as restify from "restify";
import * as ProductQuery from "./commands/products/productQuery";
import * as ProductsQuery from "./commands/products/productsQuery";
import { ParameterLookup, ErrorCodeLookup } from "./lookups/stringLookup";
import * as ProductCreateCommand from "./commands/products/productCreateCommand";
import * as ProductDeleteCommand from "./commands/products/productDeleteCommand";
import * as ProductUpdateCommand from "./commands/products/productUpdateCommand";
import * as ProductSearchCommand from "./commands/products/productSearchCommand";
import { CommandResponse, Markers, MarkersSaveRequest } from "./typeDefinitions";

export const queryProducts = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	ProductsQuery.query()
		.then((productsQueryCommandResponse: CommandResponse<Markers[]>) => {
			res.send(
				productsQueryCommandResponse.status,
				productsQueryCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC2001));

			return next();
		});
};

export const searchProducts = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	ProductSearchCommand.search(req.params[ParameterLookup.ProductLookupCode])
		.then((productsQueryCommandResponse: CommandResponse<Markers[]>) => {
			res.send(
				productsQueryCommandResponse.status,
				productsQueryCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC2001));

			return next();
		});
};

export const queryProductById = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	ProductQuery.queryById(req.params[ParameterLookup.ProductId])
		.then((productQueryCommandResponse: CommandResponse<Markers>) => {
			res.send(
				productQueryCommandResponse.status,
				productQueryCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC2002));

			return next();
		});
};

export const queryProductByLookupCode = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	ProductQuery.queryByLookupCode(req.params[ParameterLookup.ProductLookupCode])
		.then((productQueryCommandResponse: CommandResponse<Markers>) => {
			res.send(
				productQueryCommandResponse.status,
				productQueryCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC2002));

			return next();
		});
};

const saveProduct = async (
	req: restify.Request,
	res: restify.Response,
	next: restify.Next,
	performSave: (productSaveRequest: MarkersSaveRequest) => Promise<CommandResponse<Markers>>): Promise<void> => {

	performSave(req.body)
		.then((productSaveCommandResponse: CommandResponse<Markers>) => {
			res.send(
				productSaveCommandResponse.status,
				productSaveCommandResponse.data);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC1002));

			return next();
		});
};

export const createProduct = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	saveProduct(req, res, next, ProductCreateCommand.execute);
};

export const updateProduct = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	saveProduct(req, res, next, ProductUpdateCommand.execute);
};

export const deleteProduct = async (req: restify.Request, res: restify.Response, next: restify.Next) => {
	ProductDeleteCommand.execute(req.params[ParameterLookup.ProductId])
		.then((productDeleteCommandResponse: CommandResponse<void>) => {
			res.send(productDeleteCommandResponse.status);

			return next();
		}, (error: any) => {
			res.send(
				(error.status || 500),
				(error.message || ErrorCodeLookup.EC1003));

			return next();
		});
};
