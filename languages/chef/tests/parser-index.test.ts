import { readTestProgram } from "../../test-utils";
import { parseProgram } from "../parser";
import { LoopCloseOp, LoopOpenOp } from "../types";

/** Absolute path to directory of sample programs */
const DIRNAME = __dirname + "/samples";

describe("Parsing entire programs", () => {
  test("Hello World Souffle", () => {
    const code = readTestProgram(DIRNAME, "hello-world-souffle");
    const program = parseProgram(code);
    expect(program.auxes).toEqual({});
    expect(program.main.name).toBe("Hello World Souffle");
    expect(program.main.serves).toEqual({ line: 19, num: 1 });

    // Lightly check list of ingredients
    const ingredients = program.main.ingredients;
    expect(Object.keys(ingredients).length).toBe(9);
    expect(ingredients["haricot beans"].type).toBe("dry");
    expect(ingredients["haricot beans"].value).toBe(72);
    expect(ingredients["eggs"].type).toBe("unknown");
    expect(ingredients["eggs"].value).toBe(101);
    expect(ingredients["oil"].type).toBe("unknown");
    expect(ingredients["oil"].value).toBe(111);
    expect(ingredients["water"].type).toBe("liquid");
    expect(ingredients["water"].value).toBe(119);

    // Check method operations
    const method = program.main.method;
    expect(method.length).toBe(14);
    expect(method.slice(0, 12).every((m) => m.op.code === "PUSH")).toBe(true);
    expect(method[12].op.code).toBe("LIQ-BOWL");
    expect(method[12].location.startLine).toBe(17);
    expect([403, 404]).toContain(method[12].location.startCol);
    expect([439, 440]).toContain(method[12].location.endCol);
    expect(method[13].op.code).toBe("COPY");
    expect(method[13].location.startLine).toBe(17);
  });

  test("Fibonacci Du Fromage", () => {
    const code = readTestProgram(DIRNAME, "fibonacci-fromage");
    const program = parseProgram(code);
    expect(program.main.name).toBe("Fibonacci Du Fromage");
    expect(program.main.serves).toEqual({ line: 30, num: 1 });

    // ====== MAIN RECIPE =======
    // Check the list of ingredients
    const mainIngredients = program.main.ingredients;
    expect(Object.keys(mainIngredients).length).toBe(2);
    expect(mainIngredients["numbers"]).toEqual({ type: "dry", value: 5 });
    expect(mainIngredients["cheese"]).toEqual({ type: "dry", value: 1 });

    // Check the method instructions
    const mainMethod = program.main.method;
    expect(mainMethod.length).toBe(19);
    expect(mainMethod[0].op.code).toBe("STDIN");
    expect(mainMethod[0].location.startLine).toBe(10);
    expect(mainMethod[0].location.startCol).toBe(0);
    expect(mainMethod[0].location.endCol).toBe(30);
    expect(mainMethod[18].op.code).toBe("COPY");
    expect(mainMethod[18].location.startLine).toBe(28);
    expect(mainMethod[18].location.startCol).toBe(0);
    expect(mainMethod[18].location.endCol).toBe(57);

    // Check loop jump addresses in method
    const mainOpener1 = mainMethod[8].op as LoopOpenOp;
    const mainCloser1 = mainMethod[10].op as LoopCloseOp;
    expect(mainOpener1.closer).toBe(10);
    expect(mainCloser1.opener).toBe(8);
    const mainOpener2 = mainMethod[14].op as LoopOpenOp;
    const mainCloser2 = mainMethod[17].op as LoopCloseOp;
    expect(mainOpener2.closer).toBe(17);
    expect(mainCloser2.opener).toBe(14);

    // ====== AUXILIARY RECIPE =========
    expect(Object.keys(program.auxes)).toEqual(["salt and pepper"]);
    const auxIngredients = program.auxes["salt and pepper"].ingredients;

    // Check the list of ingredients
    expect(Object.keys(auxIngredients).length).toBe(2);
    expect(auxIngredients["salt"]).toEqual({ type: "dry", value: 1 });
    expect(auxIngredients["pepper"]).toEqual({ type: "dry", value: 1 });

    // Check the method instructions
    const auxMethod = program.auxes["salt and pepper"].method;
    expect(auxMethod.length).toBe(5);
    expect(auxMethod[0].op.code).toBe("POP");
    expect(auxMethod[0].location.startLine).toBe(39);
    expect(auxMethod[0].location.startCol).toBe(0);
    expect(auxMethod[0].location.endCol).toBe(26);
    expect(auxMethod[4].op.code).toBe("ADD");
    expect(auxMethod[4].location.startLine).toBe(43);
    expect(auxMethod[4].location.startCol).toBe(0);
    expect(auxMethod[4].location.endCol).toBe(10);
  });

  test("Hello World Cake with Chocolate Sauce", () => {
    const code = readTestProgram(DIRNAME, "hello-world-cake");
    const program = parseProgram(code);
    expect(program.main.name).toBe("Hello World Cake with Chocolate sauce");
    expect(program.main.serves).toBeUndefined();

    // ====== MAIN RECIPE =======
    // Lightly check the list of ingredients
    const mainIngredients = program.main.ingredients;
    expect(Object.keys(mainIngredients).length).toBe(9);
    expect(mainIngredients["butter"]).toEqual({ type: "dry", value: 100 });
    expect(mainIngredients["baking powder"]).toEqual({ type: "dry", value: 2 });
    expect(mainIngredients["cake mixture"]).toEqual({ type: "dry", value: 0 });

    // Check the method instructions
    const mainMethod = program.main.method;
    expect(mainMethod.length).toBe(15);
    expect(mainMethod[0].op.code).toBe("PUSH");
    expect(mainMethod[0].location.startLine).toBe(27);
    expect(mainMethod[0].location.startCol).toBe(0);
    expect(mainMethod[0].location.endCol).toBe(40);
    expect(mainMethod[14].op.code).toBe("FNCALL");
    expect(mainMethod[14].location.startLine).toBe(41);
    expect(mainMethod[14].location.startCol).toBe(0);
    expect(mainMethod[14].location.endCol).toBe(26);

    // Check loop jump addresses in method
    const mainOpener = mainMethod[12].op as LoopOpenOp;
    const mainCloser = mainMethod[13].op as LoopCloseOp;
    expect(mainOpener.closer).toBe(13);
    expect(mainCloser.opener).toBe(12);

    // ====== AUXILIARY RECIPE =========
    expect(Object.keys(program.auxes)).toEqual(["chocolate sauce"]);
    const auxIngredients = program.auxes["chocolate sauce"].ingredients;

    // Check the list of ingredients
    expect(Object.keys(auxIngredients).length).toBe(5);
    expect(auxIngredients["sugar"]).toEqual({ type: "dry", value: 111 });
    expect(auxIngredients["heated double cream"]).toEqual({
      type: "liquid",
      value: 108,
    });

    // Check the method instructions
    const auxMethod = program.auxes["chocolate sauce"].method;
    expect(auxMethod.length).toBe(13);
    expect(auxMethod[0].op.code).toBe("CLEAR");
    expect(auxMethod[0].location.startLine).toBe(53);
    expect(auxMethod[0].location.startCol).toBe(0);
    expect(auxMethod[0].location.endCol).toBe(21);
    expect(auxMethod[12].op.code).toBe("END");
    expect(auxMethod[12].location.startLine).toBe(65);
    expect(auxMethod[12].location.startCol).toBe(0);
    expect(auxMethod[12].location.endCol).toBe(22);

    // Check loop jump addresses in method
    const auxOpener = auxMethod[4].op as LoopOpenOp;
    const auxCloser = auxMethod[5].op as LoopCloseOp;
    expect(auxOpener.closer).toBe(5);
    expect(auxCloser.opener).toBe(4);
  });
});
