// import { frenchWordDatabase } from '../singletons/Singletons';// FIXME : use dependency injection instead ?

import { Command, Argument } from 'commander';
import { ConfigureCommand, Logger, XtermCommand } from './XtermCommand';
import { FrenchWordDatabase } from '../../../domain/adapters/FrenchWordDatabase';
import { DatabaseCommand } from '../../domain/DatabaseCommand';
import { IWordDatabase } from 'word-guessing-lib';

export class DatabaseCommander extends XtermCommand {

  configureCommand: ConfigureCommand;

  databaseCommand: DatabaseCommand;

  constructor(frenchDatabase: IWordDatabase, englishDatabase: IWordDatabase,  configureCommand: ConfigureCommand, logger: Logger) {
    super(logger);

    this.configureCommand = configureCommand;

    this.databaseCommand = new DatabaseCommand(logger, frenchDatabase, englishDatabase);
  }

  public setup(): void {
    this.name('database');
    this.alias('db');

    const wasmCommand = this.command('wasm');
    this.configureCommand(wasmCommand);
    wasmCommand
      // .alias('wasm')
      .description('Indicate the status of the loading of the WASM')
      .action(() => {
        this.logger.info('Not implemented');
      });

    // TODO : re implement this

    // const statusCommand = this.command('status');
    // this.configureCommand(statusCommand);
    // statusCommand
    //   // .alias('status')
    //   .description('Indicate the status of database')
    //   .action(() => {
    //     // TODO : this should be computed
    //     // TODO : check multiple status (WASM etc)
    //     if (this.frenchWordDatabase.wasInit === true) {
    //       this.logger.info('The database was initialized');
    //     } else {
    //       this.logger.info('The database was not initialized');
    //     }
    //   });

    const countCommand = this.command('count');
    this.configureCommand(countCommand);
    countCommand
      // .alias('status')
      .description('Indicate word and sequence of letters count')
      .action(() => {
        this.databaseCommand.count();
      });

    // TODO : re implement this

    // const dropCommand = this.command('drop');
    // this.configureCommand(dropCommand);
    // dropCommand
    //   // .alias('status')
    //   .description('Drop the database')
    //   .action(async () => {
    //     this.logger.newLine();
    //     this.logger.writeLn(`Dropping the database`);
    //     await this.frenchWordDatabase.delete();
    //     this.logger.writeLn(`Database was dropped`);
    //     this.logger.prompt();
    //   });

    // TODO : init (using a factory)
  }

}

