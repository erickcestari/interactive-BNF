/// <reference lib="dom"/>

import lzstring from "https://esm.sh/lz-string@1.4.4"
import { concatHoriz, drawNet } from "./diagram.ts"
import { reduce } from "./net.ts"
import { parseBnf } from "./parse.ts"
import { printNet } from "./print.ts"


const initial = getInitialNet() ?? `
<postal-address> ::= <name-part> <street-address> <zip-part>
<name-part> ::= <personal-part> <last-name> <opt-suffix-part> <EOL> | <personal-part> <name-part>
<personal-part> ::= <first-name> | <initial> "."
<street-address> ::= <house-num> <street-name> <opt-apt-num> <EOL>
<zip-part> ::= <town-name> "," <state-code> <ZIP-code> <EOL>
<opt-suffix-part> ::= "Sr." | "Jr." | <roman-numeral> | ""
<opt-apt-num> ::= "Apt" <apt-num> | ""
`.trimStart()

const inputTextarea = document.getElementById("input") as HTMLTextAreaElement
const outputPre = document.getElementById("output")!

inputTextarea.value = initial

inputTextarea.addEventListener("change", exec)
inputTextarea.addEventListener("keyup", exec)

exec()

function exec() {
  try {
    let output = ""
    const bnf = parseBnf(inputTextarea.value)
    console.log(bnf)
    let steps = 0
    for (; steps < 1000; steps++) {
      output += concatHoriz(drawNet(net), [...printNet(net), ""]).join("\n") + "\n\n"
      if (!net[1].length) break
      net[1] = reduce(net[1][0]!).concat(net[1].slice(1))
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
