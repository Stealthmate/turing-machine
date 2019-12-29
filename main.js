
const BLANK = "_"
const REJECT = 'reject'
const ACCEPT = 'accept'

const DEFAULT_TT_STRING = `# This is a comment
# Comments and empty lines are ignored
# The following checks if there are
# more than one 1s in the input string

# define transitions for some_state
some_state

1 - some_other_state,1,R
# if at some_state we encounter 0,
# switch to some_other_state,
# write 1 and move (R)ight
0 - some_state,0,R
_ - accept,_,R

some_other_state
0 - some_other_state,0,R
1 - reject,1,S
_ - accept,_,S

# Cheat-sheet
# 1. _ stands for whitespace
# 2. The head can (S)tay or move
#    (R)ight or (L)eft
# 3. The machien stops only
#     if the state is 'reject' or 'accept'
# 4. For 2 or more tapes,
#    write like this:
#    a,b - foo,c,d,R,L
#    i.e. if you encounter
#         'a' on tape 1 and
#         'b' on tape 2,
#    switch to state 'foo',
#    write 'c' on tape 1 and
#          'd' on tape 2 then
#    move Right on tape 1 and
#         Left  on tape 2
`

const DEFAULT = {
  tt_string: DEFAULT_TT_STRING,
  state: 'some_state',
  input: '00011',
}

var app = new Vue({
  el: '#app',
  data: function () {
    let d = {
      n_tapes: 0,
      tape_length: 40,
      speed: 2,
      transition_table_string: DEFAULT.tt_string,
      transition_table: {},
      tape_template: {
        head_pos: undefined,
        input: DEFAULT.input,
        content: ''
      },
      tapes: [],
      current_state: undefined,
      current_rule: undefined,
      init_state: DEFAULT.state,
      isRunning: false
    }
    return d
  },
  computed: {
    tapes_head_init() {
      return this.tapes.map(t => Math.floor((this.tape_length - t.input.length) / 2))
    },
    delay() {
      return Math.pow(10, this.speed)
    }
  },

  methods: {

    advanceState(state, syms, heads) {
      if(!this.isRunning) { return }


      this.current_state = state
      this.tapes.forEach((t, i) => {
        this.$set(t.content, t.head_pos, syms[i])
        this.$set(t, 'head_pos', t.head_pos + heads[i])
      })
      if(state == REJECT || state == ACCEPT) {
        this.current_rule = undefined
        this.isRunning = false
        return
      }

      let inputs = this.tapes.map(t => t.content[t.head_pos])
      let result = tm_Evaluate(this.current_state, inputs, this.transition_table)
      this.current_rule = result.rule

      setTimeout(() => this.advanceState(result.newState, result.newSyms, result.newHeads), this.delay)
    },

    run() {

      this.transition_table = tm_CompileTable(this.transition_table_string)
      this.tapes.forEach((t, i) => {
        t.head_pos = this.tapes_head_init[i]
      })
      this.isRunning = true
      this.advanceState(
        this.init_state,
        this.tapes.map((t, i) => t.content[this.tapes_head_init[i]]),
        Array(this.n_tapes).fill(0)
      )
    },

    stop() {
      this.isRunning = false
    },

    add_tape() {
      this.tapes.push(JSON.parse(JSON.stringify(this.tape_template)))
      this.n_tapes += 1
      this.resetContents(this.n_tapes - 1)
    },

    remove_tape() {
      this.n_tapes -= 1
      this.$delete(this.tapes, this.n_tapes)
    },

    resetContents(i) {
      let t = this.tapes[i]
      let n = t.input.length
      let sp = Math.floor((this.tape_length - n) / 2)
      if(sp >= 0) {
        let blanks = BLANK.repeat(sp)
        t.content = blanks + t.input + blanks + ((n + this.tape_length) % 2 != 0 ? BLANK : "")
      } else {
        t.content = t.input.slice(0, this.tape_length)
      }

      t.content = t.content.split("")

      t.head_pos = this.tapes_head_init[i]
    }
  },

  created: function() {
    this.add_tape()
  }
})
