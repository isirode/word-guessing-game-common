import { Argument, Command } from 'commander';
import { ConfigureCommand, Logger, XtermCommand } from './XtermCommand';
import { WordGame, GuessResult, IWordDatabase } from 'word-guessing-lib';
import { WordGameCommand } from '../../domain/WordGameCommand';

export class WordGameCommander extends XtermCommand {

  configureCommand: ConfigureCommand;

  wordGameCommand: WordGameCommand;

  constructor(wordGame: WordGame, configureCommand: ConfigureCommand, logger: Logger, frenchDatabase: IWordDatabase, englishDatabase: IWordDatabase) {
    super(logger);

    this.configureCommand = configureCommand;

    this.wordGameCommand = new WordGameCommand(logger, wordGame, frenchDatabase, englishDatabase);
  }

  public setup() {
    this.name('word-game');
    this.alias('wg');

    // TODO : the logic should not be dependent on commander

    // TODO : command with a sequence as a parameter assign, new with option ?
    this.command('new-sequence')
      .alias('new')
      .description('Generate a new sequence')
      .action(() => {
        this.wordGameCommand.newSequence();
      });

    this.command('language')
      .alias('lang')
      .description('Change the language')
      .argument('[language]', 'the language to use("fra" or "french", "eng", or "english")')
      .action((language: string) => {
        console.log("language command " + language);
        this.wordGameCommand.setLanguage(language);
      });

    const exampleCommand = this.command('example');
    this.configureCommand(exampleCommand);// FIXME : this is called but not used
    exampleCommand
      .alias('ex')
      .description('Provide an example based on the current sequence')
      .argument('[sequence]', 'the sequence to use')
      .action((sequence: string) => {
        this.wordGameCommand.example(sequence);
      });

    this.command('verify')
      .description('Verify a word and a sequence')
      .argument('<sequence>', 'the sequence to use')
      .argument('<word>', 'the word to verify')
      .action((sequence: string, word: string) => {
        this.wordGameCommand.verify(sequence, word);
      });

    // TODO : use the system made in the other project to set the settings
    const setMinOccurencesCommand = this.command('set-min-occurences');
    this.configureCommand(setMinOccurencesCommand);
    setMinOccurencesCommand
      .alias('set-min')
      .description('Set the minimum of occurences of the sequences searched. It will not search for sequence of letters with a number of word lesser than this value.')
      .argument('<min-occurences>', 'minimum of occurences')
      .action((minOccurences: number) => {
        this.wordGameCommand.setMinOccurences(minOccurences);
      });

      const setMaxOccurencesCommand = this.command('set-max-occurences');
      this.configureCommand(setMaxOccurencesCommand);
      setMaxOccurencesCommand
        .alias('set-max')
        .description('Set the maximum of occurences of the sequences searched. It will not search for sequence of letters with a number of word superior to this value.')
        .argument('<max-occurences>', 'maximum of occurences')
        .action((maxOccurences: number) => {
          this.wordGameCommand.setMaxOccurences(maxOccurences);
        });

        const printConfigurationCommand = this.command('print-configuration');
        this.configureCommand(printConfigurationCommand);
        printConfigurationCommand
          .aliases(['print-conf', 'conf'])
          .description('Display the configuration of the game.')
          .action(() => {
            this.wordGameCommand.printConfiguration();
          });

        const setMaxAttemptsCommand = this.command('set-max-attempts');
        this.configureCommand(setMaxAttemptsCommand);
        setMaxAttemptsCommand
          .aliases(['attempts'])
          .description('Set the maximum number of attempts to find a word containing the sequence of letters.')
          .argument('<max-attempts>', 'maximum of number of attempts')
          .action((maxAttempts: number) => {
            this.wordGameCommand.setMaxAttempts(maxAttempts);
          });
  }

}
