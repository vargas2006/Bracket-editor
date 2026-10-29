# ROS Legacy Community Leaderboard & Tournament Bracket

A modern esports leaderboard and single-elimination tournament management web application built specifically for the **Rules of Survival Legacy (ROS Legacy)** gaming community.

---

## 🌟 Key Features

### 1. Leaderboard Table
- **Layout & Structure**: Clean, compact table displaying Placement, Team Name (with badge & tag), Secondary stats (Kills / Wins), Total Points, Prize, and Admin controls.
- **Top 3 Podium Highlighting**: Dedicated top-3 podium cards and highlighted gold (1st), silver (2nd), and bronze (3rd) medal accents.
- **Auto-Sorting & Instant Re-ranking**: Real-time points ranking from highest to lowest. Placement updates automatically whenever points change.
- **Tie-Breaking Rule**: Follows standard competition ranking ("1224" rule) with tie badges and secondary sorting (Kills & Wins).
- **Prize Management**: Supports optional cash prizes (e.g., `₱1,000`), in-game rewards, or custom items. Shows `—` when unassigned.
- **Search & Filter**: Real-time search across team names, tags, and individual player IGNs.

### 2. Team Members & Player IGN Display
- **Mode A: Hover to View**: Hovering over a team name on desktop (or tapping on mobile) displays an esports popover showing all member IGNs, their roles (IGL, Sniper, Fragger, etc.), and the designated Captain (crown badge).
- **Mode B: Expandable Row**: Clicking the chevron next to a team name smoothly expands the table row to reveal player cards directly within the table.
- **View Mode Switcher**: Easily switch between **Hover Mode** and **Expand Mode** with a single click in the leaderboard toolbar.

### 3. ROS Legacy Tournament Bracket
- **Single Elimination Bracket**: Supports 4, 8, or 16-team tournaments with standard round labels (*Quarter-Finals*, *Semi-Finals*, *Grand Finals*).
- **Connected Bracket Tree**: Clean connected bracket cards displaying team seeds, logos, names, scores, and winner crowns.
- **Live Scoring & Auto-Advancement**: Recording a match result automatically advances the winner to the next round slot.
- **Third-Place Match (Bronze Decider)**: Dedicated 3rd place match for the two semi-final losers.
- **Champion Confetti Celebration**: Dynamic victory animation when a tournament champion is crowned in the Grand Finals!
- **Mobile Responsive**: Horizontally scrollable tree on desktop, with quick round navigation tabs on mobile screens.

### 4. Teams & Rosters Directory
- Full squad cards with captain designations, member lists, badges, and records.
- Create, edit, and delete teams with dynamic player inputs.

### 5. Admin Controls & Security
- **Admin vs. Guest View Mode**: Ordinary community visitors can browse standings and brackets in read-only mode without accidental changes.
- **PIN Unlock**: Quick authentication modal (Default PIN: `1234`).
- **Live Battle Royale Scorer**: 1-click `+10 Chicken Dinner` and `+1 Frag` points adjustment buttons.
- **Reset Points for New Competitions**: Reset scores to 0 while keeping rosters intact.
- **Restore Demo Data**: 1-click restore to sample community data (*Zenith Entity*, *Kinos*, *Krex E X*).
- **Export Options**:
  - **CSV Export**: Standard spreadsheet download.
  - **Graphic PNG Export**: Generates a high-definition esports leaderboard card ready to post on Discord and Facebook groups.
  - **JSON Backup / Restore**: Backup full tournament state or migrate between devices.

---

## 🚀 Running the Project Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## 🛡️ Default Admin Credentials

- **Admin PIN**: `1234` (or `admin`)
- Can be customized anytime under the **Admin Hub > Tournament Configuration** tab.
