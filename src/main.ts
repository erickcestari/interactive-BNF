/// <reference lib="dom"/>

import lzstring from "https://esm.sh/lz-string@1.4.4"
import { concatHoriz, drawNet } from "./diagram.ts"
import { reduce } from "./net.ts"
import { parseNet } from "./parse.ts"
import { printNet } from "./print.ts"


const initial = getInitialNet() ?? `
<syntax>         ::= <rule> | <rule> <syntax>
<rule>           ::= <opt-whitespace> "<" <rule-name> ">" <opt-whitespace> "::=" <opt-whitespace> <expression> <line-end>
<opt-whitespace> ::= " " <opt-whitespace> | ""
<expression>     ::= <list> | <list> <opt-whitespace> "|" <opt-whitespace> <expression>
<line-end>       ::= <opt-whitespace> <EOL> | <line-end> <line-end>
<list>           ::= <term> | <term> <opt-whitespace> <list>
<term>           ::= <literal> | "<" <rule-name> ">"
<literal>        ::= '"' <text1> '"' | "'" <text2> "'"
<text1>          ::= "" | <character1> <text1>
<text2>          ::= "" | <character2> <text2>
<character>      ::= <letter> | <digit> | <symbol>
<letter>         ::= "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z"
<digit>          ::= "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9"
<symbol>         ::= "|" | " " | "!" | "#" | "$" | "%" | "&" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | ":" | ";" | ">" | "=" | "<" | "?" | "@" | "[" | "\" | "]" | "^" | "_" | "\`" | "{" | "}" | "~"
<character1>     ::= <character> | "'"
<character2>     ::= <character> | '"'
<rule-name>      ::= <letter> | <rule-name> <rule-char>
<rule-char>      ::= <letter> | <digit> | "-"
`.trimStart()

const inputTextarea = document.getElementById("input") as HTMLTextAreaElement
const outputPre = document.getElementById("output")!
const parallel = document.getElementById("parallel") as HTMLInputElement
const autoSubst = document.getElementById("autoSubst") as HTMLInputElement

inputTextarea.value = initial

inputTextarea.addEventListener("change", exec)
inputTextarea.addEventListener("keyup", exec)
parallel.addEventListener("change", exec)
autoSubst.addEventListener("change", exec)

exec()

function exec() {
  try {
    let output = ""
    const net = parseNet(inputTextarea.value)
    let steps = 0
    for (; steps < 1000; steps++) {
      if (autoSubst.checked) {
        while (net[1].some((x) => x[0].type === "aux" || x[1].type === "aux")) {
          net[1] = net[1].flatMap((x) =>
            x[0].type === "aux" || x[1].type === "aux" ? reduce(x) : [x]
          )
        }
      }
      output += concatHoriz(drawNet(net), [...printNet(net), ""]).join("\n") + "\n\n"
      if (!net[1].length) break
      if (parallel.checked) {
        net[1] = net[1].flatMap(reduce)
      } else {
        net[1] = reduce(net[1][0]!).concat(net[1].slice(1))
      }
    }

    outputPre.textContent = `${steps} steps\n\n` + output

    history.replaceState({}, "", "#0" + lzstring.compressToEncodedURIComponent(inputTextarea.value))
  } catch (e) {
    outputPre.textContent = e + ""
  }
}

function getInitialNet(): string | undefined {
  if (location.hash.startsWith("#0")) {
    return lzstring.decompressFromEncodedURIComponent(location.hash.slice(2))
  }
  return
}
