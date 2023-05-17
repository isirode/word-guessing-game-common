import { GuessResult, IWordDatabase, SupportedLanguages, WordGame } from "word-guessing-lib";
import { Logger } from "../adapters/commander/XtermCommand";

export class WordGameCommand {

  logger: Logger;
  wordGame: WordGame;
  frenchDatabase: IWordDatabase;
  englishDatabase: IWordDatabase;

  constructor(logger: Logger, wordGame: WordGame, frenchDatabase: IWordDatabase, englishDatabase: IWordDatabase) {
    this.logger = logger;
    this.wordGame = wordGame;
    this.frenchDatabase = frenchDatabase;
    this.englishDatabase = englishDatabase;
  }

  newSequence() {
    this.logger.newLine();
    this.logger.writeLn('New sequence: ' + this.wordGame.getNewSequence());
    if (this.wordGame.wordGameOptions.maxAttempts > 0) {
      this.logger.writeLn(`You have ${this.wordGame.remainingAttempts()} attempts to find a word containing this sequence of letters.`);
    } else {
      this.logger.writeLn('You have unlimited attempts to find a word containing this sequence of letters.');
    }
    this.logger.prompt();
  }

  example(sequence: string | undefined) {
    if (sequence != undefined) {
      this.wordGame.currentSequence = {
        language: this.wordGame.currentLanguage,
        stringSequence: sequence
      };
    }
    try {
      this.logger.info('Example: ' + this.wordGame.getExampleForSequence());
    } catch (error) {
      this.logger.error(error);
    }
  }

  verify(sequence: string, word: string) {
    this.logger.newLine();
    const actualSequence = sequence.toUpperCase();
    this.logger.writeLn('Verifying ' + word + ' against ' + actualSequence);
    this.wordGame.currentSequence = {
      language: this.wordGame.currentLanguage,
      stringSequence: actualSequence,
    };
    const result = this.wordGame.verifyGuess(word);
    switch (result) {
      case GuessResult.SUCCESSFUL_GUESS:
        this.logger.writeLn('Success !')
        break;
      case GuessResult.WORD_DO_NOT_EXIST:
        this.logger.writeLn('This word do not exist in the database.');
        break;
      case GuessResult.WORD_DO_NOT_MATCH_SEQUENCE:
        this.logger.writeLn(`This word do not match the current sequence ('${this.wordGame.currentSequence}').`);
        break;
      default:
        this.logger.writeLn('Internal error');
        console.error(`GuessResult '${result} is unknown`);
    }
    this.wordGame.reset();
    this.logger.prompt();
  }

  setLanguage(language: string) {
    let fullLanguageName: string = "";
    let languageCode: SupportedLanguages;
    switch (language) {
      case "eng":
      case "english":
        languageCode = "eng";
        fullLanguageName = "english";
        break;
      case "fra":
      case "french":
        languageCode = "fra";
        fullLanguageName = "french";
        break;
      default:
        throw new Error(`unknown language '${language}'`);
    }
    this.wordGame.wordGameOptions.language = languageCode;
    this.logger.info(`The language is now ${fullLanguageName}`);
  }

  setMinOccurences(minOccurences: number) {
    this.wordGame.wordGameOptions.minOccurences = minOccurences;
    this.logger.info('Configuration modified');
  }

  setMaxOccurences(maxOccurences: number) {
    this.wordGame.wordGameOptions.maxOccurences = maxOccurences;
    this.logger.info('Configuration modified');
  }

  setMaxAttempts(maxAttempts: number) {
    this.wordGame.wordGameOptions.maxAttempts = maxAttempts;
    this.logger.info('Configuration modified');
  }

  printConfiguration() {
    this.logger.newLine()
    this.logger.writeLn('Configuration:');
    this.logger.writeLn(JSON.stringify(this.wordGame.wordGameOptions));
    this.logger.prompt();
  } 
}
