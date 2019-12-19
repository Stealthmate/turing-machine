
const BLANK = "_"
const REJECT = 'reject'
const ACCEPT = 'accept'

var app = new Vue({
  el: '#app',
  data: function () {
    let d = {
      n_tapes: 0,
      tape_length: 40,
      delay: 500,
      transition_table_string: `0
1 - 0,1,R`,
      transition_table: {},
      tape_template: {
        head_init_pos: '',
        head_pos: undefined,
        input: '11001100',
        content: ''
      },
      tapes: [],
      current_state: undefined,
      current_rule: undefined,
      init_state: 0
    }
    return d
  },
  computed: {
    tapes_head_init() {
      return this.tapes.map(t => {
        let sp = Math.floor((this.tape_length - t.input.length) / 2)
        let ip = t.head_init_pos
        if(isNaN(parseInt(ip))) t = ip.trim()
        return ip === '' ? sp : ip
      })
    }
  },

  methods: {

    advanceState(state, syms, heads) {
      this.current_state = state
      this.tapes.forEach((t, i) => {
        this.$set(t.content, t.head_pos, syms[i])
        this.$set(t, 'head_pos', t.head_pos + heads[i])
      })
      if(state == REJECT || state == ACCEPT) {
        this.current_rule = undefined
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
      this.advanceState(
        this.init_state,
        this.tapes.map((t, i) => t.content[this.tapes_head_init[i]]),
        Array(this.n_tapes).fill(0)
      )
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
      console.log(this.tapes)
      let n = t.input.length
      let sp = Math.floor((this.tape_length - n) / 2)
      if(sp >= 0) {
        let blanks = BLANK.repeat(sp)
        t.content = blanks + t.input + blanks + ((n + this.tape_length) % 2 != 0 ? BLANK : "")
      } else {
        t.content = t.input.slice(0, this.tape_length)
      }

      t.content = t.content.split("")
    }
  },

  created: function() {
    this.add_tape()
  }
})
