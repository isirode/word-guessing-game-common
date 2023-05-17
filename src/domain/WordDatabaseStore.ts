import type { IWordDatabase, SupportedLanguages } from 'word-guessing-lib'
import Dexie from 'dexie'
import { FetchProgress, SimpleProgressCallback } from '../utils/FetchProgress'
import { Logger } from '../commands/adapters/commander/XtermCommand'
// TODO : it is not easily usable, find a solution when we have time for this
// We cannot use the code as is
// This is not possible for instance
// const sequence = stmt.getAsObject()
// result = sequence.sequence
// And the type code, not maintained by the provider of the lib, does not indicate how to use it
// import initSqlJs, { Database } from 'sql.js'
import { Database } from 'sql.js';

const initSqlJs = require('sql.js');

export interface IFileDefinition {
  language: SupportedLanguages;
  filename: string;
}

interface IFile {
  id?: number;
  // FIXME : checkout how to do a schema migration in Dexie
  // rename this to language ?
  lang: SupportedLanguages;
  filename: string;
  blob: any;
}

export interface SupportedLangDatabases {
  english: IFileDefinition;
  french: IFileDefinition;
}

export class WordDatabaseStore extends Dexie {
  logger: Logger;
  baseUrl: string;
  supportedLangDatabases: SupportedLangDatabases;

  files: Dexie.Table<IFile, number>;
  sqlite: any = undefined;

  constructor (logger: Logger, baseUrl: string, supportedLangDatabases: SupportedLangDatabases) {
    super('WordDatabaseStore');

    this.logger = logger;
    this.baseUrl = baseUrl;
    this.supportedLangDatabases = supportedLangDatabases;

    this.version(1).stores({
      files: 'id++, lang, filename'
    });

    this.files = this.table('files');
  }

  initSQL = async () => {
    console.log('Querying sql.js WASM file');

    // TODO : should be able to use ParcelJS wasm import system here
    this.sqlite = await initSqlJs({
      // Required to load the wasm binary asynchronously. Of course, you can host it wherever you want
      // You can omit locateFile completely when running in node
      locateFile: file => `https://sql.js.org/dist/${file}`
    });
  }

  async getFrenchDatabase(): Promise<Database> {
    return this.getSqliteDatabase(this.supportedLangDatabases.french);
  }

  async getEnglishDatabase(): Promise<Database> {
    return this.getSqliteDatabase(this.supportedLangDatabases.english);
  }

  async getSqliteDatabase(fileDefinition: IFileDefinition): Promise<Database> {
    // TODO : fix duplication
    console.log('Initializing word database');
    let language: string = "";
    switch(fileDefinition.language) {
      case "eng":
        language = "english";
        break;
      case "fra":
        language = "french";
        break;
      default:
        throw new Error(`unknown languange '${fileDefinition.language}'`);
    }
    this.logger.writeLn(`Initializing word database for the ${language} language`);

    const file = await this.files.where('filename').equalsIgnoreCase(fileDefinition.filename).first();

    if (file === undefined) {
      try {
        console.log(`file ${fileDefinition.filename} is not present in database`);
        this.logger.writeLn(`Database file is not present in the local database storage`);
        this.logger.writeLn(`Downloading it from the server`);

        const fullUrl = this.baseUrl + fileDefinition.filename;

        console.log(`url is ${fullUrl}`);

        this.logger.newLine();
        this.logger.writeLn('Progress: ');
        let lastProgressPerCent: number = 0;
        const progressCallback: SimpleProgressCallback = {
          callback: (contentLength: number | null, currentProgress: number, lastChunkLength: number) => {
            if (contentLength === null) {
              return;
            }
            const progressInPerCent = currentProgress / contentLength * 100;
            if (progressInPerCent >= lastProgressPerCent + 10) {
              this.logger.writeLn(progressInPerCent.toFixed() + ' %');
              lastProgressPerCent += 10;
            }
          }
        }
        const fetchProgress: FetchProgress = new FetchProgress(progressCallback);
        const arrayFile = await fetchProgress.doFetch(fullUrl);

        if (arrayFile === null) {
          this.logger.error('Error: Database is null');
          throw new Error("Database file array is null");
        }
        if (arrayFile.length === 0) {
          this.logger.error('Error: Database is empty');
          throw new Error("Database file array is empty");
        }

        console.log(`database file size is : ${arrayFile.length}`);

        // FIXME : could use former version of the lang database
        let deleteCount = await this.files
          .where("lang").equals(fileDefinition.language)
          .delete();

        if (deleteCount !== 0) {
          console.log(`Delete ${deleteCount} of lang ${fileDefinition.language} because they did not matched the current version`);
        }

        const file: IFile = {
          lang: fileDefinition.language,
          filename: fileDefinition.filename,
          blob: arrayFile
        };

        const t0 = performance.now();

        const lastKey = await this.files.add(file);

        const t1 = performance.now();

        console.log(`File was inserted (key: ${lastKey}), it took ${(t1 - t0) / 1000} seconds`);

        const sqliteDatabase = new this.sqlite.Database(arrayFile);

        console.log(sqliteDatabase);
  
        this.logger.writeLn('Done !');
        this.logger.newLine();

        return sqliteDatabase;
      } catch (err) {
        console.error('Unexpected error occured while fetching SQLite word database from the server', err)
        throw err;
      }
      
    } else {
      console.log(`database ${fileDefinition.filename} is present in storage`);

      const file = await this.files.where('filename').equalsIgnoreCase(fileDefinition.filename).first();
      const arrayFile = file?.blob;

      if (arrayFile === null) {
        this.logger.error('Error: Database is null');
        throw new Error("Database file array is null");
      }
      if (arrayFile.length === 0) {
        this.logger.error('Error: Database is empty');
        throw new Error("Database file array is empty");
      }

      console.log(`database file size is : ${arrayFile.length}`);

      const sqliteDatabase = new this.sqlite.Database(arrayFile);

      console.log(sqliteDatabase);

      return sqliteDatabase;
    }
  }
}
