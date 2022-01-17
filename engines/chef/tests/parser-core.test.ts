import { ChefOperation, StackItemType } from "../types";
import { JumpAddressPlaceholder } from "../parser/constants";
import { parseIngredientItem, parseMethodStep } from "../parser/core";

/** Test the result of parsing an ingredient definition string */
const testIngredientItem = (
  str: string,
  name: string,
  value: number | undefined,
  type: StackItemType
) => {
  const result = parseIngredientItem(str);
  expect(result.name).toBe(name);
  expect(result.item.value).toBe(value);
  expect(result.item.type).toBe(type);
};

/** Test the result of parsing a method operation string */
const testMethodOp = (str: string, op: ChefOperation) => {
  const result = parseMethodStep(str);
  expect(result).toEqual(op);
};

describe("Parsing ingredient definitions", () => {
  test("dry ingredients", () => {
    testIngredientItem("10 g sugar", "sugar", 10, "dry");
    testIngredientItem("2 kg dry almonds", "dry almonds", 2, "dry");
    testIngredientItem("1 pinch chilli powder", "chilli powder", 1, "dry");
    testIngredientItem("3 pinches chilli powder", "chilli powder", 3, "dry");
  });

  test("liquid ingredients", () => {
    testIngredientItem("10 ml essence", "essence", 10, "liquid");
    testIngredientItem("2 l milk", "milk", 2, "liquid");
    testIngredientItem("1 dash oil", "oil", 1, "liquid");
    testIngredientItem("3 dashes oil", "oil", 3, "liquid");
  });

  test("dry-or-liquid ingredients", () => {
    testIngredientItem("1 cup flour", "flour", 1, "unknown");
    testIngredientItem("2 cups flour", "flour", 2, "unknown");
    testIngredientItem("1 teaspoon salt", "salt", 1, "unknown");
    testIngredientItem("2 teaspoons salt", "salt", 2, "unknown");
    testIngredientItem("1 tablespoon ketchup", "ketchup", 1, "unknown");
    testIngredientItem("2 tablespoons ketchup", "ketchup", 2, "unknown");
  });
});

describe("Parsing method instructions", () => {
  test("Take `ing` from refrigerator", () => {
    testMethodOp("Take chilli powder from refrigerator", {
      code: "STDIN",
      ing: "chilli powder",
    });
  });

  test("Put `ing` into [the] [`nth`] mixing bowl", () => {
    testMethodOp("Put dry ice into the mixing bowl", {
      code: "PUSH",
      ing: "dry ice",
      bowlId: 1,
    });
    testMethodOp("Put dry ice into the 21nd mixing bowl", {
      code: "PUSH",
      ing: "dry ice",
      bowlId: 21,
    });
    testMethodOp("Put dry ice into mixing bowl", {
      code: "PUSH",
      ing: "dry ice",
      bowlId: 1,
    });
    testMethodOp("Put dry ice into 21nd mixing bowl", {
      code: "PUSH",
      ing: "dry ice",
      bowlId: 21,
    });
  });

  test("Fold `ing` into [the] [`nth`] mixing bowl", () => {
    testMethodOp("Fold dry ice into the mixing bowl", {
      code: "POP",
      ing: "dry ice",
      bowlId: 1,
    });
    testMethodOp("Fold dry ice into the 21nd mixing bowl", {
      code: "POP",
      ing: "dry ice",
      bowlId: 21,
    });
    testMethodOp("Fold dry ice into mixing bowl", {
      code: "POP",
      ing: "dry ice",
      bowlId: 1,
    });
    testMethodOp("Fold dry ice into 21nd mixing bowl", {
      code: "POP",
      ing: "dry ice",
      bowlId: 21,
    });
  });

  test("Add `ing` [to [the] [`nth`] mixing bowl]", () => {
    testMethodOp("Add black salt", {
      code: "ADD",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Add black salt to the mixing bowl", {
      code: "ADD",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Add black salt to the 100th mixing bowl", {
      code: "ADD",
      ing: "black salt",
      bowlId: 100,
    });
    testMethodOp("Add black salt to mixing bowl", {
      code: "ADD",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Add black salt to 100th mixing bowl", {
      code: "ADD",
      ing: "black salt",
      bowlId: 100,
    });
  });

  test("Remove `ing` [from [the] [`nth`] mixing bowl]", () => {
    testMethodOp("Remove black salt", {
      code: "SUBTRACT",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Remove black salt from the mixing bowl", {
      code: "SUBTRACT",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Remove black salt from the 100th mixing bowl", {
      code: "SUBTRACT",
      ing: "black salt",
      bowlId: 100,
    });
    testMethodOp("Remove black salt from mixing bowl", {
      code: "SUBTRACT",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Remove black salt from 100th mixing bowl", {
      code: "SUBTRACT",
      ing: "black salt",
      bowlId: 100,
    });
  });

  test("Combine `ing` [into [the] [`nth`] mixing bowl]", () => {
    testMethodOp("Combine black salt", {
      code: "MULTIPLY",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Combine black salt into the mixing bowl", {
      code: "MULTIPLY",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Combine black salt into the 2nd mixing bowl", {
      code: "MULTIPLY",
      ing: "black salt",
      bowlId: 2,
    });
    testMethodOp("Combine black salt into mixing bowl", {
      code: "MULTIPLY",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Combine black salt into 2nd mixing bowl", {
      code: "MULTIPLY",
      ing: "black salt",
      bowlId: 2,
    });
  });

  test("Divide `ing` [into [the] [`nth`] mixing bowl]", () => {
    testMethodOp("Divide black salt", {
      code: "DIVIDE",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Divide black salt into the mixing bowl", {
      code: "DIVIDE",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Divide black salt into the 23rd mixing bowl", {
      code: "DIVIDE",
      ing: "black salt",
      bowlId: 23,
    });
    testMethodOp("Divide black salt into mixing bowl", {
      code: "DIVIDE",
      ing: "black salt",
      bowlId: 1,
    });
    testMethodOp("Divide black salt into 23rd mixing bowl", {
      code: "DIVIDE",
      ing: "black salt",
      bowlId: 23,
    });
  });

  test("Add dry ingredients [to [the] [`nth`] mixing bowl]", () => {
    testMethodOp("Add dry ingredients", {
      code: "ADD-DRY",
      bowlId: 1,
    });
    testMethodOp("Add dry ingredients to mixing bowl", {
      code: "ADD-DRY",
      bowlId: 1,
    });
    testMethodOp("Add dry ingredients to 100th mixing bowl", {
      code: "ADD-DRY",
      bowlId: 100,
    });
    testMethodOp("Add dry ingredients to mixing bowl", {
      code: "ADD-DRY",
      bowlId: 1,
    });
    testMethodOp("Add dry ingredients to 100th mixing bowl", {
      code: "ADD-DRY",
      bowlId: 100,
    });
  });

  test("Liquefy `ingredient`", () => {
    testMethodOp("Liquefy nitrogen gas", {
      code: "LIQ-ING",
      ing: "nitrogen gas",
    });
    testMethodOp("Liquefy the nitrogen gas", {
      code: "LIQ-ING",
      ing: "nitrogen gas",
    });
    testMethodOp("Liquefy themed leaves", {
      code: "LIQ-ING",
      ing: "themed leaves",
    });
  });

  test("Liquefy [the] contents of the [`nth`] mixing bowl", () => {
    testMethodOp("Liquefy the contents of the mixing bowl", {
      code: "LIQ-BOWL",
      bowlId: 1,
    });
    testMethodOp("Liquefy the contents of the 22nd mixing bowl", {
      code: "LIQ-BOWL",
      bowlId: 22,
    });
    testMethodOp("Liquefy contents of the mixing bowl", {
      code: "LIQ-BOWL",
      bowlId: 1,
    });
    testMethodOp("Liquefy contents of the 22nd mixing bowl", {
      code: "LIQ-BOWL",
      bowlId: 22,
    });
  });

  test("Stir [the [`nth`] mixing bowl] for `num` minutes", () => {
    testMethodOp("Stir for 5 minutes", {
      code: "ROLL-BOWL",
      bowlId: 1,
      num: 5,
    });
    testMethodOp("Stir the mixing bowl for 22 minutes", {
      code: "ROLL-BOWL",
      bowlId: 1,
      num: 22,
    });
    testMethodOp("Stir the 3rd mixing bowl for 0 minutes", {
      code: "ROLL-BOWL",
      bowlId: 3,
      num: 0,
    });
  });

  test("Stir `ing` into the [`nth`] mixing bowl", () => {
    testMethodOp("Stir dry ice into the mixing bowl", {
      code: "ROLL-ING",
      bowlId: 1,
      ing: "dry ice",
    });
    testMethodOp("Stir dry ice into the 2nd mixing bowl", {
      code: "ROLL-ING",
      bowlId: 2,
      ing: "dry ice",
    });
  });

  test("Mix [the [`nth`] mixing bowl] well", () => {
    testMethodOp("Mix well", { code: "RANDOM", bowlId: 1 });
    testMethodOp("Mix the mixing bowl well", { code: "RANDOM", bowlId: 1 });
    testMethodOp("Mix the 21st mixing bowl well", {
      code: "RANDOM",
      bowlId: 21,
    });
  });

  test("Clean [the] [`nth`] mixing bowl", () => {
    testMethodOp("Clean the mixing bowl", { code: "CLEAR", bowlId: 1 });
    testMethodOp("Clean the 21st mixing bowl", { code: "CLEAR", bowlId: 21 });
    testMethodOp("Clean mixing bowl", { code: "CLEAR", bowlId: 1 });
    testMethodOp("Clean 21st mixing bowl", { code: "CLEAR", bowlId: 21 });
  });

  test("Pour contents of the [`nth`] mixing bowl into the [`pth`] baking dish", () => {
    testMethodOp("Pour contents of the mixing bowl into the baking dish", {
      code: "COPY",
      bowlId: 1,
      dishId: 1,
    });
    testMethodOp(
      "Pour contents of the 2nd mixing bowl into the 100th baking dish",
      {
        code: "COPY",
        bowlId: 2,
        dishId: 100,
      }
    );
    testMethodOp(
      "Pour contents of the mixing bowl into the 100th baking dish",
      {
        code: "COPY",
        bowlId: 1,
        dishId: 100,
      }
    );
    testMethodOp("Pour contents of the 2nd mixing bowl into the baking dish", {
      code: "COPY",
      bowlId: 2,
      dishId: 1,
    });
  });

  test("`Verb` the `ingredient`", () => {
    testMethodOp("Bake the dough", {
      code: "LOOP-OPEN",
      verb: "bake",
      ing: "dough",
      closer: JumpAddressPlaceholder,
    });
  });

  test("`Verb` [the `ingredient`] until `verbed`", () => {
    testMethodOp("Destroy until bake", {
      code: "LOOP-CLOSE",
      verb: "bake",
      opener: JumpAddressPlaceholder,
    });
    testMethodOp("Destroy the tomato ketchup until bake", {
      code: "LOOP-CLOSE",
      verb: "bake",
      ing: "tomato ketchup",
      opener: JumpAddressPlaceholder,
    });
  });

  test("Set aside", () => {
    testMethodOp("Set aside", {
      code: "LOOP-BREAK",
      closer: JumpAddressPlaceholder,
    });
  });

  test("Serve with `auxiliary-recipe`", () => {
    testMethodOp("Serve with chocolate sauce", {
      code: "FNCALL",
      recipe: "chocolate sauce",
    });
  });

  test("Refrigerate [for `num` hours]", () => {
    testMethodOp("Refrigerate", { code: "END" });
    testMethodOp("Refrigerate for 2 hours", { code: "END", num: 2 });
  });
});
