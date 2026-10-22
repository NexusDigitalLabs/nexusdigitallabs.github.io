/**
 * Long-form guide copy for each game page. Every rule, number and scoring formula
 * here is taken from the game's actual code (src/components/games, src/lib/games,
 * src/lib/snake-levels.ts) — if you change a game's rules, update its guide too.
 */

import type { GuideFaq, GuideSection } from '@/components/games/GameSeoSection';

export type GameGuide = {
  title: string;
  intro: string;
  mechanics: string[];
  scoring: string[];
  strategy: string[];
  sections: GuideSection[];
  faq: GuideFaq[];
};

export type GameGuideSlug =
  | '2048'
  | 'snake'
  | 'blackjack'
  | 'sudoku'
  | 'gridlock'
  | 'sumoku'
  | 'cryptic-paths'
  | 'semantic-shift';

const SCORE_SAVING =
  'Your best score is saved in your browser under the username you pick. If you sign in, personal bests can also sync to your account.';

export const GAME_GUIDES: Record<GameGuideSlug, GameGuide> = {
  '2048': {
    title: '2048 — merge tiles to the target',
    intro:
      '2048 is a single-player sliding puzzle on a 4×4 grid. Every move slides all tiles as far as they can go in one direction, and two tiles with the same number that collide merge into one tile with their combined value. In this version, creating a 2048 tile wins the run.',
    mechanics: [
      'Move with the arrow keys or WASD, or swipe on a touch screen. A move only counts if at least one tile moves or merges. Pressing a direction that changes nothing does not spawn a new tile.',
      'After every valid move a new tile appears in a random empty cell. It is a 2 about nine times out of ten and a 4 about one time in ten.',
      'Each tile can merge only once per move, and merging starts from the edge you are sliding towards. A row of 2, 2, 2, 2 pushed left becomes 4, 4 rather than a single 8, and a row of 2, 2, 2 becomes 4, 2.',
      'The run ends in one of two ways: you create a 2048 tile, which is a win, or the grid fills up and no two neighbouring tiles match, which is game over. In both cases, press Play Again for a fresh board.',
    ],
    scoring: [
      'Every merge adds the value of the tile it creates. Merging two 8s adds 16 points; merging two 512s adds 1,024. Early merges are worth very little, so most of a finished score comes from the last few big merges.',
      SCORE_SAVING,
    ],
    strategy: [
      'Pick one corner and keep your largest tile there for the whole game. Build a descending chain of tiles along one edge so that merging always cascades towards the corner.',
      'Use three directions for almost every move. If your big tile is in the bottom-left, rely on left, down and right, and treat up as an emergency move, because pushing up can pull your large tile out of its corner.',
    ],
    sections: [
      {
        title: 'Where 2048 comes from',
        paragraphs: [
          '2048 was written by Gabriele Cirulli, a young Italian developer, and released as an open-source web game in March 2014. It borrows ideas from earlier sliding-tile puzzles such as Threes and 1024, and it spread quickly because the rules fit in one sentence and it runs in any browser with no install.',
        ],
      },
      {
        title: 'Why the corner strategy works',
        paragraphs: [
          'Merges happen along a line, so tiles that sit in the same row or column can combine in a chain. If your biggest tile is in a corner and the next biggest sit beside it in order, one swipe can merge several tiles in a row. If your biggest tile drifts into the middle, small tiles can end up trapped on both sides of it and the board fills with values that can never meet.',
          'Keeping the bottom row (or whichever edge you chose) full and ordered also gives you a safe direction to move when the board is crowded. A move along a full, ordered edge changes nothing there, so it cannot disturb your structure.',
        ],
      },
      {
        title: 'A few habits that save runs',
        items: [
          'Look at the whole board before every move instead of reacting to the newest tile.',
          'Merge small tiles early. Leaving several 2s and 4s scattered around costs you empty cells you will need later.',
          'Do not chase a merge if it forces the board to fill. An empty cell is worth more than a small score.',
          'If you are forced to break your corner rule, move the board back into shape as soon as you have space.',
        ],
      },
      {
        title: 'How high can you go?',
        paragraphs: [
          'On a 4×4 board the largest tile that can appear is 131,072 (2 to the power of 17), but no human game gets close. Reaching 2048 is a realistic goal for a patient player. Getting there reliably is mostly a matter of discipline about the corner and about not rushing.',
        ],
      },
    ],
    faq: [
      {
        q: 'Why does the game end when I reach 2048?',
        a: 'In this version a 2048 tile counts as a win and finishes the run. Press Play Again to start a new board and try to beat your score.',
      },
      {
        q: 'Is the position of new tiles random?',
        a: 'Yes. Each new tile appears in a random empty cell and is a 2 roughly 90 percent of the time and a 4 roughly 10 percent of the time. Good play means keeping the board healthy whatever appears.',
      },
      {
        q: 'Can I get stuck even if I play well?',
        a: 'Occasionally. The game ends when the grid is full and no neighbouring tiles match. Keeping a few empty cells and an ordered edge is the best protection, but a run of unlucky small tiles can still end a game.',
      },
      {
        q: 'Do I need an account to play?',
        a: 'No. You choose a username that is stored in your browser and your scores are saved locally. Signing in is optional and only adds syncing across devices.',
      },
    ],
  },

  snake: {
    title: 'Snake — grow without colliding',
    intro:
      'Snake is one of the oldest arcade ideas still worth playing: steer a growing line around a board, eat food, and avoid running into yourself. This version has no deadly walls. The edges wrap, so the only thing that can end your run is your own body.',
    mechanics: [
      'Steer with the arrow keys or WASD. On a touch screen use the on-screen D-pad or swipe on the board. The snake moves one cell at a time, and pressing the opposite direction to the one you are travelling in is ignored, so you cannot turn back into yourself.',
      'Leaving one edge of the board brings the head back in from the opposite edge, so the board behaves like a loop rather than a box.',
      'Each piece of food you eat adds one segment to the snake. The run ends when the head moves into a cell that the body already occupies.',
    ],
    scoring: [
      'You score one point for every piece of food eaten. Every 5 points moves you up a level, and each level makes the snake faster.',
      'Level 1 steps every 160 milliseconds. Each level removes 12 milliseconds from that interval until it bottoms out at 55 milliseconds, which you reach at level 10, after 45 points. After that the speed stays the same and the challenge is purely about space.',
      SCORE_SAVING,
    ],
    strategy: [
      'Early on, plan around the loop: a long snake can pass through an edge and re-enter on the other side, which makes the board feel larger than it is. Use that to take the shortest route to food even when it is on the far side.',
      'Avoid winding into a tight spiral. A spiral looks efficient until the tail is far from where you need space, and then the only open cells are inside the coil.',
    ],
    sections: [
      {
        title: 'A short history of Snake',
        paragraphs: [
          'The idea goes back to the 1970s arcade game Blockade, in which two players leave growing trails and try to force each other into a collision. Single-player Snake became a household name in 1997, when a version was installed on Nokia phones. For many people it was the first video game they ever played.',
        ],
      },
      {
        title: 'Strategies for long runs',
        items: [
          'Move in long, regular sweeps, such as left to right across a row and then back along the next, so the free space stays in one connected region.',
          'Keep your head close to your own tail once you are long. The tail moves out of the way as you advance, so following it is the safest path.',
          'When the snake covers a large part of the board, ignore food that would force you into a dead end and take the route that keeps the most open space reachable.',
          'Watch two moves ahead at high speed. At the fastest setting you have about a twentieth of a second per step, so decide the next turn before you reach it.',
        ],
      },
      {
        title: 'Why speed is not the real difficulty',
        paragraphs: [
          'At low levels the danger is simply being slow to react. Once the speed stops increasing, the difficulty is entirely about planning: the longer you are, the less room you have and the more every turn matters. A theoretical perfect game can fill the whole board by following a fixed route that visits every cell exactly once, but doing that by hand under time pressure is very hard.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do the walls kill the snake?',
        a: 'No. The edges wrap around, so you come out on the opposite side. Only hitting your own body ends the run.',
      },
      {
        q: 'How does the speed change?',
        a: 'The game starts at 160 milliseconds per step and gets 12 milliseconds faster every level (a level is 5 points), down to a limit of 55 milliseconds from level 10.',
      },
      {
        q: 'Can I play on my phone?',
        a: 'Yes. Use the D-pad buttons or swipe on the board.',
      },
      {
        q: 'Why can I not turn around instantly?',
        a: 'Turning 180 degrees would send the head straight into the neck, which would be an unfair instant loss, so that input is ignored.',
      },
    ],
  },

  blackjack: {
    title: 'Blackjack — beat the dealer to 21',
    intro:
      'This is a free Blackjack table for practice and entertainment. It follows the familiar casino rules, but the chips are simulated: nothing here involves real money, deposits, withdrawals or prizes.',
    mechanics: [
      'You start with 1,000 simulated chips. Place a bet, then you and the dealer are dealt two cards each, with one dealer card hidden. Number cards count at face value, face cards count 10, and an ace counts as 11 or 1, whichever is better for the hand.',
      'On your turn you can hit to take another card, stand to keep your total, or double down. Doubling doubles your bet, deals you exactly one more card, and then the dealer plays. Going over 21 is a bust and loses the bet.',
      'The dealer reveals the hidden card and must keep drawing until reaching 17 or more, and then stands. If either you or the dealer is dealt 21 on the first two cards, the hand is settled straight away.',
      'The game uses a single 52-card deck that is reshuffled when fewer than 15 cards remain. There is no splitting, no insurance and no surrender. If you lose all your chips, your balance resets to 1,000 on the next hand.',
    ],
    scoring: [
      'A normal win returns your bet plus the same amount again. A natural blackjack pays 3 to 2, so a bet of 100 returns 250 in total. A push, when you and the dealer tie, returns your bet. A bust or a loss forfeits it.',
      'Your highest chip total is recorded as your best score. It is a practice scoreboard only and has no monetary value.',
    ],
    strategy: [
      'Basic strategy is a fixed table of the best play for each combination of your hand and the dealer visible card. It will not guarantee a win, but it avoids the most common mistakes.',
      'The core ideas are simple. Always stand on a hard 17 or more. Always hit a hard 8 or less. With 13 to 16 against a dealer showing 2 to 6, stand and let the dealer risk the bust. With 13 to 16 against a 7 or higher, hit. Double down on 10 or 11 when the dealer shows a weaker card.',
    ],
    sections: [
      {
        title: 'Why the dealer upcard matters',
        paragraphs: [
          'The dealer must follow a fixed rule: draw below 17, stand on 17 or more. That makes the visible card a strong clue. A dealer showing a 5 or 6 is likely to end up with a weak hand or bust, so you can afford to stand on a shaky total. A dealer showing a 10 or an ace is likely to reach 17 or more, so a 15 or 16 has to improve.',
        ],
      },
      {
        title: 'Soft hands and hard hands',
        paragraphs: [
          'A soft hand contains an ace counted as 11, for example ace and 6 for a soft 17. You cannot bust by taking one more card from a soft hand, because the ace can drop to 1. That is why soft totals up to 17 are usually worth hitting, while a hard 17 is not.',
        ],
      },
      {
        title: 'A short history',
        paragraphs: [
          'Blackjack grew out of European card games of the 18th century, such as the French game vingt-et-un, meaning twenty-one. The name blackjack comes from a bonus once paid in some casinos for holding the ace of spades with a black jack.',
        ],
      },
      {
        title: 'Use it for learning, not for betting',
        paragraphs: [
          'Practising strategy here costs nothing, which makes it a safe way to learn how the hands work. Real-money gambling carries real risk, and no strategy removes the casino edge. This game is for entertainment and education only.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is this real gambling?',
        a: 'No. The chips are simulated, nothing can be deposited or withdrawn, and there are no prizes. Balances are only a score for practice.',
      },
      {
        q: 'Does the dealer hit on soft 17?',
        a: 'No. The dealer stands on every total of 17 or more, including a soft 17.',
      },
      {
        q: 'What does a blackjack pay?',
        a: 'A two-card 21 pays 3 to 2: you get your bet back plus one and a half times the bet.',
      },
      {
        q: 'Can I split pairs or take insurance?',
        a: 'Not in this version. You can hit, stand or double down.',
      },
    ],
  },

  sudoku: {
    title: 'Nexus Sudoku — logic on a 9×9 grid',
    intro:
      'Fill the grid so every row, column and 3×3 box contains the digits 1 to 9 exactly once. Every puzzle is generated in your browser and checked to have exactly one solution, so you can always solve it by logic without guessing.',
    mechanics: [
      'Select a cell, then tap a digit on the on-screen number pad. Use Erase to clear a cell you placed. Cells given at the start are fixed.',
      'The Highlight conflicts option marks digits that repeat in a row, column or box in red as you play. You can turn it off for a stricter challenge.',
      'There are four difficulty levels. Beginner starts with 48 filled cells and 12 minutes, Easy has 40 and 9 minutes, Medium has 32 and 6 minutes, and Hard has 24 and 4 minutes. If the countdown reaches zero, the attempt ends.',
      'There are no pencil marks or hints in this version, so work out candidates in your head or on paper.',
    ],
    scoring: [
      'Each level has a base score: 400 for Beginner, 700 for Easy, 1,100 for Medium and 1,800 for Hard. You lose 40 points for every mistake, meaning a digit that does not match the solution, and you gain one point for every second left on the clock.',
      SCORE_SAVING,
    ],
    strategy: [
      'Start with the easiest wins. A naked single is a cell where only one digit is still possible. A hidden single is a digit that has only one place left to go in its row, column or box. Scan for both repeatedly, because each new digit unlocks more.',
      'When singles run out, look for naked pairs: two cells in a unit that share the same two candidates, which means those two digits can be removed from every other cell in that unit. Then try pointing pairs, where a digit in a box is confined to one row or column and so is removed from the rest of that line.',
    ],
    sections: [
      {
        title: 'How the puzzles are made',
        paragraphs: [
          'The game first builds a complete valid grid with a backtracking solver. It then removes cells in random order until the target number of clues is reached, and checks that the puzzle still has exactly one solution. If it does not, it tries again. Because every puzzle is verified, you never need to guess; there is always a logical path.',
          'The mathematical minimum for a Sudoku with a single solution is 17 clues, a result proved in 2012. Most published puzzles have more, because they are easier and more pleasant to solve.',
        ],
      },
      {
        title: 'A quick history of Sudoku',
        paragraphs: [
          'The modern puzzle was designed by an American, Howard Garns, and published in 1979 in a Dell puzzle magazine under the name Number Place. It became popular in Japan, where the publisher Nikoli gave it the name Sudoku in the 1980s, and it became a worldwide craze in the mid-2000s.',
        ],
      },
      {
        title: 'Working under a time limit',
        items: [
          'On Hard you only have four minutes, so do not hunt for advanced patterns until you have exhausted every single.',
          'Fill in digits you are certain of first, because every placed digit narrows the rest.',
          'Mistakes cost 40 points each, which is more than half a minute of time bonus, so accuracy matters more than raw speed.',
          'If you are stuck, move to a different box. A fresh area often has a single you missed.',
        ],
      },
    ],
    faq: [
      {
        q: 'Is every puzzle solvable without guessing?',
        a: 'Every puzzle has exactly one solution, which the generator verifies. Some Hard puzzles may need advanced techniques such as pairs.',
      },
      {
        q: 'Are there hints or pencil marks?',
        a: 'No. This version offers digit entry, an Erase button and an optional conflict highlight.',
      },
      {
        q: 'What counts as a mistake?',
        a: 'Placing a digit that differs from the puzzle solution. Each mistake takes 40 points off your score.',
      },
      {
        q: 'What happens when the timer ends?',
        a: 'The attempt ends without a completed score. You can start again at the same level or an easier one.',
      },
    ],
  },

  gridlock: {
    title: 'Gridlock — memorize and recreate patterns',
    intro:
      'Gridlock is a short-term spatial memory game. A few tiles light up on a grid for a moment, then go dark, and you have to tap the same tiles from memory before the recall timer runs out. Harder levels use bigger grids, more tiles and shorter windows.',
    mechanics: [
      'Choose Easy, Medium or Hard. Each round shows a random set of tiles for a short window, then hides them. You then tap the cells you remember until you have found all of them.',
      'Only the positions matter, not the order you tap them in. Tapping a tile that was not in the pattern costs a life immediately. Running out of recall time also costs a life.',
      'You have three lives per run. When the third is gone, the run ends. Getting a pattern right moves you straight on to a new one.',
      'The settings for each level are: Easy is a 3×3 grid with 3 tiles, a 2 second look and 8 seconds to recall. Medium is 4×4 with 5 tiles, 1.5 seconds and 6 seconds. Hard is 5×5 with 7 tiles, 1 second and 4 seconds.',
    ],
    scoring: [
      'Every correctly recreated pattern adds a fixed number of points: 100 on Easy, 200 on Medium and 350 on Hard. There is no streak multiplier, so the score is simply the number of patterns completed times the level value.',
      SCORE_SAVING,
    ],
    strategy: [
      'Do not try to remember individual tiles. Look for shapes: a diagonal, an L, two adjacent pairs, a corner and an edge. Three groups are far easier to hold than seven points.',
      'Use the position on the grid as a code. Naming rows and columns, for example top row, middle column, can help you replay the pattern in words.',
    ],
    sections: [
      {
        title: 'What this game exercises',
        paragraphs: [
          'Gridlock relies on visuospatial working memory, the short-term store you use to hold a layout in mind for a few seconds. Classic psychology research suggested people can hold roughly seven items at once, and later work argued the figure is closer to four meaningful chunks. That is why grouping tiles into shapes helps: it turns many items into a few chunks.',
          'This is a game, not a clinical test or a training programme. It is a fun way to practise paying attention, but we make no claim that it improves memory in daily life.',
        ],
      },
      {
        title: 'Tips for each level',
        items: [
          'Easy gives you 2 seconds to see only 3 tiles, so use the time to notice relative position rather than rushing.',
          'On Medium, look for symmetry. Five tiles on a 4×4 grid often form a recognisable shape.',
          'On Hard, you only have 1 second for 7 tiles on a 5×5 grid. Start by locking in the first cluster your eye lands on and fill the rest around it.',
          'After a wrong tap, take a breath. A new pattern begins immediately, and a rushed answer costs another life.',
        ],
      },
      {
        title: 'A simple practice routine',
        paragraphs: [
          'Start on Easy until you can clear ten patterns in a row without losing a life, then move up one level. The jump from Easy to Medium adds a whole new row and column and two more tiles, so expect your first Medium runs to end early. That is normal, and the second or third attempt is usually much better as your eye learns where to look.',
          'Short sessions work best. Attention is the limiting factor in this game, and after a few minutes of play mistakes tend to come from tiredness rather than from a lack of skill. Stop when you notice yourself tapping before you have really seen the pattern.',
        ],
      },
      {
        title: 'Why lives instead of a timer for the whole run',
        paragraphs: [
          'Most of the pressure comes from the recall timer on each round, not from a global countdown. That means you can play a long run at your own pace as long as you keep getting patterns right. Three lives is enough to forgive a couple of slips but not a pattern of rushing.',
        ],
      },
    ],
    faq: [
      {
        q: 'Does the order I tap the tiles matter?',
        a: 'No. Only the set of tiles matters. You can tap them in any order.',
      },
      {
        q: 'What costs a life?',
        a: 'Tapping a tile that was not in the pattern, or letting the recall timer run out.',
      },
      {
        q: 'Is there a streak bonus?',
        a: 'No. Each completed pattern is worth the fixed amount for the level you chose.',
      },
      {
        q: 'Will this improve my memory?',
        a: 'We do not claim that. It is a game that exercises short-term spatial memory while you play.',
      },
    ],
  },

  sumoku: {
    title: 'Sumoku — hit the target sum',
    intro:
      'Sumoku is a number-path puzzle on a 4×4 board. You are given a target number, and your job is to link a chain of neighbouring tiles that add up to exactly that target. Cleared tiles disappear, the columns drop down and new numbers arrive from the top.',
    mechanics: [
      'Tap tiles one after another to build a path. Each tile you add must touch the previous one directly, above, below, left or right. Diagonals do not count. Tap a selected tile again to remove it.',
      'Press Submit match when you think the chain adds up to the target. You need at least two tiles. If the sum is wrong, the game tells you the sum you made and the target, and the selection is cleared.',
      'A correct match removes those tiles, drops the remaining tiles down their columns, and fills the gaps at the top with new random numbers. A new target is then chosen.',
      'Each run has one countdown for the whole game: Easy is 75 seconds, Medium is 45 seconds and Hard is 40 seconds. When it hits zero the run ends.',
    ],
    scoring: [
      'A match scores ten points for every unit of the target plus fifteen points for every tile in your chain. A target of 12 solved with four tiles scores 12 × 10 + 4 × 15 = 180. The same target with only two tiles scores 150.',
      'Because every tile adds fifteen points, longer chains are worth more, but a long chain takes longer to find, and the clock is shared by the whole run.',
    ],
    strategy: [
      'Scan for pairs first. Two tiles that already add to the target are the fastest points, and the new tiles that fall in may make the next target easier.',
      'Remember that small numbers are flexible. A board with several 1s, 2s and 3s can build almost any target, while a board of large numbers needs a precise combination.',
    ],
    sections: [
      {
        title: 'The three difficulty levels',
        items: [
          'Easy uses the numbers 1 to 9, with targets up to 15 and 75 seconds in total.',
          'Medium uses the numbers 1 to 15, with targets up to 30 and 45 seconds in total.',
          'Hard mixes in negative numbers from −5 to 15, has targets up to 25, and gives you 40 seconds. On Hard the target also changes every 12 seconds and clears your current selection, so you have to be ready to restart a chain.',
        ],
      },
      {
        title: 'Thinking with negative numbers',
        paragraphs: [
          'On Hard, a negative tile can be a tool rather than a problem. If your target is 10 and you have an 8 and a 7, adding a −5 gets you to 10 with three tiles. The extra tile also adds fifteen points. Look for these small correction tiles next to larger numbers.',
        ],
      },
      {
        title: 'A worked example',
        paragraphs: [
          'Imagine the target is 12 and the top row reads 5, 3, 4, 7. The chain 5, 3, 4 adds to 12 and uses three neighbouring tiles, so it scores 12 × 10 + 3 × 15 = 165 points. If the 4 also sits above a 8, you could instead take 4 and 8 for the same target with two tiles, which scores 150 and clears a different part of the board. The longer chain scores more, but the shorter one may leave a better layout for the next target.',
          'That trade-off is the whole game: a few extra points now against how quickly you can find the next match. On Easy it is worth taking the longer chain when you can see it immediately. On Hard, with the target shifting every 12 seconds, the quick match is usually better.',
        ],
      },
      {
        title: 'Planning beyond the current target',
        paragraphs: [
          'Clearing tiles changes the board in two ways: the cleared cells are refilled with random numbers, and the tiles above them drop. Matches near the bottom of a column shift the most tiles, so they reshuffle more of the board. Matches near the top disturb less, which is useful if you have spotted another match you want to keep.',
        ],
      },
    ],
    faq: [
      {
        q: 'Do the tiles have to be in a straight line?',
        a: 'No, but each new tile must touch the previous one above, below, left or right. The chain can bend.',
      },
      {
        q: 'What happens if the sum is wrong?',
        a: 'The game shows the sum you made and clears your selection. There is no penalty apart from the time you used.',
      },
      {
        q: 'How is the score calculated?',
        a: 'Ten times the target plus fifteen per tile in the chain, added up over the run.',
      },
      {
        q: 'Why did the target change on its own?',
        a: 'On Hard, the target shifts every 12 seconds. Your current selection is cleared when it does.',
      },
    ],
  },

  'cryptic-paths': {
    title: 'Cryptic Paths — Eulerian routes on a graph',
    intro:
      'Cryptic Paths is a graph-tracing puzzle. You are shown a diagram of nodes joined by edges, and you have to walk along every edge exactly once before the timer runs out. In mathematics, a route like that is called an Eulerian path.',
    mechanics: [
      'Choose a starting node, then click a connected node to walk along the edge between them. Each edge can be used only once. Use Undo to take back the last step or Reset Path to start the attempt over.',
      'You succeed when every edge has been walked. If the countdown reaches zero first, the attempt fails.',
      'There are three fixed layouts. Easy is a square with 4 nodes and 4 edges, Medium has 6 nodes and 10 edges, and Hard has 8 nodes and 12 edges. The time limits are 90, 60 and 30 seconds.',
      'Where you start matters on Medium. That layout has two nodes with three edges each, the bottom-left and bottom-right corners, and any full route has to begin at one of them and finish at the other.',
    ],
    scoring: [
      'Your score starts at a base value: 500 on Easy, 900 on Medium and 1,400 on Hard. You lose 4 points for every second you take and gain 5 points for every second that was left on the clock, with a minimum of zero.',
      SCORE_SAVING,
    ],
    strategy: [
      'On Easy and Hard, every node has an even number of edges. That has a useful consequence: once you start walking, the only place you can get stuck is back at your starting node. Every other node always offers a way out, because you used one edge to arrive and an even number leaves at least one more.',
      'So the real danger is returning to the start too early. If you close a loop and the start has no unused edges left while some edges are still untouched elsewhere, undo back to the point where you chose to close the loop and take another branch.',
      'On Medium, begin at a bottom corner. The walk will end at the other bottom corner, so you cannot close a loop there and you should not finish early anywhere else.',
    ],
    sections: [
      {
        title: 'The mathematics behind it',
        paragraphs: [
          'The puzzle comes from a famous problem solved by Leonhard Euler in 1736. The city of Königsberg had seven bridges, and the question was whether a walker could cross each exactly once. Euler showed it was impossible, and in doing so founded graph theory.',
          'His rule is that a connected graph has a walk that uses every edge exactly once only if zero or two of its nodes have an odd number of edges. If none are odd, the walk can start anywhere and ends where it began, a so-called Eulerian circuit. Easy and Hard here have only even nodes, so you can start on any node. Medium has exactly two odd nodes, the bottom corners, so its walk must start at one and end at the other.',
        ],
      },
      {
        title: 'A step-by-step approach',
        items: [
          'Count the edges at each node before you click. Nodes with more edges are junctions you will pass through several times.',
          'Prefer outer edges first and leave central connections for later, so you still have a way to link the loops you create.',
          'Walk a loop and look at what is left. If the remaining edges are all attached to nodes you have already visited, you can usually pick them up on the way back.',
          'On Hard you only have 30 seconds, so decide on a route in your head, then click quickly.',
        ],
      },
      {
        title: 'Speed or accuracy?',
        paragraphs: [
          'Every second costs 4 points, plus you lose the 5-point bonus for time left. That is nine points per second, so one wasted second matters, but a reset costs you everything you have used so far. A few seconds of planning before the first click almost always beats starting fast and undoing.',
        ],
      },
    ],
    faq: [
      {
        q: 'Where should I start?',
        a: 'On Easy and Hard you can start anywhere, because every node has an even number of edges and the route finishes where it began. On Medium you must start at one of the two bottom corners and finish at the other.',
      },
      {
        q: 'Are the puzzles different each time?',
        a: 'No. Each difficulty uses one fixed layout. The challenge is finding a good route quickly, and your best time improves with practice.',
      },
      {
        q: 'What if I get stuck?',
        a: 'Use Undo to step back or Reset Path to start again. The clock keeps running either way.',
      },
      {
        q: 'Why is this called an Eulerian path?',
        a: 'It is named after Leonhard Euler, who studied routes that cross every edge of a network exactly once.',
      },
    ],
  },

  'semantic-shift': {
    title: 'Semantic Shift — Stroop reflex challenge',
    intro:
      'Semantic Shift is built on the Stroop effect. You see a colour word written in a coloured ink, and the ink often disagrees with the word. A rule on screen tells you whether to answer with the word or with the colour, and you have only a moment to choose.',
    mechanics: [
      'Each round shows one of four words, RED, BLUE, GREEN or YELLOW, in one of those four ink colours. Most of the time (about 85 percent of rounds) the ink and the word are different, which is what makes it hard.',
      'The rule above the word tells you what to match: Match word means pick the colour named by the text, Match color means pick the colour of the ink. You choose between two buttons, and only one is correct.',
      'One mistake or one timeout ends the run, so this is a streak game rather than a lives game.',
      'The rule changes as you play. On Easy it flips every 5 rounds with 2.5 seconds per round. On Medium it flips every 2 rounds with 1.3 seconds. On Hard the rule is chosen at random every round and you have 0.7 seconds.',
    ],
    scoring: [
      'Every correct answer scores a base value: 50 on Easy, 80 on Medium and 120 on Hard. A streak multiplier then applies: ×1.5 from 2 correct in a row, ×2 from 5 and ×3 from 10.',
      'A long streak is worth far more than many short ones, because the multiplier applies to every answer once you have reached it. That makes one slip very costly.',
      SCORE_SAVING,
    ],
    strategy: [
      'Say the rule to yourself before every answer. On a Match color round, deliberately ignore what the word says and look only at the ink. On a Match word round, read the word and ignore the colour entirely.',
      'On Hard the rule can change on any round, so reread it every time instead of assuming it is the same as before.',
    ],
    sections: [
      {
        title: 'The Stroop effect',
        paragraphs: [
          'In 1935 the psychologist John Ridley Stroop published experiments showing that people name a colour more slowly when it is printed as the name of a different colour. Reading is so automatic that the word interferes with naming the ink, and the conflict slows you down by a measurable amount.',
          'The effect is still used in psychology to study attention and the ability to ignore distractions. This game turns it into a reflex challenge, but it is not a psychological test, and the score says nothing about your health or intelligence.',
        ],
      },
      {
        title: 'Getting faster',
        items: [
          'Look at the ink first when the rule is Match color. Your eyes will read the word anyway, but you can train yourself to look through it.',
          'Do not wait for a perfect decision. On the faster levels, a quick guess between two buttons is better than a timeout.',
          'Keep your eyes on the centre and use your peripheral vision for the buttons, rather than moving your gaze back and forth.',
          'After a mistake, a new run starts from zero. Take a moment to reset before you press start.',
        ],
      },
      {
        title: 'Why the multiplier changes how you play',
        paragraphs: [
          'The multiplier reaches ×3 after ten correct answers, so late answers are worth three times as much as early ones. That means the cost of a mistake grows with the length of your streak. The best approach is steady rather than frantic: a deliberate pace that you can maintain beats a burst of speed that ends in a miss.',
        ],
      },
    ],
    faq: [
      {
        q: 'What ends a run?',
        a: 'A wrong answer or a timeout, whichever comes first.',
      },
      {
        q: 'Why do the word and colour usually disagree?',
        a: 'Because that conflict is the Stroop effect. About 85 percent of rounds use a mismatch, and the rest match.',
      },
      {
        q: 'How does the streak multiplier work?',
        a: 'It is ×1.5 after 2 correct answers in a row, ×2 after 5 and ×3 after 10. It resets on a mistake.',
      },
      {
        q: 'Is this a test of my brain?',
        a: 'No. It is a reflex game inspired by a well-known psychology experiment, and it is not a medical or psychological assessment.',
      },
    ],
  },
};
