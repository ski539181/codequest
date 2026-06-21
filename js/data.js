/* ============================================
   CODEQUEST — Game Data
   แก้ไขไฟล์นี้เพื่อเพิ่ม/แก้ Quest, Chapter, Rival
   ไม่ต้องแตะ game.js เลย
   ============================================ */

const GAME_DATA = {

  // ---------- ผู้เล่นเริ่มต้น ----------
  player: {
    name: "CODEMANCER",
    level: 1,
    xp: 0,
    xpToNext: 100,
    coins: 0,
    streak: 0,
  },

  // ---------- รายชื่อระดับ ----------
  titles: [
    { level: 1,  title: "Novice" },
    { level: 5,  title: "Apprentice" },
    { level: 10, title: "Coder" },
    { level: 20, title: "Developer" },
    { level: 35, title: "Engineer" },
    { level: 50, title: "Architect" },
  ],

  // ---------- เควสต์ ----------
  // type: "study" (ส่งคำตอบอิสระ, AI ตรวจทีหลัง) หรือ "code" (เขียนโค้ด)
  // requiresLevel: เลเวลขั้นต่ำที่จะปลดล็อก
  quests: [
    {
      id: "q1",
      name: "First Spell",
      desc: "เขียนโปรแกรม print('Hello, World!') แล้วอธิบายว่ามันทำอะไร",
      type: "code",
      xp: 20,
      coins: 10,
      requiresLevel: 1,
      isBoss: false,
    },
    {
      id: "q2",
      name: "Variable Vault",
      desc: "สร้างตัวแปร 3 ตัว เก็บชื่อ อายุ และเมืองของคุณ แล้วพิมพ์ออกมา",
      type: "code",
      xp: 25,
      coins: 12,
      requiresLevel: 1,
      isBoss: false,
    },
    {
      id: "q3",
      name: "O(n²) Beast",
      desc: "Boss Fight! อธิบายว่า Binary Search ทำงานยังไง และทำไมเร็วกว่า Linear Search",
      type: "study",
      xp: 60,
      coins: 30,
      requiresLevel: 3,
      isBoss: true,
    },
    {
      id: "q4",
      name: "Loop Labyrinth",
      desc: "เขียนลูปที่พิมพ์เลข 1-10 โดยข้ามเลขคู่",
      type: "code",
      xp: 30,
      coins: 15,
      requiresLevel: 2,
      isBoss: false,
    },
  ],

  // ---------- เนื้อเรื่อง / Chapter ----------
  story: [
    {
      id: "ch1",
      name: "Forgotten Village",
      desc: "หมู่บ้านที่ถูกครอบงำด้วยเวทมนตร์ O(n²) — ปลดล็อกเมื่อจบเควสต์ O(n²) Beast",
      requiresQuest: "q3",
    },
    {
      id: "ch2",
      name: "Algorithm Forest",
      desc: "ป่าลึกลับที่เต็มไปด้วยต้นไม้ Recursion",
      requiresQuest: "ch1", // จะถูกปลดล็อกหลังบทก่อนหน้า (เดี๋ยวเชื่อมใน game.js)
    },
  ],

  // ---------- คู่แข่ง AI ----------
  rival: {
    name: "NOVA",
    level: 9,
    minutesToday: 60,
  },
};
