-- Expand game_scores.game_key for Brain suite games.

alter table public.game_scores drop constraint if exists game_scores_game_key_check;

alter table public.game_scores
  add constraint game_scores_game_key_check
  check (
    game_key in (
      '2048',
      'snake',
      'blackjack',
      'sudoku',
      'gridlock',
      'sumoku',
      'cryptic-paths',
      'semantic-shift'
    )
  );
