import { Aux, con, ctr, dup, Net, nil, Pair, Tree } from "./net.ts"

export type Tokens = {
  next(): string | undefined
  peek(): string | undefined
}

const rIdent = /^[a-zA-Z0-9_.'-]+$/
const rToken = /\s*(<|>|::=|\||"|\||'|!|#|\$|%|&|\(|\)|\*|\+|,|-|\.|\/|:|;|>|=|<|\?|@|\[|\\|]|\^|_|`|{|}|~|[a-zA-Z0-9_.-]+)\s*|(.)/g

function lex(input: string): Tokens {
  const iter = _lex(input)
  let next = iter.next().value
  return {
    next() {
      const val = next
      next = iter.next().value
      return val
    },
    peek() {
      return next
    },
  }
}

function* _lex(input: string) {
  for (const match of input.matchAll(rToken)) {
    if (match[2]) throw new Error(`invalid character ${match[2]}`)
    yield match[1]!
  }
  return undefined
}

function parseTree(tokens: Tokens): Tree {
  const token = tokens.next()
  console.log(token)
  switch (token) {
    case "<": {
      const node = con(parseTree(tokens), parseTree(tokens))
      if (tokens.next() !== ">") throw new Error("expected >")
      return node
    }
    case "[": {
      const node = dup(parseTree(tokens), parseTree(tokens))
      if (tokens.next() !== "]") throw new Error("expected ]")
      return node
    }
    case "{": {
      const tag = +tokens.next()!
      if (isNaN(tag)) throw new Error("expected tag")
      const node = ctr(tag, parseTree(tokens), parseTree(tokens))
      if (tokens.next() !== "}") throw new Error("expected }")
      return node
    }
    case "*": {
      return nil
    }
    default: {
      throw new Error("expected tree")
    }
  }
}

export function parseNet(input: string): Net {
  const tokens = lex(input)
  const trees = []
  while (tokens.peek() && tokens.peek() !== "=") {
    trees.push(parseTree(tokens))
  }
  const pairs: Pair[] = []
  if (tokens.peek() === "=") {
    if (!trees.length) parseTree(tokens)
    tokens.next()
    pairs.push([trees.pop()!, parseTree(tokens)])
  }
  while (tokens.peek()) {
    const a = parseTree(tokens)
    if (tokens.next() !== "=") throw new Error("expected =")
    const b = parseTree(tokens)
    pairs.push([a, b])
  }
  const unmatched = Object.keys(w)
  if (unmatched.length) {
    throw new Error(`unmatched ${unmatched.join(", ")}`)
  }
  return [trees, pairs]
}
