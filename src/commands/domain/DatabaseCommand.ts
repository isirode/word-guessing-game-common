import { IWordDatabase } from "word-guessing-lib";
import { Logger } from "../adapters/commander/XtermCommand";

// TODO : log the currently used database counts
// need to know wich database it is
// add a language property to the database, probably
export class DatabaseCommand {

  logger: Logger;
  frenchDatabase: IWordDatabase;
  englishDatabase: IWordDatabase;

  constructor(logger: Logger, frenchDatabase: IWordDatabase, englishDatabase: IWordDatabase) {
    this.logger = logger;
    this.frenchDatabase = frenchDatabase;
    this.englishDatabase = englishDatabase;
  }

  count() {
    this.logger.newLine();
    const frenchWordCount = this.frenchDatabase.countWords();
    const frenchSequenceCount = this.frenchDatabase.countSequences();
    this.logger.writeLn(`French word count is ${frenchWordCount}`);
    this.logger.writeLn(`French sequences count is ${frenchSequenceCount}`);

    const englishWordCount = this.frenchDatabase.countWords();
    const englishSequenceCount = this.frenchDatabase.countSequences();
    this.logger.writeLn(`English word count is ${englishWordCount}`);
    this.logger.writeLn(`English sequences count is ${englishSequenceCount}`);

    this.logger.prompt();
  }

}