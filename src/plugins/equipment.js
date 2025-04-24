// Trang bị cường hóa cùng tẩy luyện tương quan phối trí

// Cường hóa đẳng cấp phối trí
const enhanceConfig = {
  maxLevel: 100,  // Lớn nhất cường hóa đẳng cấp
  baseSuccessRate: 1,  // Cơ sở xác suất thành công
  costPerLevel: 10,  // Mỗi cấp tiêu hao cường hóa thạch số lượng
  statIncrease: 0.1,  // Mỗi cấp thuộc tính tăng lên tỉ lệ（10%）
}

// Tẩy luyện cường hóa
const reforgeConfig = {
  costPerAttempt: 10,  // Mỗi lần tẩy luyện tiêu hao tẩy luyện thạch số lượng
  minVariation: -0.3,  // Nhỏ nhất thuộc tính biến hóa（-30%）
  maxVariation: 0.3,   // Lớn nhất thuộc tính biến hóa（+30%）
  newStatChance: 0.3,  // Thay đổi thuộc tính xác suất（30%）
}

// Nhưng tẩy luyện thuộc tính ao
const reforgeableStats = {
  weapon: ['attack', 'critRate', 'critDamageBoost'],
  head: ['defense', 'health', 'stunResist'],
  body: ['defense', 'health', 'finalDamageReduce'],
  legs: ['defense', 'speed', 'dodgeRate'],
  feet: ['defense', 'speed', 'dodgeRate'],
  shoulder: ['defense', 'health', 'counterRate'],
  hands: ['attack', 'critRate', 'comboRate'],
  wrist: ['defense', 'counterRate', 'vampireRate'],
  necklace: ['health', 'healBoost', 'spiritRate'],
  ring1: ['attack', 'critDamageBoost', 'finalDamageBoost'],
  ring2: ['defense', 'critDamageReduce', 'resistanceBoost'],
  belt: ['health', 'defense', 'combatBoost'],
  artifact: ['attack', 'critRate', 'comboRate'],
}

// Cường hóa trang bị
function enhanceEquipment (equipment, playerReinforceStones) {
  if (!equipment || !equipment.stats) {
    return { success: false, message: 'Vô hiệu trang bị' }
  }
  const currentLevel = equipment.enhanceLevel || 0
  if (currentLevel >= enhanceConfig.maxLevel) {
    return { success: false, message: 'Trang bị đã đạt tới lớn nhất cường hóa đẳng cấp' }
  }
  const cost = enhanceConfig.costPerLevel * (currentLevel + 1)
  if (playerReinforceStones < cost) {
    return { success: false, message: 'Cường hóa thạch không đủ' }
  }
  // Tính toán xác suất thành công
  const successRate = enhanceConfig.baseSuccessRate - (currentLevel * 0.05)
  const isSuccess = Math.random() < successRate
  if (!isSuccess) {
    return {
      success: false,
      message: 'Cường hóa thất bại',
      cost,
      oldStats: { ...equipment.stats },
      newStats: { ...equipment.stats }
    }
  }
  // Bảo tồn thuộc hạ cũ tính dùng cho so sánh
  const oldStats = { ...equipment.stats }
  // Tăng lên trang bị thuộc tính
  Object.keys(equipment.stats).forEach(stat => {
    if (typeof equipment.stats[stat] === 'number') {
      equipment.stats[stat] *= (1 + enhanceConfig.statIncrease)
      // Đối tỉ lệ phần trăm thuộc tính tiến hành đặc thù xử lý
      if (['critRate', 'critDamageBoost', 'dodgeRate', 'vampireRate',
        'finalDamageBoost', 'finalDamageReduce'].includes(stat)) {
        equipment.stats[stat] = Math.round(equipment.stats[stat] * 100) / 100
      } else {
        equipment.stats[stat] = Math.round(equipment.stats[stat])
      }
    }
  })
  // Đổi mới cường hóa đẳng cấp
  equipment.enhanceLevel = (equipment.enhanceLevel || 0) + 1
  return {
    success: true,
    message: 'Cường hóa thành công',
    cost,
    oldStats,
    newStats: equipment.stats,
    newLevel: equipment.enhanceLevel
  }
}

function reforgeEquipment (equipment, playerSpiritStones, confirmNewStats = true) {
  if (!equipment || !equipment.stats || !equipment.type) {
    return { success: false, message: 'Vô hiệu trang bị' }
  }
  if (playerSpiritStones < reforgeConfig.costPerAttempt) {
    return { success: false, message: 'Tẩy luyện thạch không đủ' }
  }
  const oldStats = { ...equipment.stats }
  const availableStats = reforgeableStats[equipment.type]
  const tempStats = { ...equipment.stats }
  const originStats = Object.keys(tempStats)
  // Tạo ra phải xử lý thuộc tính hướng dẫn tra cứu（1-3 Cái ngẫu nhiên）
  const modifyIndexes = [...new Set(
    Array.from({ length: Math.floor(Math.random() * 3) + 1 },
      () => Math.floor(Math.random() * originStats.length))
  )].slice(0, 3) // Bảo đảm nhiều nhất xử lý 3 Cái thuộc tính
  modifyIndexes.forEach(index => {
    const originStat = originStats[index]
    let currentStat = originStat
    const baseValue = tempStats[originStat]
    // Step 1: Nếm thử thay thế thuộc tính
    if (Math.random() < reforgeConfig.newStatChance) {
      // Loại bỏ có thể dùng thuộc tính（Không bao hàm hiện hữu thuộc tính）
      const availableNew = availableStats.filter(s =>
        !originStats.includes(s) && s !== originStat
      )
      if (availableNew.length > 0) {
        const newStat = availableNew[Math.floor(Math.random() * availableNew.length)]
        // Thay thế thuộc tính tên nhưng giữ lại trước mắt trị số（Sẽ tại trình tự 2 Bên trong điều chỉnh）
        delete tempStats[originStat]
        currentStat = newStat
      }
    }
    // Step 2：Cưỡng chế trị số điều chỉnh（Căn cứ vào nguyên thủy giá trị±30%）
    const delta = (Math.random() * 0.6 - 0.3) // [-0.3, 0.3]
    const newValue = baseValue * (1 + delta)
    // Căn cứ thuộc tính loại hình xử lý trị số độ chính xác
    if (['critRate', 'critDamageBoost', 'dodgeRate', 'vampireRate',
      'finalDamageBoost', 'finalDamageReduce'].includes(currentStat)) {
      tempStats[currentStat] = Math.min(Math.max(
        Number(newValue.toFixed(2)),
        baseValue * 0.7
      ), baseValue * 1.3)
    } else {
      tempStats[currentStat] = Math.min(Math.max(
        Math.round(newValue),
        Math.round(baseValue * 0.7)
      ), Math.round(baseValue * 1.3))
    }
  })
  // Cưỡng chế thuộc tính số lượng kiểm tra
  if (Object.keys(tempStats).length !== originStats.length) {
    console.error('Thuộc tính số lượng dị thường', { old: originStats, new: tempStats })
    return {
      success: false,
      message: 'Tẩy luyện quá trình xuất hiện dị thường',
      cost: 0,
      oldStats,
      newStats: oldStats
    }
  }
  if (confirmNewStats) {
    equipment.stats = { ...tempStats }
  }
  return {
    success: true,
    message: confirmNewStats ? 'Tẩy luyện thành công' : 'Giữ lại vốn có thuộc tính',
    cost: reforgeConfig.costPerAttempt,
    oldStats,
    newStats: tempStats,
    confirmed: confirmNewStats
  }
}

export {
  enhanceConfig,
  reforgeConfig,
  reforgeableStats,
  enhanceEquipment,
  reforgeEquipment
}
