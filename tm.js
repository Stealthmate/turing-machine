const MOVE = {L: -1, R: 1, S: 0}

function tm_CompileTable(t, strings) {
  let tt = {}

  try {
    let parsingState = undefined
    t.split("\n").forEach(line => {
      // skip comments and empty lines
      if(line.startsWith("#") || line == '') return;

      let els = line.split(" - ")
      if(els.length == 1) parsingState = line
      else {
        let from = els[0]
        let to = els[1]

        if(tt[parsingState] === undefined) {
          tt[parsingState] = {}
        }

        tt[parsingState][from.split(",")] = to.split(",")
      }
    })
  } catch (ex) {
    console.log(ex)
    alert("遷移規則の構文が間違っています")
  }

  return tt
}

function tm_FindRule(state, inputs, table, strings) {
  let N = inputs.length;
  if(table[state] === undefined) { return undefined; }
  let next = table[state][inputs];
  if(next !== undefined) {
    return inputs.join(",") + " - " + next.join(",");
  }
  return "reject";
}

function tm_Evaluate(state, inputs, table, strings) {
  let N = inputs.length
  if(table[state] === undefined) { return undefined }
  let next = table[state][inputs]
  let newState = DATA.common.reject
  let newSymbols = inputs
  let newHeads = Array(N).fill(0)
  let rule = strings.auto_reject_rule
  if (next !== undefined) {
    rule = inputs.join(",") + " - " + next.join(",")
    newState = next[0]
    newHeads = next.slice(1 + N, next.length).map((n, i) => MOVE[n])
    newSymbols = next.slice(1, 1 + N + 1)
  }

  return {
    newState: newState,
    newHeads: newHeads,
    newSymbols: newSymbols,
    rule: rule
  }
}
