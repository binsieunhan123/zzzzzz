// Tính toán xác suất kích hoạt sự kiện ngẫu nhiên
const calculateEventChance = (luck) => {
  return 0.3 * luck  // Xác suất cơ bản là 30%, bị ảnh hưởng bởi giá trị may mắn
}

// Tính toán hệ số phần thưởng
const calculateRewardMultiplier = (luck) => {
  return Math.random() < 0.5 * luck ? 1.5 : 1
}

// Xử lý một lần thám hiểm
const handleExploration = (playerData, location) => {
  const { luck } = playerData
  const eventChance = calculateEventChance(luck)
  const result = {
    type: 'exploration_result',
    eventTriggered: false,
    rewardMultiplier: 1,
    spiritCost: location.spiritCost
  }

  // Phán đoán sự kiện ngẫu nhiên
  if (Math.random() < eventChance) {
    result.eventTriggered = true
  } else {
    // Tính toán hệ số phần thưởng
    result.rewardMultiplier = calculateRewardMultiplier(luck)
  }

  return result
}

self.onmessage = ({ data }) => {
  const { type, playerData, location } = data

  if (type === 'explore') {
    try {
      const result = handleExploration(playerData, location)
      self.postMessage(result)
    } catch (error) {
      self.postMessage({
        type: 'error',
        message: error.message
      })
    }
  }
}