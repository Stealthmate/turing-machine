var DATA = {
  common: {
    default_locale: 'en',
    default_input: '00011',
    default_state: 'some_state',
    default_speed: 2,
    default_n_tapes: 1,
    default_tape_length: 40,
    blank: '_',
    reject: 'reject',
    accept: 'accept',
  },
  localized: {
    jp: {
      label: {
        speed: '実行スピード',
        speed_slow: '遅い',
        speed_fast: '速い',
        tape: 'テープ%i%',
        input: '入力',
        add_tape: 'テープを追加',
        remove_tape: 'テープを削除',
        tape_length: 'テープ長',
        init_state: '初期状態',
        step: '一回実行',
        run: '実行',
        stop: '中止',
        reset: 'リセット',
        current_state: '現状態',
        next_rule: '規則',
        total_steps: '合計ステップ数',
        state_transition_history: '状態遷移履歴'
      },
      err: {
        undefined_state: "状態が定義されていません：",
      },
      auto_reject_rule: '定義が無い',
      default_transition_script:`# これはコメントです
# コメントと空行は無視されます
# 次のプログラムは、1が一つ以下含まれるものを受理します

# 状態some_stateに対し遷移を定義します
some_state

1 - some_other_state,1,R
# 状態some_stateでもし0が出てきたら、
# 状態some_other_stateに遷移し、
# 1と書いて右に動きます
0 - some_state,0,R
_ - accept,_,R

some_other_state
0 - some_other_state,0,R
1 - reject,1,S
_ - accept,_,S

# チートシート
# 1. _は空白を表す
# 2. ヘッドはそのまま動かない(S)か、
#    右に動く(R)か、左(L)に動くことができます
# 3. 機械は状態がrejectかaccept
#    になった時だけ停止します
# 4. 遷移先が無ければ自動的にrejectに遷移します
# 5. 2つ以上のテープの場合は
#    こう書きます：
#    a,b - foo,c,d,R,L
#    つまり
#    テープ1にaが出てきて
#    テープ2にbが出てきたら
#    状態fooに遷移し
#    テープ1にcと書いて
#    テープ2にdと書いて
#    テープ1で右に動いて
#    テープ2で左に動きます
`
    },
    en: {
      label: {
        speed: 'Run speed',
        speed_slow: 'Slow',
        speed_fast: 'Fast',
        tape: 'Tape %i%',
        input: 'Input',
        add_tape: 'Add Tape',
        remove_tape: 'Remove Tape',
        tape_length: 'Tape Length',
        init_state: 'Initial State',
        step: 'Step',
        run: 'Run',
        stop: 'Stop',
        reset: 'Reset',
        state: 'State: %i%',
        rule:  'Rule : %i%',
        current_state: 'Current State',
        next_rule: 'Next Rule',
        total_steps: 'Total Steps',
        state_transition_history: 'State Transition History'
      },
      err: {
        undefined_state: "Undefined state: ",
      },
      auto_reject_rule: 'Not defined',
      default_transition_script:`# This is a comment
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
# 3. The machine stops only
#     if the state is 'reject' or 'accept'
# 4. If a transition is not defined
#    it automatically goes to 'reject'
# 5. For 2 or more tapes,
#    write like this:
#    a,b - foo,c,d,R,L
#    i.e. if you encounter
#    'a' on tape 1 and
#    'b' on tape 2,
#    switch to state 'foo',
#    write 'c' on tape 1 and
#          'd' on tape 2 then
#    move Right on tape 1 and
#         Left  on tape 2
`
    }
  }
}
