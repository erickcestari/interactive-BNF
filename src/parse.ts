interface Tokens {
  next(): string | undefined;
  peek(): string | undefined;
}

interface Tree {
  name: string;
  children?: Tree[];
}

const rToken = /\s*(<|>|::=|\||"|\||'|!|#|\$|%|&|\(|\)|\*|\+|,|-|\.|\/|:|;|>|=|<|🪨|\?|@|\[|\\|]|\^|_|`|{|}|~|[a-zA-Z0-9_.-]+|\n)\s*|(.)/g;

function lex(input: string): Tokens {
  const lexInput = input.split("\n").join("🪨");
  const iter = _lex(lexInput);
  let next = iter.next().value;
  return {
    next() {
      const val = next;
      next = iter.next().value;
      return val;
    },
    peek() {
      return next;
    },
  };
}

function* _lex(input: string) {
  for (const match of input.matchAll(rToken)) {
    if (match[2]) throw new Error(`invalid character ${match[2]}`);
    yield match[1]!;
  }
  return undefined;
}

function parseTree(tokens: Tokens): Tree {
  const token = tokens.next()
  switch (token) {
    case "🪨": {
      return parseTree(tokens);
    }
    case "|": {
      return {name: token}
    }
    case `"`: {
      const name = tokens.next()!;
      if (tokens.next() !== `"` && name !== `"`) throw new Error("expected \"");
      return { name };
    }
    case "<": {
      const name = tokens.next()!;
      if (tokens.next() !== ">") throw new Error("expected >");
      if (tokens.peek() === "::=") {
        tokens.next();
        const children: Tree[] = []
        while (tokens.peek() && tokens.peek() !== "🪨") {
          children.push(parseTree(tokens));
        }
        return { name, children };
      }
      return { name };
    }
    default: {
      throw new Error("unexpected token " + token)
    }
  }
}

export function parseBnf(input: string): Tree[] {
  const tokens = lex(input);
  const trees: Tree[] = []
  while (tokens.peek() && tokens.peek() !== "=") {
    trees.push(parseTree(tokens));
  }

  return trees
}