import { CstNode, IToken, Lexer } from "chevrotain";
import { DocumentRange } from "../../types";
import { ParseError } from "../../worker-errors";
import { ShakespeareParser } from "./parser";
import { AllTokens } from "./tokens";
import { ShakespeareVisitor } from "./visitor";
import { Program } from "./visitor-types";

export class Parser {
  private readonly _lexer: Lexer = new Lexer(AllTokens);
  private readonly _parser: ShakespeareParser = new ShakespeareParser();
  private readonly _visitor: ShakespeareVisitor = new ShakespeareVisitor();

  public parse(text: string): Program {
    const tokens = this.runLexer(text);
    const cst = this.runParser(tokens);
    return this.runVisitor(cst);
  }

  private runLexer(text: string): IToken[] {
    const { tokens, errors } = this._lexer.tokenize(text);
    if (errors.length > 0) {
      const error = errors[0];
      throw new ParseError(error.message, {
        startLine: error.line ? error.line - 1 : 0,
        startCol: error.column && error.column - 1,
        endCol: error.column && error.column + error.length - 1,
      });
    }
    return tokens;
  }

  private runParser(tokens: IToken[]): CstNode {
    this._parser.input = tokens;
    const parseResult = this._parser.program();
    if (this._parser.errors.length > 0) {
      const error = this._parser.errors[0];
      throw new ParseError(error.message, this.getRange(error.token));
    }

    return parseResult;
  }

  private runVisitor(cst: CstNode): Program {
    return this._visitor.visit(cst);
  }

  private getRange(token: IToken): DocumentRange {
    const startLine = (token.startLine || 1) - 1;
    const startCol = token.startColumn && token.startColumn - 1;
    const endCol = token.endColumn;
    return { startLine, startCol, endCol };
  }
}
