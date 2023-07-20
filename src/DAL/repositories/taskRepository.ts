import * as dataManager from "../connection-manager";
import { ProductEntity } from "../entity/product-entity";
import * as productConverter from "../convertors/productModelConvertor";
import {
  CreateProductRequestBody,
  Polygon,
  Product,
  UpdateProductRequestBody,
} from "../../products/product-schema";
import { logger } from "../../common/logger/logger-wrapper";
import { DataSource, Repository, SelectQueryBuilder } from "typeorm";
import { ProductFilter } from "../../products/product-filter-schema";
import {
  ProductGeoShapeFilterOperators,
  ProductOperator,
} from "../../products/product-enums";
import * as wkx from "wkx";
import { ResourceNotFoundError } from "../../common/errors/error-types";
import { TaskEntity } from "../entity/task";

export class TaskRepository extends Repository<TaskRepository> {
  constructor(private dataSource: DataSource) {
    super(TaskEntity, dataSource.createEntityManager());
  }
  public async createProduct(
    reqBody: CreateProductRequestBody
  ): Promise<string> {
    const entity = productConverter.createModelToEntity(reqBody);
    const res = await this.createQueryBuilder()
      .insert()
      .values(entity)
      .returning("id")
      .execute();
    return res.identifiers[0]["id"];
  }
}
