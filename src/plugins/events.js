import { getRandomHerb, herbQualities } from './herbs'
import { pillRecipes } from './pills'

// Ngẫu nhiên sự kiện phối trí
export const events = [
  {
    id: 'ancient_tablet',
    name: 'Cổ lão bia đá',
    description: 'Phát hiện một khối có khắc thượng cổ công pháp bia đá。',
    chance: 0.08,
    effect: (playerStore, showMessage) => {
      const bonus = Math.floor(30 * (playerStore.level / 5 + 1))
      playerStore.cultivation += bonus
      showMessage('success', `[Cổ lão bia đá]Lĩnh ngộ trên tấm bia đá công pháp, thu hoạch được${bonus}Điểm tu vi`)
    }
  },
  {
    id: 'spirit_spring',
    name: 'Linh tuyền',
    description: 'Ngẫu nhiên gặp một chỗ thiên nhiên linh tuyền。',
    chance: 0.12,
    effect: (playerStore, showMessage) => {
      const bonus = Math.floor(60 * (playerStore.level / 3 + 1))
      playerStore.spirit += bonus
      showMessage('success', `[Linh tuyền]Uống linh tuyền, linh lực gia tăng${bonus}Điểm`)
    }
  },
  {
    id: 'ancient_master',
    name: 'Cổ tu di phủ',
    description: 'Ngoài ý muốn phát hiện một vị thượng cổ đại năng động phủ。',
    chance: 0.03,
    effect: (playerStore, showMessage) => {
      const cultivationBonus = Math.floor(120 * (playerStore.level / 2 + 1))
      const spiritBonus = Math.floor(180 * (playerStore.level / 2 + 1))
      playerStore.cultivation += cultivationBonus
      playerStore.spirit += spiritBonus
      showMessage('success', `[Cổ tu di phủ]Thu hoạch được thượng cổ đại năng truyền thừa, tu vi gia tăng${cultivationBonus}Điểm, linh lực gia tăng${spiritBonus}Điểm`)
    }
  },
  {
    id: 'monster_attack',
    name: 'Yêu thú tập kích',
    description: 'Tao ngộ một con thực lực cường đại yêu thú。',
    chance: 0.15,
    effect: (playerStore, showMessage) => {
      const damage = Math.floor(80 * (playerStore.level / 4 + 1))
      playerStore.spirit = Math.max(0, playerStore.spirit - damage)
      showMessage('error', `[Yêu thú tập kích]Cùng yêu thú kịch chiến, tổn thất${damage}Điểm linh lực`)
    }
  },
  {
    id: 'cultivation_deviation',
    name: 'Tẩu hỏa nhập ma',
    description: 'Tu luyện ra hiện sai lầm, tẩu hỏa nhập ma。',
    chance: 0.12,
    effect: (playerStore, showMessage) => {
      const damage = Math.floor(50 * (playerStore.level / 3 + 1))
      playerStore.cultivation = Math.max(0, playerStore.cultivation - damage)
      showMessage('error', `[Tẩu hỏa nhập ma]Tẩu hỏa nhập ma, tổn thất${damage}Điểm tu vi`)
    }
  },
  {
    id: 'treasure_trove',
    name: 'Bí cảnh bảo tàng',
    description: 'Phát hiện một chỗ Thượng Cổ tu sĩ còn sót lại bảo tàng。',
    chance: 0.05,
    effect: (playerStore, showMessage) => {
      const stoneBonus = Math.floor(30 * (playerStore.level / 2 + 1))
      playerStore.spiritStones += stoneBonus
      showMessage('success', `[Bí cảnh bảo tàng]Phát hiện bảo tàng, thu hoạch được${stoneBonus}Khỏa linh thạch`)
    }
  },
  {
    id: 'enlightenment',
    name: 'Đốn ngộ',
    description: 'Trong tu luyện đột nhiên đốn ngộ。',
    chance: 0.08,
    effect: (playerStore, showMessage) => {
      const bonus = Math.floor(50 * (playerStore.level / 4 + 1))
      playerStore.cultivation += bonus
      playerStore.spiritRate *= 1.05
      showMessage('success', `[Đốn ngộ]Đột nhiên đốn ngộ, thu hoạch được${bonus}Điểm tu vi, linh lực thu hoạch tốc độ tăng lên 5%`)
    }
  },
  {
    id: 'qi_deviation',
    name: 'Tâm ma quấy nhiễu',
    description: 'Gặp tâm ma quấy nhiễu, tu vi bị hao tổn。',
    chance: 0.15,
    effect: (playerStore, showMessage) => {
      const damage = Math.floor(60 * (playerStore.level / 3 + 1))
      playerStore.spirit = Math.max(0, playerStore.spirit - damage)
      playerStore.cultivation = Math.max(0, playerStore.cultivation - damage)
      showMessage('error', `[Tâm ma quấy nhiễu]Gặp tâm ma quấy nhiễu, tổn thất${damage}Điểm linh lực cùng tu vi`)
    }
  }
]

// Ban thưởng xử lý hàm số
export const handleReward = (reward, playerStore, showMessage) => {
  switch (reward.type) {
    case 'spirit_stone':
      playerStore.spiritStones += reward.amount
      showMessage('success', `[Linh thạch thu hoạch]Thu hoạch được${reward.amount}Khỏa linh thạch`)
      break
    case 'herb':
      // Thu hoạch chỉ định số lượng ngẫu nhiên linh thảo
      for (let i = 0; i < reward.amount; i++) {
        const herb = getRandomHerb()
        if (herb) {
          playerStore.herbs.push(herb)
          showMessage('success', `[Linh thảo thu hoạch]Thu hoạch được${herbQualities[herb.quality].name}Phẩm chất${herb.name}`)
        }
      }
      break
    case 'cultivation':
      playerStore.cultivate(reward.amount)
      showMessage('success', `[Tu vi thu hoạch]Thu hoạch được${reward.amount}Điểm tu vi`)
      // Kiểm tra phải chăng có thể đột phá
      if (playerStore.cultivation >= playerStore.maxCultivation) {
        if (playerStore.tryBreakthrough()) {
          showMessage('success', `[Đột phá]Đột phá thành công！Trước mắt ban thưởng：${playerStore.realm}`)
        }
      }
      break
    case 'pill_fragment':
      // Ngẫu nhiên thu hoạch được đan phương tàn trang
      for (let i = 0; i < reward.amount; i++) {
        const randomRecipe = pillRecipes[Math.floor(Math.random() * pillRecipes.length)]
        if (randomRecipe) {
          playerStore.gainPillFragment(randomRecipe.id)
          showMessage('success', `[Đan phương thu hoạch]Thu hoạch được${randomRecipe.name}Đan phương tàn trang`)
        }
      }
      break
  }
}

// Ngẫu nhiên thu hoạch ban thưởng
export const getRandomReward = (rewards) => {
  const rand = Math.random()
  let cumulative = 0
  for (const reward of rewards) {
    cumulative += reward.chance
    if (rand <= cumulative) {
      const amount = Math.floor(
        Math.random() * (reward.amount[1] - reward.amount[0] + 1)
      ) + reward.amount[0]

      return { type: reward.type, amount }
    }
  }
  return null
}

// Phát động ngẫu nhiên sự kiện
export const triggerRandomEvent = (playerStore, message) => {
  for (const event of events) {
    if (Math.random() <= event.chance) {
      message('info', `[${event.name}]${event.description}`)
      event.effect(playerStore, message)
      playerStore.eventTriggered++  // Gia tăng sự kiện phát động số lần thống kê
      playerStore.saveData()
      return true
    }
  }
  return false
}
