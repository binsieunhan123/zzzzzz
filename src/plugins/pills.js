// Đan dược phẩm giai
export const pillGrades = {
  grade1: { name: 'Nhất phẩm', difficulty: 1, successRate: 0.9 },
  grade2: { name: 'Nhị phẩm', difficulty: 1.2, successRate: 0.8 },
  grade3: { name: 'Tam phẩm', difficulty: 1.5, successRate: 0.7 },
  grade4: { name: 'Tứ phẩm', difficulty: 2, successRate: 0.6 },
  grade5: { name: 'Ngũ phẩm', difficulty: 2.5, successRate: 0.5 },
  grade6: { name: 'Lục phẩm', difficulty: 3, successRate: 0.4 },
  grade7: { name: 'Thất phẩm', difficulty: 4, successRate: 0.3 },
  grade8: { name: 'Bát phẩm', difficulty: 5, successRate: 0.2 },
  grade9: { name: 'Cửu phẩm', difficulty: 6, successRate: 0.1 }
}

// Đan dược loại hình
export const pillTypes = {
  spirit: { name: 'Linh lực loại', effectMultiplier: 1 },
  cultivation: { name: 'Tu luyện loại', effectMultiplier: 1.2 },
  attribute: { name: 'Thuộc tính loại', effectMultiplier: 1.5 },
  special: { name: 'Đặc thù loại', effectMultiplier: 2 }
}

// Căn cứ phẩm giai tính toán cần thiết tàn số trang lượng
const getFragmentsNeeded = (grade) => {
  const gradeNumber = parseInt(grade.replace('grade', ''))
  return 5 * gradeNumber + 5  // Nhất phẩm 10 Cái, Nhị phẩm 15 Cái, cứ thế mà suy ra
}

// Đan phương phối trí
export const pillRecipes = [
  {
    id: 'spirit_gathering',
    name: 'Tụ linh đan',
    description: 'Tăng lên linh lực tốc độ khôi phục đan dược',
    grade: 'grade1',
    type: 'spirit',
    materials: [
      { herb: 'spirit_grass', count: 2 },
      { herb: 'cloud_flower', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade1'),
    baseEffect: {
      type: 'spiritRate',
      value: 0.2,
      duration: 3600
    }
  },
  {
    id: 'cultivation_boost',
    name: 'Tụ Khí Đan',
    description: 'Tăng lên tốc độ tu luyện đan dược',
    grade: 'grade2',
    type: 'cultivation',
    materials: [
      { herb: 'cloud_flower', count: 2 },
      { herb: 'thunder_root', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade2'),
    baseEffect: {
      type: 'cultivationRate',
      value: 0.3,
      duration: 1800
    }
  },
  {
    id: 'thunder_power',
    name: 'Lôi Linh đan',
    description: 'Tăng lên chiến đấu thuộc tính đan dược',
    grade: 'grade3',
    type: 'attribute',
    materials: [
      { herb: 'thunder_root', count: 2 },
      { herb: 'dragon_breath_herb', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade3'),
    baseEffect: {
      type: 'combatBoost',
      value: 0.4,
      duration: 900
    }
  },
  {
    id: 'immortal_essence',
    name: 'Tiên linh đan',
    description: 'Toàn thuộc tính tăng lên thần kỳ đan dược',
    grade: 'grade4',
    type: 'special',
    materials: [
      { herb: 'dragon_breath_herb', count: 2 },
      { herb: 'immortal_jade_grass', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade4'),
    baseEffect: {
      type: 'allAttributes',
      value: 0.5,
      duration: 600
    }
  },
  {
    id: 'five_elements_pill',
    name: 'Ngũ Hành đan',
    description: 'Dung hợp Ngũ Hành chi lực thần kỳ đan dược, toàn diện tăng lên người tu luyện tố chất',
    grade: 'grade5',
    type: 'attribute',
    materials: [
      { herb: 'five_elements_grass', count: 2 },
      { herb: 'phoenix_feather_herb', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade5'),
    baseEffect: {
      type: 'allAttributes',
      value: 0.8,
      duration: 1200
    }
  },
  {
    id: 'celestial_essence_pill',
    name: 'Thiên Nguyên Đan',
    description: 'Ngưng tụ thiên địa tinh hoa cực phẩm đan dược, tăng lên trên diện rộng tốc độ tu luyện',
    grade: 'grade6',
    type: 'cultivation',
    materials: [
      { herb: 'celestial_dew_grass', count: 2 },
      { herb: 'moonlight_orchid', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade6'),
    baseEffect: {
      type: 'cultivationRate',
      value: 1.0,
      duration: 1800
    }
  },
  {
    id: 'sun_moon_pill',
    name: 'Nhật nguyệt đan',
    description: 'Dung hợp nhật nguyệt tinh hoa đan dược, có thể tăng lên trên diện rộng linh lực hạn mức cao nhất',
    grade: 'grade7',
    type: 'spirit',
    materials: [
      { herb: 'sun_essence_flower', count: 2 },
      { herb: 'moonlight_orchid', count: 2 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade7'),
    baseEffect: {
      type: 'spiritCap',
      value: 1.5,
      duration: 2400
    }
  },
  {
    id: 'phoenix_rebirth_pill',
    name: 'Niết Bàn đan',
    description: 'Ẩn chứa bất tử phượng hoàng chi lực thần đan, có thể trong chiến đấu tự động khôi phục sinh mệnh',
    grade: 'grade8',
    type: 'special',
    materials: [
      { herb: 'phoenix_feather_herb', count: 3 },
      { herb: 'celestial_dew_grass', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade8'),
    baseEffect: {
      type: 'autoHeal',
      value: 0.1,
      duration: 3600
    }
  },
  {
    id: 'spirit_recovery',
    name: 'Hồi linh đan',
    description: 'Khôi phục nhanh chóng linh lực đan dược',
    grade: 'grade2',
    type: 'spirit',
    materials: [
      { herb: 'dark_yin_grass', count: 2 },
      { herb: 'frost_lotus', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade2'),
    baseEffect: {
      type: 'spiritRecovery',
      value: 0.4,
      duration: 1200
    }
  },
  {
    id: 'essence_condensation',
    name: 'Ngưng Nguyên đan',
    description: 'Tăng lên tu luyện hiệu suất cao cấp đan dược',
    grade: 'grade3',
    type: 'cultivation',
    materials: [
      { herb: 'nine_leaf_lingzhi', count: 2 },
      { herb: 'purple_ginseng', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade3'),
    baseEffect: {
      type: 'cultivationEfficiency',
      value: 0.5,
      duration: 1500
    }
  },
  {
    id: 'mind_clarity',
    name: 'Thanh Tâm Đan',
    description: 'Tăng lên tâm cảnh cùng ngộ tính đan dược',
    grade: 'grade3',
    type: 'special',
    materials: [
      { herb: 'frost_lotus', count: 2 },
      { herb: 'fire_heart_flower', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade3'),
    baseEffect: {
      type: 'comprehension',
      value: 0.3,
      duration: 2400
    }
  },
  {
    id: 'fire_essence',
    name: 'Hỏa nguyên đan',
    description: 'Tăng lên Hỏa thuộc tính tốc độ tu luyện đan dược',
    grade: 'grade4',
    type: 'attribute',
    materials: [
      { herb: 'fire_heart_flower', count: 2 },
      { herb: 'dragon_breath_herb', count: 1 }
    ],
    fragmentsNeeded: getFragmentsNeeded('grade4'),
    baseEffect: {
      type: 'fireAttribute',
      value: 0.6,
      duration: 1800
    }
  }
]

// Tính toán đan dược hiệu quả thực tế（Căn cứ vào người chơi cảnh giới）
export const calculatePillEffect = (recipe, playerLevel) => {
  const grade = pillGrades[recipe.grade]
  const type = pillTypes[recipe.type]
  // Cơ sở hiệu quả theo cảnh giới tăng lên
  const levelMultiplier = 1 + (playerLevel - 1) * 0.1
  return {
    type: recipe.baseEffect.type,
    value: recipe.baseEffect.value * type.effectMultiplier * levelMultiplier,
    duration: recipe.baseEffect.duration,
    successRate: grade.successRate
  }
}

// Nếm thử hợp thành đan dược
export const tryCreatePill = (recipe, herbs, player, fragments = 0, luck = 1) => {
  // Kiểm tra vật liệu phải chăng đầy đủ
  for (const material of recipe.materials) {
    const herbCount = herbs.filter(h => h.id === material.herb).length
    if (herbCount < material.count) {
      return { success: false, message: 'Vật liệu không đủ' }
    }
  }
  // Kiểm tra đan phương phải chăng hoàn chỉnh（Chỉ có tại chưa nắm giữ hoàn chỉnh đan phương lúc mới kiểm tra tàn số trang lượng）
  if (!player.pillRecipes.includes(recipe.id) && fragments < recipe.fragmentsNeeded) {
    return { success: false, message: 'Đan phương không hoàn chỉnh' }
  }
  // Tính toán xác suất thành công（Thụ may mắn giá trị ảnh hưởng）
  const grade = pillGrades[recipe.grade]
  if (Math.random() > grade.successRate * luck) {
    return { success: false, message: 'Luyện chế thất bại' }
  }
  return { success: true, message: 'Luyện chế thành công' }
}
