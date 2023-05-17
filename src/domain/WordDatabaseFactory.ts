import { Logger } from "../commands/adapters/commander/XtermCommand";
import { SupportedLangDatabases, WordDatabaseStore } from "./WordDatabaseStore";
import { EnglishWordDatabase } from "./adapters/EnglishWordDatabase";
import { FrenchWordDatabase } from "./adapters/FrenchWordDatabase";

export class WordDatabaseFactory {

  logger: Logger;
  baseUrl: string;
  supportedLangDatabases: SupportedLangDatabases;

  store: WordDatabaseStore;

  constructor(logger: Logger, baseUrl: string, supportedLangDatabases: SupportedLangDatabases) {
    this.logger = logger;
    this.baseUrl = baseUrl;
    this.supportedLangDatabases = supportedLangDatabases;

    // FIXME : find a isNullOrUndefinedOrEmpty etc library
    // Or make it
    if (baseUrl === "") {
      console.warn("baseUrl is empty, the system might not work as expected");
    }

    this.store = new WordDatabaseStore(logger, baseUrl, supportedLangDatabases);
  }

  async getFrenchWordDatabase() {
    if (this.store.sqlite === undefined) {
      await this.store.initSQL();
    }
    const sqliteDatabase = await this.store.getFrenchDatabase();

    return new FrenchWordDatabase(this.logger, sqliteDatabase);
  }

  async getEnglishWordDatabase() {
    if (this.store.sqlite === undefined) {
      await this.store.initSQL();
    }
    const sqliteDatabase = await this.store.getEnglishDatabase();

    return new EnglishWordDatabase(this.logger, sqliteDatabase);
  }

}
