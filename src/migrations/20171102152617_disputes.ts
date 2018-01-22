import * as Knex from "knex";

exports.up = async (knex: Knex): Promise<any> => {
  return knex.schema.dropTableIfExists("disputes").then( (): PromiseLike<any> => {
    return knex.schema.createTable("disputes", (table: Knex.CreateTableBuilder): void => {
      table.increments("disputeID");
      table.string("crowdsourcerID", 42).notNullable();
      table.specificType("blockNumber", "integer NOT NULL CONSTRAINT positiveOrderBlockNumber CHECK (\"blockNumber\" > 0)");
      table.string("transactionHash", 66).notNullable();
      table.specificType("logIndex", "integer NOT NULL CONSTRAINT \"nonnegativelogIndex\" CHECK (\"logIndex\" >= 0)");
      table.integer("reporter").notNullable();
      table.specificType("amountStaked", "NUMERIC").defaultTo(0).notNullable();
      table.integer("redeemed").nullable();


      table.index(["crowdsourcer"]);
      table.index(["reporter"]);
      table.unique(["transactionHash", "logIndex"]);

    });
  });
};

exports.down = async (knex: Knex): Promise<any> => {
  return knex.schema.dropTableIfExists("disputes");
};
