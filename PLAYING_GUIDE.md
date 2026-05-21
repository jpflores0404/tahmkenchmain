# How to Play: State of Affairs

**State of Affairs** is a turn-based political ethics strategy card game. As a public official, you compete against an AI opponent to build public infrastructure and accumulate Development Points (DP). However, you must carefully balance your Budget, manage Public Trust, and decide whether short-term gains are worth the severe ethical risks of corruption.

---

## 1. Core Resources & HUD

Keep a close eye on your resources displayed in the HUD:

*   **Development Points (DP):** Your primary victory condition. The first player to reach the targeted DP (e.g., **4 DP**) wins.
*   **Public Trust (Max 5):** Your political life support. If your Public Trust reaches **0**, you are immediately impeached and lose the game. If the AI's trust reaches **0**, you win.
*   **Budget:** The currency used to build and upgrade infrastructure. Each turn, you gain a baseline income of **+3 Budget**.
*   **Corruption Status:** You are either **Clean** or **Corrupted**. There are no partial levels of corruption—it is a binary status with severe consequences.
*   **Agenda Slots (3 Slots):** The active construction zones where you place, build, and upgrade infrastructure projects.

> **Note:** The opponent's Budget, Hand, and Corruption Status are hidden from you unless revealed by support cards like an **Investigation**. You can, however, always see their active Agenda Slots and their **Development Points (DP)**.

---

## 2. Turn Flow

Each turn consists of two distinct phases:

### Phase 1: Start Turn
At the start of your turn:
1.  **Draw Cards:**
    *   **Turn 1:** Both you and the AI draw **6 cards** (consisting of 2 Infrastructure cards, 2 normal Support cards, 1 Auto Clean, and 1 Investigation).
    *   **Subsequent Turns:** The active player draws **1 card** from their deck.
2.  **Collect Income:** Gain **+3 Budget**.
3.  **Corruption Penalty:** If you are **Corrupted**, you lose **-1 Public Trust** and **-1 Budget** immediately.
4.  **Reset Turn Feedback:** Turn-specific notifications and card limits reset.

### Phase 2: Play Phase
During this phase, you are free to perform the following actions in any order:
*   **Play Support Cards:** Drag them from your hand to activate their effects.
*   **Deploy Infrastructure:** Drag an Infrastructure card from your hand onto any empty Agenda Slot to trigger the **Procurement Dilemma**.
*   **Upgrade Infrastructure:** Click a built infrastructure project on your agenda board to upgrade it for **8 Budget** (+1 DP).
*   **Complete Projects:** Click a fully upgraded infrastructure project on your board to complete and clear the slot, freeing up room for future projects.
*   **End Turn:** Click the End Turn button to hand play over to the AI.

---

## 3. The Procurement Dilemma

When building an Infrastructure card, you must choose one of three build methods:

| Build Method | Budget Cost | Immediate Reward | Consequence |
| :--- | :--- | :--- | :--- |
| **Honest Build** | **3 Budget** *(minus discounts)* | **+1 DP** | Safe. Eligible for passive support card bonuses. |
| **Cut Corners** | **1 Budget** | **+1 DP** | **Become Corrupted.** |
| **Bayanihan** | **0 Budget** | **+1 DP after 3 turns** | Community-led build. Takes 3 turns to finish. |

---

## 4. The Corruption System

Choosing to **Cut Corners** saves budget but marks you as **Corrupted**. 

### The Cost of Corruption
Every turn you start while Corrupted, you suffer:
*   **-1 Budget**
*   **-1 Public Trust** (which will eventually lead to impeachment if not cleared)

### The Corruption Wheel (Risk of Build Failure)
If you attempt to build *any* new infrastructure while already Corrupted, a **70% Fail / 30% Success Wheel** will spin before the build resolves:
*   🔴 **70% Chance - BUILD FAILS:** The infrastructure project is destroyed. Your paid Budget and the card are consumed, and you gain **0 DP**.
*   🟢 **30% Chance - BUILD SUCCEEDS:** The build resolves successfully according to your selected method (e.g., Honest Build completes, or Cut Corners succeeds and keeps you Corrupted).

---

## 5. Card Pool & Deck Weights

Cards are drawn from a weighted deck distribution (starting with a 30-card deck):

*   **30%** Infrastructure Cards
*   **30%** Regular Support Cards
*   **20%** AUTO CLEAN
*   **20%** Investigation

*Note: Once a limited card's cap is reached, its weight is distributed among the remaining categories.*

### Infrastructure Card Pool
*   🏥 **Public Hospital**
*   🏫 **Public School**
*   ⚡ **Power Grid**
*   💧 **Water Facility**
*   🚇 **Transit System**

### Support Card Pool
*   🌱 **Grassroots Initiative** (Qty: 2) | Cost: **Free**
    *   *Effect:* Your next Honest Build costs **-1 Budget**.
*   💼 **Human Capital Investment** (Qty: 2) | Cost: **2 Budget**
    *   *Passive Effect:* Honest Public Hospital and Public School builds provide **+1 additional DP** (applies retroactively to existing built projects).
*   ☀️ **Green Subsidy** (Qty: 3) | Cost: **2 Budget**
    *   *Passive Effect:* Honest Power Grid, Water Facility, and Transit System builds provide **+1 additional DP** (applies retroactively to existing built projects).
*   📈 **Economic Boom** (Qty: 4) | Cost: **Free**
    *   *Effect:* Instantly gain **+2 Budget**.

### Special Support Cards
*   ⚖️ **Investigation** (Max 2 per side per game) | Cost: **Free**
    *   *Effect:* Scans the opponent's corruption status.
    *   *AI Use:* Has a **35% chance** to use Investigation against a Corrupted player. If it finds corruption, you lose **-2 Public Trust**.
    *   *If Corrupted:* Opponent loses **-2 Public Trust**, and you gain **+3 Budget**.
    *   *If Clean:* Nothing happens.
*   🧼 **AUTO CLEAN** (Max 1 per side per game) | Cost: **Free**
    *   *Effect:* Removes your Corrupted status, returning you to Clean.
    *   *Constraint:* Can only be played if you have been Corrupted for **at least 2 turns**.

---

## 6. Upgrading & Clearing Slots

Because you only have **3 Agenda Slots**, you must actively manage space:

1.  **Upgrade:** Any completed/built project can be upgraded once by clicking it and paying **8 Budget**. This grants **+1 DP**.
2.  **Clear (Complete Project):** Once upgraded, click the project again to complete it. This clears it from the board, freeing up the Agenda Slot for a new project.

---

## 8. Win & Loss Conditions

The game ends immediately when any of the following occur:

### 🏆 How to Win
1.  **Development Leader:** Reach the target DP threshold (usually **4 DP**) before the AI does.
2.  **Impeachment of Opponent:** Drive the AI's Public Trust to **0** (via successful Investigations).
3.  **Term Limit Victory:** If the deck runs out of cards, you win if your DP is greater than or equal to the AI's DP.

### 💀 How to Lose
1.  **Impeached:** Your Public Trust drops to **0** (via starting turns Corrupted).
2.  **Development Defeat:** The AI reaches the target DP threshold before you.
3.  **Term Limit Defeat:** If the deck runs out of cards, you lose if the AI has more DP than you.
