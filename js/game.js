/* ============================================
   CODEQUEST — Game Engine
   ============================================ */

const STORAGE_KEY = "codequest_save_v1";

// ---------- State ----------
let state = loadState();

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Save file corrupted, starting fresh");
    }
  }
  return {
    player: { ...GAME_DATA.player },
    completedQuests: [],
    unlockedChapters: [],
    lastPlayDate: null,
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// ---------- Title lookup ----------
function getTitleForLevel(level) {
  let result = GAME_DATA.titles[0].title;
  for (const t of GAME_DATA.titles) {
    if (level >= t.level) result = t.title;
  }
  return result;
}

// ---------- XP / Level ----------
function addXP(amount) {
  state.player.xp += amount;
  while (state.player.xp >= state.player.xpToNext) {
    state.player.xp -= state.player.xpToNext;
    state.player.level += 1;
    state.player.xpToNext = Math.round(state.player.xpToNext * 1.35);
    showLevelUpToast();
  }
  saveState();
  render();
}

function addCoins(amount) {
  state.player.coins += amount;
  saveState();
}

// ---------- Streak ----------
function checkStreak() {
  const today = new Date().toDateString();
  if (state.lastPlayDate === today) return; // already counted today

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (state.lastPlayDate === yesterday.toDateString()) {
    state.player.streak += 1;
  } else if (state.lastPlayDate !== today) {
    state.player.streak = 1;
  }
  state.lastPlayDate = today;
  saveState();
}

// ---------- Quest helpers ----------
function isQuestUnlocked(quest) {
  return state.player.level >= quest.requiresLevel;
}
function isQuestDone(quest) {
  return state.completedQuests.includes(quest.id);
}

let activeQuest = null;

function openQuest(questId) {
  const quest = GAME_DATA.quests.find(q => q.id === questId);
  if (!quest || !isQuestUnlocked(quest)) return;

  activeQuest = quest;
  document.getElementById("modal-quest-title").textContent = quest.name;
  document.getElementById("modal-quest-desc").textContent = quest.desc;
  document.getElementById("modal-answer").value = "";
  document.getElementById("modal-feedback").textContent = "";
  document.getElementById("modal-feedback").className = "modal-feedback";
  document.getElementById("quest-modal").hidden = false;
}

function closeQuestModal() {
  document.getElementById("quest-modal").hidden = true;
  activeQuest = null;
}

function submitQuestAnswer() {
  const answer = document.getElementById("modal-answer").value.trim();
  const feedbackEl = document.getElementById("modal-feedback");

  if (!answer) {
    feedbackEl.textContent = "พิมพ์คำตอบก่อนส่งนะ";
    feedbackEl.className = "modal-feedback err";
    return;
  }

  // NOTE: ตอนนี้ยังไม่มี AI ตรวจคำตอบจริง — แค่ accept ทุกคำตอบที่ไม่ว่าง
  // ขั้นต่อไป (เมื่อต่อ AI Agent) จะส่ง `answer` ไปให้ Validator Agent ตรวจตรงนี้

  if (!isQuestDone(activeQuest)) {
    state.completedQuests.push(activeQuest.id);
    addXP(activeQuest.xp);
    addCoins(activeQuest.coins);
    checkUnlockedChapters();
  }

  feedbackEl.textContent = `รับ ${activeQuest.xp} XP และ ${activeQuest.coins} Coin!`;
  feedbackEl.className = "modal-feedback ok";

  saveState();
  render();

  setTimeout(closeQuestModal, 1400);
}

// ---------- Story unlock ----------
function checkUnlockedChapters() {
  GAME_DATA.story.forEach((chapter, idx) => {
    if (state.unlockedChapters.includes(chapter.id)) return;

    const prevDone = idx === 0
      ? state.completedQuests.includes(chapter.requiresQuest)
      : state.unlockedChapters.includes(GAME_DATA.story[idx - 1].id);

    if (prevDone) {
      state.unlockedChapters.push(chapter.id);
    }
  });
}

// ---------- Level up toast ----------
function showLevelUpToast() {
  const toast = document.getElementById("levelup-toast");
  document.getElementById("toast-text").textContent =
    `Level ${state.player.level}! ${getTitleForLevel(state.player.level)}`;
  toast.hidden = false;
  setTimeout(() => { toast.hidden = true; }, 2200);
}

// ---------- Render ----------
function render() {
  const p = state.player;

  document.getElementById("stat-coins").textContent = p.coins;
  document.getElementById("stat-streak").textContent = p.streak;

  document.getElementById("player-name").textContent = p.name;
  document.getElementById("player-level").textContent = `LV ${p.level}`;
  document.getElementById("player-title").textContent = getTitleForLevel(p.level);

  document.getElementById("xp-current").textContent = p.xp;
  document.getElementById("xp-needed").textContent = p.xpToNext;
  document.getElementById("xp-bar").style.width =
    Math.min(100, Math.round((p.xp / p.xpToNext) * 100)) + "%";

  renderQuests();
  renderStory();
  renderRival();
}

function renderQuests() {
  const list = document.getElementById("quest-list");
  list.innerHTML = "";

  GAME_DATA.quests.forEach(quest => {
    const unlocked = isQuestUnlocked(quest);
    const done = isQuestDone(quest);

    const card = document.createElement("div");
    card.className = "quest-card" + (unlocked ? "" : " locked");

    let badge = "";
    if (done) badge = `<span class="quest-badge badge-reward">เสร็จแล้ว</span>`;
    else if (!unlocked) badge = `<span class="quest-badge badge-locked">LV ${quest.requiresLevel}</span>`;
    else if (quest.isBoss) badge = `<span class="quest-badge badge-boss">BOSS</span>`;
    else badge = `<span class="quest-badge badge-reward">+${quest.xp} XP</span>`;

    card.innerHTML = `
      <div class="quest-head">
        <div>
          <div class="quest-name">${quest.name}</div>
          <div class="quest-desc">${quest.desc}</div>
        </div>
        ${badge}
      </div>
      <button class="quest-start-btn" ${(!unlocked || done) ? "disabled" : ""} data-quest="${quest.id}">
        ${done ? "ทำสำเร็จแล้ว" : unlocked ? "เริ่มเควสต์" : `ปลดล็อกที่ LV ${quest.requiresLevel}`}
      </button>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll(".quest-start-btn:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", () => openQuest(btn.dataset.quest));
  });
}

function renderStory() {
  const list = document.getElementById("story-list");
  list.innerHTML = "";

  GAME_DATA.story.forEach(chapter => {
    const unlocked = state.unlockedChapters.includes(chapter.id);
    const card = document.createElement("div");
    card.className = "story-card" + (unlocked ? "" : " locked");
    card.innerHTML = `
      <div class="quest-name">${chapter.name}</div>
      <div class="quest-desc">${unlocked ? chapter.desc : "ล็อกอยู่ — ทำเควสต์ที่เกี่ยวข้องก่อน"}</div>
    `;
    list.appendChild(card);
  });
}

function renderRival() {
  const r = GAME_DATA.rival;
  const card = document.getElementById("rival-card");
  card.innerHTML = `
    <div class="rival-sprite-wrap">
      <img src="assets/sprites/icons/rival.png" alt="${r.name}">
    </div>
    <div>
      <div class="rival-name">${r.name}</div>
      <div class="rival-status">เรียนวันนี้ ${r.minutesToday} นาที — คุณ ${todayMinutes()} นาที</div>
    </div>
    <div class="rival-level">LV ${r.level}</div>
  `;
}

function todayMinutes() {
  // placeholder จนกว่าจะมีระบบ Learning Log จริง
  return 0;
}

// ---------- Init ----------
function init() {
  checkStreak();
  checkUnlockedChapters();
  render();

  document.getElementById("modal-close").addEventListener("click", closeQuestModal);
  document.getElementById("modal-submit").addEventListener("click", submitQuestAnswer);
  document.getElementById("quest-modal").addEventListener("click", (e) => {
    if (e.target.id === "quest-modal") closeQuestModal();
  });
}

document.addEventListener("DOMContentLoaded", init);
