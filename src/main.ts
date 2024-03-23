/// <reference lib="dom"/>

import lzstring from "https://esm.sh/lz-string@1.4.4"
import { parseBnf } from "./parse.ts"


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
    outputPre.textContent = JSON.stringify(bnf, null, 2) ?? output

    history.replaceState({}, "", "#0" + lzstring.compressToEncodedURIComponent(inputTextarea.value))
  } catch (e) {
    console.log(e)
    outputPre.textContent = e + ""
  }
}

function getInitialNet(): string | undefined {
  if (location.hash.startsWith("#0")) {
    return lzstring.decompressFromEncodedURIComponent(location.hash.slice(2))
  }
  return
}
