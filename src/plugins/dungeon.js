// Phó bản độ khó phối trí
const difficultyModifiers = {
  easy: { healthMod: 0.8, damageMod: 0.8, rewardMod: 0.8 },
  normal: { healthMod: 1.0, damageMod: 1.0, rewardMod: 1.0 },
  hard: { healthMod: 1.2, damageMod: 1.2, rewardMod: 1.5 },
  expert: { healthMod: 1.5, damageMod: 1.5, rewardMod: 2.0 }
}

// Ngẫu nhiên tuyển hạng ao
const roguelikeOptions = {
  common: [
    {
      id: 'heal', name: 'Khí huyết gia tăng', description: 'Gia tăng 10%HP', effect: (player) => {
        if (player.stats) {
          player.stats.maxHealth = (player.stats.maxHealth || 100) * 1.1
          player.stats.health = Math.min(player.stats.maxHealth, player.stats.health + player.stats.maxHealth * 0.1)
        }
      }
    },
    {
      id: 'small_buff', name: 'Nhỏ bức cường hóa', description: 'Gia tăng 10%Tổn thương', effect: (player) => {
        if (player.stats) {
          player.stats.finalDamageBoost = (player.stats.finalDamageBoost || 0) + 0.1
        }
      }
    },
    {
      id: 'defense_boost', name: 'Tường sắt', description: 'Tăng lên 20%Lực phòng ngự', effect: (player) => {
        if (player.stats) {
          player.stats.defense = (player.stats.defense || 5) * 1.2
        }
      }
    },
    {
      id: 'speed_boost', name: 'Gió táp', description: 'Tăng lên 15%Tốc độ', effect: (player) => {
        if (player.stats) {
          player.stats.speed = (player.stats.speed || 10) * 1.15
        }
      }
    },
    {
      id: 'crit_boost', name: 'Hiểu ý', description: 'Tăng lên 15%Tỉ lệ bạo kích', effect: (player) => {
        if (player.stats) {
          player.stats.critRate = (player.stats.critRate || 0.05) + 0.15
        }
      }
    },
    {
      id: 'dodge_boost', name: 'Khinh thân', description: 'Tăng lên 15%Tỉ lệ né tránh', effect: (player) => {
        if (player.stats) {
          player.stats.dodgeRate = (player.stats.dodgeRate || 0.05) + 0.15
        }
      }
    },
    {
      id: 'vampire_boost', name: 'Hút máu', description: 'Tăng lên 10%Hút máu suất', effect: (player) => {
        if (player.stats) {
          player.stats.vampireRate = (player.stats.vampireRate || 0) + 0.1
        }
      }
    },
    {
      id: 'combat_boost', name: 'Chiến ý', description: 'Tăng lên 10%Chiến đấu thuộc tính', effect: (player) => {
        if (player.stats) {
          player.stats.combatBoost = (player.stats.combatBoost || 0) + 0.1
        }
      }
    }
  ],
  rare: [
    {
      id: 'defense_master', name: 'Phòng ngự đại sư', description: 'Lực phòng ngự tăng lên 10%', effect: (player) => {
        if (player.stats) {
          player.stats.defense = (player.stats.defense || 5) * 1.1
        }
      }
    },
    {
      id: 'crit_mastery', name: 'Hiểu ý tinh thông', description: 'Tỉ lệ bạo kích tăng lên 10%，Bạo kích tổn thương tăng lên 20%', effect: (player) => {
        if (player.stats) {
          player.stats.critRate = (player.stats.critRate || 0.05) + 0.1
          player.stats.critDamageBoost = (player.stats.critDamageBoost || 0.2) + 0.2
        }
      }
    },
    {
      id: 'dodge_master', name: 'Vô ảnh', description: 'Tỉ lệ né tránh tăng lên 10%', effect: (player) => {
        if (player.stats) {
          player.stats.dodgeRate = (player.stats.dodgeRate || 0.05) + 0.1
        }
      }
    },
    {
      id: 'combo_master', name: 'Liên kích tinh thông', description: 'Liên kích suất tăng lên 10%', effect: (player) => {
        if (player.stats) {
          player.stats.comboRate = (player.stats.comboRate || 0) + 0.1
        }
      }
    },
    {
      id: 'vampire_master', name: 'Huyết ma', description: 'Hút máu suất tăng lên 5%', effect: (player) => {
        if (player.stats) {
          player.stats.vampireRate = (player.stats.vampireRate || 0) + 0.05
        }
      }
    },
    {
      id: 'stun_master', name: 'Chấn nhiếp', description: 'Mê muội suất tăng lên 5%', effect: (player) => {
        if (player.stats) {
          player.stats.stunRate = (player.stats.stunRate || 0) + 0.05
        }
      }
    }
  ],
  epic: [
    {
      id: 'ultimate_power', name: 'Cực hạn đột phá', description: 'Tất cả chiến đấu thuộc tính tăng lên 50%', effect: (player) => {
        if (player.stats) {
          player.stats.combatBoost = (player.stats.combatBoost || 0) + 0.5
          player.stats.finalDamageBoost = (player.stats.finalDamageBoost || 0) + 0.5
        }
      }
    },
    {
      id: 'divine_protection', name: 'Thiên đạo che chở', description: 'Cuối cùng giảm tổn thương tăng lên 30%', effect: (player) => {
        if (player.stats) {
          player.stats.finalDamageReduce = (player.stats.finalDamageReduce || 0) + 0.3
        }
      }
    },
    {
      id: 'combat_master', name: 'Chiến đấu đại sư', description: 'Tất cả chiến đấu thuộc tính cùng kháng tính tăng lên 25%', effect: (player) => {
        if (player.stats) {
          player.stats.combatBoost = (player.stats.combatBoost || 0) + 0.25
          player.stats.resistanceBoost = (player.stats.resistanceBoost || 0) + 0.25
        }
      }
    },
    {
      id: 'immortal_body', name: 'Bất hủ thân thể', description: 'Sinh mệnh hạn mức cao nhất tăng lên 100%，Cuối cùng giảm tổn thương tăng lên 20%', effect: (player) => {
        if (player.stats) {
          player.stats.maxHealth = (player.stats.maxHealth || 100) * 2
          player.stats.health = player.stats.maxHealth
          player.stats.finalDamageReduce = (player.stats.finalDamageReduce || 0) + 0.2
        }
      }
    },
    {
      id: 'celestial_might', name: 'Thiên nhân hợp nhất', description: 'Tất cả chiến đấu thuộc tính hạn mức cao nhất 40%，HP gia tăng 50%', effect: (player) => {
        if (player.stats) {
          player.stats.combatBoost = (player.stats.combatBoost || 0) + 0.4
          player.stats.maxHealth = (player.stats.maxHealth || 100) * 1.5
          player.stats.health = Math.min(player.stats.maxHealth, player.stats.health + player.stats.maxHealth * 0.5)
        }
      }
    },
    {
      id: 'battle_sage_supreme', name: 'Chiến thánh chí tôn', description: 'Tỉ lệ bạo kích tăng lên 40%，Bạo kích tổn thương tăng lên 80%，Cuối cùng tổn thương tăng lên 20%', effect: (player) => {
        if (player.stats) {
          player.stats.critRate = (player.stats.critRate || 0.05) + 0.4
          player.stats.critDamageBoost = (player.stats.critDamageBoost || 0.5) + 0.8
          player.stats.finalDamageBoost = (player.stats.finalDamageBoost || 0) + 0.2
        }
      }
    }
  ]
}

// Thu hoạch ngẫu nhiên tuyển hạng
const getRandomOptions = (floor) => {
  // Cơ sở xác suất thiết trí
  let commonChance = 0.7
  let rareChance = 0.25
  let epicChance = 0.05
  // Căn cứ số tầng điều chỉnh xác suất
  if (floor % 10 === 0) { // Mỗi 10 Tầng đề cao sử thi phẩm chất xác suất
    commonChance = 0.5
    rareChance = 0.3
    epicChance = 0.2 // Đề cao sử thi phẩm chất xác suất đến 20%
  } else if (floor % 5 === 0) { // Mỗi 5 Tầng đề cao hi hữu phẩm chất xác suất
    commonChance = 0.5
    rareChance = 0.35 // Đề cao hi hữu phẩm chất xác suất đến 35%
    epicChance = 0.15
  }
  const count = 3
  const selected = []
  const usedIds = new Set()
  while (selected.length < count) {
    // Vì mỗi cái tuyển hạng độc lập ngẫu nhiên quyết định phẩm chất
    const rand = Math.random()
    let pool = 'common'
    if (rand < epicChance) {
      pool = 'epic'
    } else if (rand < epicChance + rareChance) {
      pool = 'rare'
    }
    // Từ tuyển định trong ao ngẫu nhiên lựa chọn một cái tuyển hạng
    const options = roguelikeOptions[pool].filter(opt => !usedIds.has(opt.id))
    if (options.length > 0) {
      const index = Math.floor(Math.random() * options.length)
      const option = options[index]
      option.type = pool
      selected.push(option)
      usedIds.add(option.id)
    } else {
      // Nếu như trước mắt phẩm chất trong ao không có có thể dùng tuyển hạng, nếm thử cái khác phẩm chất ao
      const allOptions = [
        ...roguelikeOptions.common,
        ...roguelikeOptions.rare,
        ...roguelikeOptions.epic
      ].filter(opt => !usedIds.has(opt.id))
      if (allOptions.length > 0) {
        const index = Math.floor(Math.random() * allOptions.length)
        const option = allOptions[index]
        option.type = pool
        selected.push(option)
        usedIds.add(option.id)
      }
    }
  }
  return selected
}

export {
  difficultyModifiers,
  roguelikeOptions,
  getRandomOptions
}
