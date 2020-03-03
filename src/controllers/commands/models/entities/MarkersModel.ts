import Sequelize from "sequelize";
import { DatabaseConnection } from "../databaseConnection";
import { DatabaseTableName } from "../constants/databaseTableNames";
import { MarkersFieldName } from "../constants/fieldNames/markerFiledNames";
import { Model, DataTypes, InitOptions, ModelAttributes, ModelAttributeColumnOptions } from "sequelize";


export class MarkersModel extends Model {
	public MarkerID!: number;
	public Temperature!: number;
	public precipChance!: number;
	public Latitude!: number;
	public Longitude!: number;
	public location!: string;
	public readonly id!: string;
	public readonly ArrivalTime!: Date;

}

MarkersModel.init(
	<ModelAttributes>{
		id: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.ID,
			type: DataTypes.UUID,
			autoIncrement: true,
			primaryKey: true

		},
		MarkerID: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.MarkerID,
			type: DataTypes.INTEGER,
			primaryKey: true
		},
		ArrivalTime: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.ArrivalTime,
			type: new DataTypes.DATE(),
			allowNull: true
		},
		Temperature: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.Temperature,
			type: new DataTypes.INTEGER,
			allowNull: false,
		},
		Latitude: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.Latitude,
			type: new DataTypes.DECIMAL,
		},
		Longitude: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.Longitude,
			type: new DataTypes.DECIMAL,
		},
		precipChance: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.precipChance,
			type: new DataTypes.INTEGER
		},
		location: <ModelAttributeColumnOptions>{
			field: MarkersFieldName.location,
			type: new DataTypes.STRING(32)
		}
	}, <InitOptions>{
		timestamps: false,
		freezeTableName: true,
		sequelize: DatabaseConnection,
		tableName: DatabaseTableName.MARKERS
	});

const Op = Sequelize.Op;

export const queryById = async (): Promise<MarkersModel[]> => {
	return MarkersModel.findAll(<Sequelize.FindOptions>{
		id: [ [MarkersFieldName.ID, "ASC"]]
	});
};

export const queryByMarkerID = async (MarkerID: number, queryTransaction?: Sequelize.Transaction): Promise<MarkersModel | null> => {
	return MarkersModel.findOne(<Sequelize.FindOptions>{
		transaction: queryTransaction,
		where: <Sequelize.WhereOptions>{ MarkerID: MarkerID }
	});
};


export const queryAll = async (): Promise<MarkersModel[]> => {
	return MarkersModel.findAll(<Sequelize.FindOptions>{
		id: [ [MarkersFieldName.ArrivalTime, "ASC"] ]
	});
};

export const searchAll = async (query: string): Promise<MarkersModel[]> => {
	return MarkersModel.findAll({
		where: {
			MarkerID: { [Op.like]: query + "%" }
		}
	});
};

export const create = async (newMarker: MarkersModel, createTransaction?: Sequelize.Transaction): Promise<MarkersModel> => {
	return MarkersModel.create(
		newMarker,
		<Sequelize.CreateOptions>{
			transaction: createTransaction
		});
};

export const destroy = async (markerListEntry: MarkersModel, destroyTransaction?: Sequelize.Transaction): Promise<void> => {
	return markerListEntry.destroy(
		<Sequelize.InstanceDestroyOptions>{
			transaction: destroyTransaction
		});
};
