// Linh thảo phẩm chất đẳng cấp
export const herbQualities = {
  common: { name: 'Phổ thông', value: 1 },
  uncommon: { name: 'Chất lượng tốt', value: 1.5 },
  rare: { name: 'Hi hữu', value: 2 },
  epic: { name: 'Cực phẩm', value: 3 },
  legendary: { name: 'Tiên phẩm', value: 5 }
}

// Linh thảo chủng loại phối trí
export const herbs = [
  {
    id: 'spirit_grass',
    name: 'Linh tinh cỏ',
    description: 'Thường thấy nhất linh thảo, ẩn chứa chút ít linh khí',
    baseValue: 10,
    category: 'spirit',  // Linh lực loại
    chance: 0.4  // Thu hoạch xác suất
  },
  {
    id: 'cloud_flower',
    name: 'Mây mù hoa',
    description: 'Sinh trưởng tại mây mù lượn lờ chỗ linh hoa, có trợ giúp tu luyện',
    baseValue: 15,
    category: 'cultivation',  // Tu luyện loại
    chance: 0.3
  },
  {
    id: 'thunder_root',
    name: 'Sét đánh cây',
    description: 'Trải qua lôi đình rèn luyện linh căn, ẩn chứa năng lượng cường đại',
    baseValue: 25,
    category: 'attribute',  // Thuộc tính loại
    chance: 0.15
  },
  {
    id: 'dragon_breath_herb',
    name: 'Long tức cỏ',
    description: 'Hấp thu Long khí thai nghén linh thảo, cực kì trân quý',
    baseValue: 40,
    category: 'special',  // Đặc thù loại
    chance: 0.1
  },
  {
    id: 'immortal_jade_grass',
    name: 'Tiên ngọc cỏ',
    description: 'Trong truyền thuyết sinh trưởng tại tiên cảnh linh thảo, có thể ngộ nhưng không thể cầu',
    baseValue: 60,
    category: 'special',
    chance: 0.05
  },
  {
    id: 'dark_yin_grass',
    name: 'Huyền Âm cỏ',
    description: 'Sinh trưởng tại chỗ tối tăm kì lạ linh thảo, có đặc biệt linh khí thuộc tính',
    baseValue: 30,
    category: 'spirit',
    chance: 0.2
  },
  {
    id: 'nine_leaf_lingzhi',
    name: 'Cửu Diệp linh chi',
    description: 'Trong truyền thuyết linh chi, có được chín chiếc lá, ẩn chứa cường đại sinh mệnh lực',
    baseValue: 45,
    category: 'cultivation',
    chance: 0.12
  },
  {
    id: 'purple_ginseng',
    name: 'Tử kim tham gia',
    description: 'Ngàn năm tử sâm, tản ra nhàn nhạt hoàng kim, đại bổ nguyên khí',
    baseValue: 50,
    category: 'attribute',
    chance: 0.08
  },
  {
    id: 'frost_lotus',
    name: 'Sương lạnh sen',
    description: 'Sinh trưởng tại nơi cực hàn hoa sen, có thể tăng lên người tu luyện linh lực độ tinh khiết',
    baseValue: 55,
    category: 'spirit',
    chance: 0.07
  },
  {
    id: 'fire_heart_flower',
    name: 'Lửa tâm hoa',
    description: 'Sinh trưởng tại miệng núi lửa kỳ hoa, hoa tâm như ngọn lửa nhảy lên',
    baseValue: 35,
    category: 'attribute',
    chance: 0.15
  },
  {
    id: 'moonlight_orchid',
    name: 'Ánh trăng lan',
    description: 'Chỉ ở đêm trăng tròn nở rộ thần bí hoa lan, có thể hấp thu ánh trăng tinh hoa',
    baseValue: 70,
    category: 'spirit',
    chance: 0.04
  },
  {
    id: 'sun_essence_flower',
    name: 'Nhật tinh hoa',
    description: 'Hấp thu tinh hoa mặt trời kỳ hoa, ẩn chứa Thuần Dương chi lực',
    baseValue: 75,
    category: 'cultivation',
    chance: 0.03
  },
  {
    id: 'five_elements_grass',
    name: 'Ngũ Hành cỏ',
    description: 'Một cây cỏ đồng thời có Kim Mộc Thủy Hỏa Thổ năm loại thuộc tính kỳ trân',
    baseValue: 80,
    category: 'attribute',
    chance: 0.02
  },
  {
    id: 'phoenix_feather_herb',
    name: 'Phượng vũ cỏ',
    description: 'Truyền thuyết sinh trưởng tại Bất Tử hỏa Phượng Tê hơi thở thần thảo, có Niết Bàn Chi Lực',
    baseValue: 85,
    category: 'special',
    chance: 0.015
  },
  {
    id: 'celestial_dew_grass',
    name: 'Trời lộ cỏ',
    description: 'Ngưng tụ thiên địa tinh hoa tiên thảo, ngàn năm vừa gặp',
    baseValue: 90,
    category: 'special',
    chance: 0.01
  }
]

// Căn cứ phẩm chất thu hoạch linh thảo giá trị thực tế
export const getHerbValue = (herb, quality) => {
  return Math.floor(herb.baseValue * herbQualities[quality].value)
}

// Ngẫu nhiên thu hoạch linh thảo
export const getRandomHerb = () => {
  const rand = Math.random()
  let cumulative = 0
  for (const herb of herbs) {
    cumulative += herb.chance
    if (rand <= cumulative) {
      // Ngẫu nhiên quyết định phẩm chất
      const qualities = Object.keys(herbQualities)
      const qualityRand = Math.random()
      let quality
      if (qualityRand < 0.5) quality = qualities[0]  // 50% Phổ thông
      else if (qualityRand < 0.8) quality = qualities[1]  // 30% Chất lượng tốt
      else if (qualityRand < 0.95) quality = qualities[2]  // 15% Hi hữu
      else if (qualityRand < 0.99) quality = qualities[3]  // 4% Cực phẩm
      else quality = qualities[4]  // 1% Tiên phẩm
      return {
        ...herb,
        quality,
        value: getHerbValue(herb, quality)
      }
    }
  }
  return null
}
