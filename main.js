var app = new Vue({
  el: '#app',
  data: function () {
    let l = DATA.common.default_locale
    let d = {
      locale: l,
      n_tapes: 0,
      tape_length: DATA.common.default_tape_length,
      speed: DATA.common.default_speed,
      program_string: DATA.localized[l].default_transition_script,
      tape_template: {
        head_pos: undefined,
        input: DATA.common.default_input,
        content: ''
      },
      tapes: [],
      current_state:DATA.common.default_state,
      init_state: DATA.common.default_state,
      isRunning: false,
      steps: 0,
      state_history: [],
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
    },
    program() {
      return tm_CompileTable(this.program_string, this.strings);
    },
    inputs() {
      return this.tapes.map(t => t.content[t.head_pos]);
    },
    next_rule() {
      return tm_FindRule(this.current_state, this.inputs, this.program, this.strings);
    },
    finished() {
      return this.current_state === DATA.common.reject || this.state === DATA.common.accept;
    }
  },

  methods: {
    changeLocale() {
      this.program_string = DATA.localized[this.locale].default_transition_script
    },
    reset() {
      this.steps = 0;
      this.tapes.forEach((t, i)=> this.resetContents(i));
      this.current_state = this.init_state;
      this.state_history = [];
      this.isRunning = false;
    },
    raiseError(err) {
      alert(err);
      this.isRunning = false;
    },
    step() {
      if(this.current_state === DATA.common.reject || this.current_state === DATA.common.accept) {
        return;
      }

      this.state_history.push({ state: this.current_state, rule: this.next_rule });
      let result = tm_Evaluate(this.current_state, this.inputs, this.program, this.strings);
      if(result === undefined) {
        this.raiseError(DATA.localized[this.locale].err.undefined_state + this.current_state);
        return;
      }

      this.tapes.forEach((t, i) => {
        this.$set(t.content, t.head_pos, result.newSymbols[i]);
        this.$set(t, 'head_pos', t.head_pos + result.newHeads[i]);
      });

      this.current_state = result.newState;

      this.steps = this.steps + 1;
    },

    spin() {
      if(!this.isRunning) return;
      if(this.finished) {
        this.isRunning = false;
        return;
      }
      this.step();
      setTimeout(() => this.spin(), this.delay);
    },

    run() {
      this.isRunning = true;
      setTimeout(this.spin, this.delay);
    },

    stop() {
      this.isRunning = false;
    },

    add_tape() {
      this.tapes.push(JSON.parse(JSON.stringify(this.tape_template)))
      this.n_tapes += 1
      this.resetContents(this.n_tapes - 1)
    },

    remove_tape() {
      this.n_tapes = Math.max(1, this.n_tapes - 1);
      this.tapes = this.tapes.slice(0, this.n_tapes);
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
    this.add_tape();
    this.reset();
  }
})
