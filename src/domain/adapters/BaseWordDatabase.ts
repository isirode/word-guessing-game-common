import type { IWordDatabase } from 'word-guessing-lib';
import { Logger } from '../../commands/adapters/commander/XtermCommand';
// TODO : it is not easily usable, find a solution when we have time for this
// We cannot use the code as is
// This is not possible for instance
// const sequence = stmt.getAsObject()
// result = sequence.sequence
// And the type code, not maintained by the provider of the lib, does not indicate how to use it
// import initSqlJs, { Database } from 'sql.js'
import { Database } from 'sql.js';

export class BaseWordDatabase implements IWordDatabase {
  logger: Logger;
  sqliteDatabase: any;
  // sqlDB: Database
  sequencesCount: number = -1;

  constructor (logger: Logger, sqliteDatabase: Database) {
    this.logger = logger;
    this.sqliteDatabase = sqliteDatabase;

    console.log("sqliteDatabase");
    console.log(sqliteDatabase);

    const sequenceCount = this.countSequences();

    if (sequenceCount === undefined) {
      // TODO : it is probably better to catch the errors and log them elsewhere
      // TODO : uniformize the formats of errors
      this.logger.error('Error: No sequences are present in the database');
      throw new Error('No sequences were present in the database')
    } else {
      this.sequencesCount = sequenceCount;
    }

    const wordCount = this.countWords();

    if (wordCount === undefined) {
      // TODO : it is probably better to catch the errors and log them elsewhere
      // TODO : uniformize the formats of errors
      this.logger.error('Error: No words are present in the database');
      throw new Error('No sequences were present in the database')
    } else {
      this.sequencesCount = sequenceCount;
    }

    this.logger.writeLn('Word count: ' + wordCount);
    this.logger.writeLn('Sequence count: ' + sequenceCount);

    // TODO : move it to an extension
    // TODO : create a collate ?
    function compareInsensitive (word1: string, word2: string) {
      return word1.localeCompare(word2, 'fr', { sensitivity: 'base' }) === 0;
    }
    this.sqliteDatabase.create_function('compareInsensitive', compareInsensitive);

    // TODO : make a lib for all this
    // TODO : this does not work with accents
    // Checkout instr maybe
    function containsInsensitive (word1: string, word2: string) {
      return word1.search(new RegExp(word2, 'i')) !== -1;
    }
    this.sqliteDatabase.create_function('containsInsensitive', containsInsensitive);
  }


  // FIXME : should it throw an exception instead ?
  public countSequences(): number | undefined {
    const stmt = this.sqliteDatabase.prepare('SELECT count(*) as c FROM sequences');
    while (stmt.step()) {
      const count = stmt.getAsObject()
      return count.c;
    }
    return undefined;
  }

  // FIXME : should it throw an exception instead ?
  public countWords(): number | undefined {
    const stmt = this.sqliteDatabase.prepare('SELECT count(*) as c FROM words');
    while (stmt.step()) {
      const count = stmt.getAsObject()
      return count.c;
    }
    return undefined;
  }

  public getSequence (minOccurences: number, maxOccurences: number): string {
    /*
    const id = Math.floor(Math.random() * this.sequencesCount) + 0
    const stmt = this.sqlDB.prepare("SELECT * FROM sequences WHERE id=:id LIMIT 1")
    stmt.bind({
      ':id': id
    })
    */
    const stmt = this.sqliteDatabase.prepare('SELECT * FROM sequences WHERE occurences BETWEEN :minOccurences AND :maxOccurences ORDER BY RANDOM() LIMIT 1')
    stmt.bind({
      ':minOccurences': minOccurences,
      ':maxOccurences': maxOccurences
    })
    let result: string = ''
    while (stmt.step()) {
      const sequence = stmt.getAsObject()
      result = sequence.sequence
    }
    // free the memory used by the statement
    stmt.free()
    return result// .toLowerCase()
  }

  // TODO : check words and sequence like GAIE et égaie
  public wordExists (word: string): boolean {
    console.log('verifying if word exist (' + word + ')')
    // We dont use compare insensitive because it is too slow
    // const stmt = this.sqlDB.prepare("SELECT * FROM words WHERE compareInsensitive(word, :word) LIMIT 1")// COLLATE NOCASE

    // FIXME : how does it affect english results ? or other languages
    const normalizedWord = word.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
    console.log("normalized : " + normalizedWord);
    const stmt = this.sqliteDatabase.prepare('SELECT * FROM words WHERE normalized_word = :word LIMIT 1')// COLLATE NOCASE
    stmt.bind({
      ':word': normalizedWord
    });
    let result: string = '';
    while (stmt.step()) {
      const word = stmt.getAsObject()
      result = word.word
    }
    // free the memory used by the statement
    stmt.free()
    return result.length > 0
  }

  public getWord (sequence: string): string {
    const stmt = this.sqliteDatabase.prepare('SELECT * FROM words WHERE containsInsensitive(normalized_word, :sequence) LIMIT 1')// COLLATE NOCASE
    stmt.bind({
      ':sequence': sequence
    })
    let result: string = ''
    while (stmt.step()) {
      const word = stmt.getAsObject()
      result = word.word
    }
    // free the memory used by the statement
    stmt.free()
    return result
  }

  public getSequenceOccurences(sequence: string): number {
    const stmt = this.sqliteDatabase.prepare('SELECT * FROM sequences WHERE sequence = :sequence LIMIT 1')
    stmt.bind({
      ':sequence': sequence
    })
    let result: number = -1
    while (stmt.step()) {
      const resultObject = stmt.getAsObject()
      result = resultObject.occurences
    }
    // free the memory used by the statement
    stmt.free()
    return result
  }
}
