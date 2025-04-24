// Địa điểm phối trí
export const locations = [
  {
    id: 'newbie_village',
    name: 'Tân Thủ thôn',
    description: 'Linh khí mỏng manh phàm nhân căn cứ, thích hợp mới vào tu tiên chi đạo tu sĩ。',
    minLevel: 1,
    spiritCost: 50,
    rewards: [
      { type: 'spirit_stone', chance: 0.3, amount: [1, 3] },
      { type: 'herb', chance: 0.3, amount: [1, 2] },
      { type: 'cultivation', chance: 0.2, amount: [5, 10] },
      { type: 'pill_fragment', chance: 0.2, amount: [1, 1] }
    ]
  },
  // Trúc Cơ kỳ địa điểm
  {
    id: 'celestial_mountain',
    name: 'Thiên Khuyết phong',
    description: 'Mây mù lượn lờ tiên sơn, truyền thuyết là Viễn Cổ Tiên Nhân giảng đạo chi địa。',
    minLevel: 10,
    spiritCost: 1500,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [30, 60] },
      { type: 'herb', chance: 0.3, amount: [15, 25] },
      { type: 'cultivation', chance: 0.25, amount: [150, 300] },
      { type: 'pill_fragment', chance: 0.2, amount: [6, 10] }
    ]
  },
  // Kim Đan kỳ địa điểm
  {
    id: 'phoenix_valley',
    name: 'Phượng Hoàng cốc',
    description: 'Lâu dài bị ngọn lửa vờn quanh thần bí sơn cốc, nghe nói có Phượng Hoàng còn sót lại đạo vận。',
    minLevel: 19,
    spiritCost: 2000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [50, 100] },
      { type: 'herb', chance: 0.3, amount: [20, 35] },
      { type: 'cultivation', chance: 0.25, amount: [250, 500] },
      { type: 'pill_fragment', chance: 0.2, amount: [8, 12] }
    ]
  },
  // Nguyên Anh kỳ địa điểm
  {
    id: 'dragon_abyss',
    name: 'Long Uyên',
    description: 'Sâu không thấy đáy thần bí vực sâu, ẩn chứa viễn cổ Chân Long khí tức。',
    minLevel: 28,
    spiritCost: 3000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [80, 150] },
      { type: 'herb', chance: 0.3, amount: [30, 50] },
      { type: 'cultivation', chance: 0.25, amount: [400, 800] },
      { type: 'pill_fragment', chance: 0.2, amount: [10, 15] }
    ]
  },
  // Hóa Thần kỳ địa điểm
  {
    id: 'immortal_realm',
    name: 'Tiên giới cửa vào',
    description: 'Trong truyền thuyết thông hướng tiên giới thần bí chi địa, tràn ngập vô tận cơ duyên。',
    minLevel: 37,
    spiritCost: 5000,
    rewards: [
      { type: 'spirit_stone', chance: 0.25, amount: [150, 300] },
      { type: 'herb', chance: 0.3, amount: [50, 100] },
      { type: 'cultivation', chance: 0.25, amount: [800, 1500] },
      { type: 'pill_fragment', chance: 0.2, amount: [15, 20] }
    ]
  }
]

// Tính toán thực tế thu hoạch xác suất（Cân nhắc may mắn giá trị）
export const calculateRewardChance = (baseChance, luck = 1) => {
  return Math.min(baseChance * luck, 1) // Bảo đảm xác suất không cao hơn 100%
}
