var app = new Vue({
  el: '#app',
  data: function () {
    let l = DATA.common.default_locale
    let d = {
      locale: l,
      n_tapes: 0,
      tape_length: DATA.common.default_tape_length,
      speed: DATA.common.default_speed,
      transition_table: {},
      transition_table_string: DATA.localized[l].default_transition_script,
      tape_template: {
        head_pos: undefined,
        input: DATA.common.default_input,
        content: ''
      },
      tapes: [],
      current_state: '',
      current_rule: '',
      init_state: DATA.common.default_state,
      isRunning: false,
    }
    return d
  },
  computed: {
    tapes_head_init() {
      return this.tapes.map(t => Math.floor((this.tape_length - t.input.length) / 2))
    },
    delay() {
      return Math.pow(10, this.speed)
    },
    strings() {
      return DATA.localized[this.locale]
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
      if(state == DATA.common.reject || state == DATA.common.accept) {
        this.current_rule = ''
        this.isRunning = false
        return
      }

      let inputs = this.tapes.map(t => t.content[t.head_pos])
      let result = tm_Evaluate(this.current_state, inputs, this.transition_table, this.strings)
      this.current_rule = result.rule

      setTimeout(() => this.advanceState(result.newState, result.newSyms, result.newHeads), this.delay)
    },

    run() {
      this.transition_table = tm_CompileTable(this.transition_table_string, this.strings)
      this.tapes.forEach((t, i) => {
        this.resetContents(i)
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
      t.head_pos = this.tapes_head_init[i]

      let n = t.input.length
      let input = t.input.replace(" ", "_")
      let sp = Math.floor((this.tape_length - n) / 2)
      if(sp >= 0) {
        let blanks = DATA.common.blank.repeat(sp)
        t.content = blanks + input + blanks + ((n + this.tape_length) % 2 != 0 ? DATA.common.blank : "")
      } else {
        t.content = input.slice(0, this.tape_length)
      }

      t.content = t.content.split("")

    }
  },

  created: function() {
    this.add_tape()
  }
})
