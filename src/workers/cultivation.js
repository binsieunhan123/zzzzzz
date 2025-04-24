// Tính chi phí tu luyện ở cảnh giới hiện tại
const getCurrentCultivationCost = (level) => {
  const baseCultivationCost = 10
  return Math.floor(baseCultivationCost * Math.pow(1.5, level - 1))
}

// Tính lượng tu vi đạt được ở cảnh giới hiện tại
const getCurrentCultivationGain = (level) => {
  const baseCultivationGain = 1
  return Math.floor(baseCultivationGain * Math.pow(1.2, level - 1))
}

// Tính lượng tu vi thực tế đạt được
const calculateCultivationGain = (level, luck) => {
  const extraCultivationChance = 0.3
  let gain = getCurrentCultivationGain(level)
  if (Math.random() < extraCultivationChance * luck) {
    gain *= 2
  }
  return gain
}

self.onmessage = ({ data }) => {
  const { type, playerData } = data
  if (type === 'cultivateUntilBreakthrough') {
    try {
      const { level, spirit, cultivation, maxCultivation, luck } = playerData
      const currentCost = getCurrentCultivationCost(level)
      const gain = getCurrentCultivationGain(level)
      if (gain <= 0) {
        self.postMessage({ type: 'error', message: 'Hiệu suất tu luyện bất thường' })
        return
      }
      const remainingCultivation = Math.max(0, maxCultivation - cultivation)
      const times = Math.ceil(remainingCultivation / gain)
      const totalCost = times * currentCost
      if (spirit < totalCost) {
        self.postMessage({ 
          type: 'error', 
          message: `Linh lực không đủ! Đột phá cần ${totalCost} linh lực, linh lực hiện tại: ${spirit.toFixed(1)}` 
        })
        return
      }
      let totalGain = 0
      let doubleGainTimes = 0
      for (let i = 0; i < times; i++) {
        const currentGain = calculateCultivationGain(level, luck)
        if (currentGain > gain) doubleGainTimes++
        totalGain += currentGain
      }
      self.postMessage({
        type: 'success',
        result: {
          spiritCost: totalCost,
          cultivationGain: totalGain,
          doubleGainTimes
        }
      })
    } catch (error) {
      self.postMessage({ type: 'error', message: 'Lỗi khi tính toán tu luyện' })
    }
  }
}