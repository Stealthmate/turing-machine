use std::{ops::Index, thread::current};


pub struct Tape(Vec<char>);

pub enum TuringMachineError {
    OutOfBounds,
    UndefinedTransition
}

#[derive(Clone)]
pub enum Movement {
    Left,
    Right,
    Stay
}
impl Movement {
    fn delta(& self) -> i8 {
        match self {
            Movement::Left => -1,
            Movement::Right => 1,
            Movement::Stay => 0
        }
    }
}

#[derive(Clone)]
pub struct TransitionRule {
    input_state: String,
    input_cell: char,
    output_state: String,
    output_cell: char,
    output_move: Movement
}

pub struct Simulation {
    transition_table: Vec<TransitionRule>,
    current_state: String,
    tape: Tape,
    start_position: usize,
    max_iterations: u32,
    accept_state: String,
    reject_state: String
}

impl Simulation {
    pub fn new(transition_table: Vec<TransitionRule>, initial_state: String, tape: Tape, start_position: usize, max_iterations: Option<u32>) -> Simulation {
        let _max_iterations = max_iterations.unwrap_or(10000);
        Simulation {
            transition_table,
            current_state: initial_state,
            tape,
            start_position,
            max_iterations: _max_iterations,
            accept_state: "accept".to_string(),
            reject_state: "reject".to_string()
        }
    }
    pub fn run(&mut self) -> Result<(), TuringMachineError> {
        let tape_length = self.tape.0.len();
        let mut current_position = self.start_position;
        for i in 0..self.max_iterations {
            if self.current_state == self.accept_state {
                break;
            }
            if self.current_state == self.reject_state {
                break;
            }

            let Some(input_cell) = self.tape.0.get_mut(current_position) else { return Err(TuringMachineError::OutOfBounds); };
            let current_state = self.current_state.clone();
            let Some(rule) = self.transition_table.iter().cloned().filter(|x| {
                x.input_cell == *input_cell && x.input_state == current_state
            }).next() else {
                return Err(TuringMachineError::UndefinedTransition)
            };
            *input_cell = rule.output_cell;
            self.current_state = rule.output_state.clone();
            current_position = match (current_position, &rule.output_move) {
                (0, Movement::Left) => { return Err(TuringMachineError::OutOfBounds); },
                (_, Movement::Right) if current_position == tape_length => { return Err(TuringMachineError::OutOfBounds); },
                (_, Movement::Left) => current_position - 1,
                (_, Movement::Right) => current_position + 1,
                (_, Movement::Stay) => current_position
            }
        }
        Ok(())
    }
}
