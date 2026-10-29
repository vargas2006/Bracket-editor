# ROS Legacy Tournament Bracket Editor & Scoring System

A modern esports tournament management web app built specifically for the **Rules of Survival Legacy (ROS Legacy)** gaming community, featuring single-elimination tournament brackets, team rosters, and a **configurable kill-based tournament scoring system**.

---

## 🌟 New Features: Configurable Tournament Scoring System

### 1. Tournament Scoring Settings (Admin Configurable)
- **Points per Kill**: Custom multiplier per elimination (Default: `5 points`).
- **Chicken Dinner Bonus**: Extra reward points for winning a match (Default: `25 points`).
- **Configurable Tournament Games**: Manage the number of games/rounds (e.g. 3, 5, 8 games).
- **Finishing Placement Points**: Enable or disable placement points for finishing positions (e.g., 2nd Place = 20 pts, 3rd Place = 15 pts, 4th Place = 10 pts, etc.).
- **Dynamic Recalculation Engine**: When scoring settings change, all existing game results and leaderboard standings are recalculated automatically without data loss.

### 2. Game Result Entry Console
- Record and edit results for each team in each game (Game 1, Game 2, Game 3...).
- Includes:
  - Team selection
  - Game / round number
  - Number of kills (non-negative integer)
  - Final placement
  - Chicken Dinner status (Yes / No)
- **Live Calculation Preview**: Displays Kill Points, Placement Points, Chicken Dinner Bonus, and Game Total in real-time *before* saving.
- **Duplicate Prevention**: Automatically updates an existing result for the same team and game number instead of creating duplicate records.
- **Delete Result**: Allows removing accidental entries with instant recalculation.

### 3. Automatic Game-by-Game Leaderboard
- Displays:
  - **Rank**: 1st (Gold), 2nd (Silver), 3rd (Bronze) badges with tied rank detection.
  - **Team**: Name, tag, badge, roster hover popover, and expandable roster row.
  - **Game Columns**: Game 1, Game 2, Game 3, ... through the configured number of games.
  - **Total Kills & Chicken Dinners (👑)**: Secondary tiebreaker metrics.
  - **Total Points**: High-contrast highlighted total score.
- **Missing Results**: Displays `0` points for games not yet played by a team without fabricating phantom records in storage.
- **View Switcher**: Toggle between the **"Game-by-Game Leaderboard"** and **"Overall Standings & Prizes"** table views.
- **Tie-Breaking Rule**: Sorts by Total Points descending $\to$ Total Kills $\to$ Chicken Dinner count.

### 4. Admin Permissions & Security
- Only authenticated admins (`isAdmin === true`) can modify scoring settings, record results, delete results, or change tournament games.
- Ordinary visitors can browse the live leaderboard, game scores, and bracket in read-only mode.
- Admin PIN lock: Default PIN is `1234` (configurable).

---

## 🚀 Running the Project

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run tests**:
   ```bash
   npm test
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Production build**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 🛡️ Default Admin Credentials

- **Admin PIN**: `1234` (or `admin`)
- Editable in **Admin Hub > Competition Info & Security PIN**.
