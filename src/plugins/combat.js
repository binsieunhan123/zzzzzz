// Trạng thái chiến đấu
const CombatState = {
  READY: 'ready',
  IN_PROGRESS: 'in_progress',
  VICTORY: 'victory',
  DEFEAT: 'defeat'
}

// Chiến đấu loại hình
const CombatType = {
  NORMAL: 'normal', // Phổ thông chiến đấu
  BOSS: 'boss', // BossChiến đấu
  ELITE: 'elite' // Tinh anh chiến đấu
}

// Cơ sở chiến đấu thuộc tính
class CombatStats {
  constructor(base = {}) {
    // Thuộc tính cơ sở
    this.health = base.health || 100
    this.maxHealth = base.maxHealth || 100
    this.damage = base.damage || 10
    this.defense = base.defense || 5
    this.speed = base.speed || 10
    // Chiến đấu thuộc tính（Tỉ lệ phần trăm）
    this.critRate = base.critRate || 0.05 // Tỉ lệ bạo kích
    this.comboRate = base.comboRate || 0 // Liên kích suất
    this.counterRate = base.counterRate || 0 // Phản kích suất
    this.stunRate = base.stunRate || 0 // Mê muội suất
    this.dodgeRate = base.dodgeRate || 0.05 // Tỉ lệ né tránh
    this.vampireRate = base.vampireRate || 0 // Hút máu suất
    // Chiến đấu kháng tính（Tỉ lệ phần trăm）
    this.critResist = base.critResist || 0 // Kháng bạo kích
    this.comboResist = base.comboResist || 0 // Kháng liên kích
    this.counterResist = base.counterResist || 0 // Kháng phản kích
    this.stunResist = base.stunResist || 0 // Kháng mê muội
    this.dodgeResist = base.dodgeResist || 0 // Kháng né tránh
    this.vampireResist = base.vampireResist || 0 // Kháng hút máu
    // Thuộc tính đặc biệt（Tỉ lệ phần trăm）
    this.healBoost = base.healBoost || 0 // Cường hóa trị liệu
    this.critDamageBoost = base.critDamageBoost || 0.5 // Cường hóa bạo tổn thương
    this.critDamageReduce = base.critDamageReduce || 0 // Yếu hóa bạo tổn thương
    this.finalDamageBoost = base.finalDamageBoost || 0 // Cuối cùng tăng tổn thương
    this.finalDamageReduce = base.finalDamageReduce || 0 // Cuối cùng giảm tổn thương
    this.combatBoost = base.combatBoost || 0 // Chiến đấu thuộc tính tăng lên
    this.resistanceBoost = base.resistanceBoost || 0 // Chiến đấu kháng tính tăng lên
  }
  // Tính toán cuối cùng tổn thương
  calculateDamage (target) {
    // Ứng dụng chiến đấu thuộc tính tăng lên
    let damage = Math.abs(this.damage * (1 + this.combatBoost))
    let isCrit = false
    let isCombo = false
    let isVampire = false
    let isStun = false
    // Tính toán bạo kích（Cân nhắc mục tiêu kháng bạo kích）
    const finalCritRate = Math.max(0, (this.critRate * (1 + this.combatBoost)) - (target ? (target.stats.critResist * (1 + target.stats.resistanceBoost)) : 0))
    if (Math.random() < finalCritRate) {
      damage *= (1.5 + this.critDamageBoost)
      isCrit = true
    }
    // Tính toán liên kích（Cân nhắc mục tiêu kháng liên kích）
    const finalComboRate = Math.max(0, (this.comboRate * (1 + this.combatBoost)) - (target ? target.stats.comboResist : 0))
    if (Math.random() < finalComboRate) {
      damage *= 1.3
      isCombo = true
    }
    // Tính toán hút máu（Cân nhắc mục tiêu kháng hút máu）
    const finalVampireRate = Math.max(0, (this.vampireRate * (1 + this.combatBoost)) - (target ? target.stats.vampireResist : 0))
    if (Math.random() < finalVampireRate) {
      isVampire = true
    }
    // Tính toán mê muội（Cân nhắc mục tiêu kháng mê muội）
    const finalStunRate = Math.max(0, (this.stunRate * (1 + this.combatBoost)) - (target ? target.stats.stunResist : 0))
    if (Math.random() < finalStunRate) {
      isStun = true
    }
    // Ứng dụng cuối cùng tổn thương tăng thêm
    damage *= (1 + this.finalDamageBoost)
    return { damage: Math.abs(damage), isCrit, isCombo, isVampire, isStun }
  }
  // Tính toán giảm tổn thương
  calculateDamageReduction (incomingDamage, attackerStats) {
    let damage = Math.abs(incomingDamage)
    // Ứng dụng phòng ngự giảm tổn thương（Cân nhắc chiến đấu thuộc tính tăng lên）
    const effectiveDefense = this.defense * (1 + this.combatBoost)
    damage *= (100 / (100 + effectiveDefense))
    // Nếu như là bạo kích tổn thương, ứng dụng bạo kích giảm tổn thương
    if (attackerStats && attackerStats.isCrit) {
      damage *= (1 - this.critDamageReduce)
    }
    // Ứng dụng cuối cùng giảm tổn thương
    damage *= (1 - this.finalDamageReduce)
    return Math.abs(damage)
  }
}

// Chiến đấu thực thể cơ loại
class CombatEntity {
  constructor(name, level, baseStats = {}, realm = 'Luyện Khí tầng một') {
    const stats = { ...baseStats }
    this.name = name
    this.level = level
    this.realm = realm
    // Bảo đảmmaxHealthCùnghealthBảo trì nhất trí
    if (stats.health && !stats.maxHealth) {
      stats.maxHealth = stats.health
    }
    this.stats = new CombatStats(stats)
    this.currentHealth = this.stats.maxHealth
    this.effects = []
  }
  // Bị thương tổn
  takeDamage (amount, source) {
    // Tính toán thực tế tỉ lệ né tránh（Cân nhắc công kích phương kháng né tránh）
    const actualDodgeRate = Math.max(0, Math.min(1, this.stats.dodgeRate - (source ? source.stats.dodgeResist : 0)))
    // Né tránh phán định
    if (Math.random() < actualDodgeRate) {
      return { dodged: true, damage: 0 }
    }
    // Tính toán thực tế tổn thương
    const reducedDamage = this.stats.calculateDamageReduction(amount)
    this.currentHealth = Math.max(0, this.currentHealth - reducedDamage)
    // Tính toán phản kích（Cân nhắc công kích phương kháng phản kích）
    let isCounter = false
    if (source) {
      const finalCounterRate = Math.max(0, this.stats.counterRate - source.stats.counterResist)
      if (Math.random() < finalCounterRate) {
        isCounter = true
      }
    }
    return {
      dodged: false,
      damage: reducedDamage,
      currentHealth: this.currentHealth,
      isDead: this.currentHealth <= 0,
      isCounter: isCounter
    }
  }
  // Khôi phục sinh mệnh giá trị
  heal (amount) {
    const oldHealth = this.currentHealth
    this.currentHealth = Math.min(this.stats.maxHealth, this.currentHealth + amount)
    return this.currentHealth - oldHealth
  }
  // Tăng thêm hiệu quả
  addEffect (effect) {
    this.effects.push(effect)
    effect.apply(this)
  }
  // Gỡ ra hiệu quả
  removeEffect (effectId) {
    const index = this.effects.findIndex(e => e.id === effectId)
    if (index >= 0) {
      const effect = this.effects[index]
      effect.remove(this)
      this.effects.splice(index, 1)
    }
  }
}
// Chiến đấu quản lý khí
class CombatManager {
  constructor(player, enemy, type = CombatType.NORMAL) {
    this.player = player
    this.enemy = enemy
    this.type = type
    this.state = CombatState.READY
    this.round = 0
    this.maxRounds = 10 // Thiết trí lớn nhất hiệp số vì 10
    this.log = []
  }
  // Bắt đầu chiến đấu
  start () {
    this.state = CombatState.IN_PROGRESS
    return this.state
  }
  // Chấp hành hiệp
  executeTurn () {
    if (this.state !== CombatState.IN_PROGRESS) return null
    this.round++
    // Kiểm tra phải chăng vượt qua lớn nhất hiệp số
    if (this.round > this.maxRounds) {
      this.state = CombatState.DEFEAT
      this.log.push(`Chiến đấu vượt qua${this.maxRounds}Hiệp, chiến đấu thất bại！`)
      return { results: [], state: this.state }
    }
    const results = []
    // Căn cứ tốc độ quyết định công kích trình tự
    const playerSpeed = this.player.stats.speed * (1 + this.player.stats.combatBoost)
    const enemySpeed = this.enemy.stats.speed * (1 + this.enemy.stats.combatBoost)
    const firstAttacker = playerSpeed >= enemySpeed ? this.player : this.enemy
    const secondAttacker = playerSpeed >= enemySpeed ? this.enemy : this.player

    // Hiệp một công kích
    const firstAttack = firstAttacker.stats.calculateDamage(secondAttacker)
    const firstResult = secondAttacker.takeDamage(firstAttack.damage, firstAttacker)

    // Ghi chép hiệp một công kích nhật ký
    let firstAttackLog = `${firstAttacker.name}Dẫn đầu phát động công kích`
    if (firstResult.dodged) {
      firstAttackLog += `，Bị né tránh！`
    } else {
      firstAttackLog += `，Tạo thành${firstResult.damage.toFixed(1)}Điểm thương tổn`
      if (firstAttack.isCrit) firstAttackLog += `（Bạo kích！）`
      if (firstAttack.isCombo) firstAttackLog += `（Liên kích！）`
      if (firstAttack.isVampire) {
        const healAmount = firstResult.damage * 0.3
        firstAttacker.heal(healAmount)
        firstAttackLog += `（Hút máu khôi phục${healAmount.toFixed(1)}Điểm HP！）`
      }
      if (firstAttack.isStun) firstAttackLog += `（Mê muội mục tiêu！）`
    }
    this.log.push(firstAttackLog)
    results.push({
      attacker: firstAttacker.name,
      defender: secondAttacker.name,
      damage: firstResult.damage,
      isCrit: firstAttack.isCrit,
      isCombo: firstAttack.isCombo,
      isDodged: firstResult.dodged
    })

    // Kiểm tra thứ hai người công kích phải chăng tử vong
    if (firstResult.isDead) {
      this.state = firstAttacker === this.player ? CombatState.VICTORY : CombatState.DEFEAT
      this.log.push(`${firstAttacker.name}Đạt được thắng lợi！`)
      return { results, state: this.state }
    }

    // Hiệp 2 công kích（Nếu như không có bị mê muội）
    if (!firstAttack.isStun) {
      const secondAttack = secondAttacker.stats.calculateDamage(firstAttacker)
      const secondResult = firstAttacker.takeDamage(secondAttack.damage, secondAttacker)

      // Ghi chép hiệp 2 công kích nhật ký
      // Nếu như là phản kích, trước tăng thêm phản kích phát động nhật ký
      if (firstResult.isCounter) {
        this.log.push(`${secondAttacker.name}Phát động phản kích hiệu quả！`)
      }
      let secondAttackLog = firstResult.isCounter ?
        `${secondAttacker.name}Phản kích` :
        `${secondAttacker.name}Tiến hành công kích`
      if (secondResult.dodged) {
        secondAttackLog += `，Bị né tránh！`
      } else {
        secondAttackLog += `，Tạo thành${secondResult.damage.toFixed(1)}Điểm thương tổn`
        if (secondAttack.isCrit) secondAttackLog += `（Bạo kích！）`
        if (secondAttack.isCombo) secondAttackLog += `（Liên kích！）`
        if (secondAttack.isVampire) {
          const healAmount = secondResult.damage * 0.3
          secondAttacker.heal(healAmount)
          secondAttackLog += `（Hút máu khôi phục${healAmount.toFixed(1)}Điểm HP！）`
        }
        if (secondAttack.isStun) secondAttackLog += `（Mê muội mục tiêu！）`
      }
      this.log.push(secondAttackLog)
      results.push({
        attacker: secondAttacker.name,
        defender: firstAttacker.name,
        damage: secondResult.damage,
        isCrit: secondAttack.isCrit,
        isCombo: secondAttack.isCombo,
        isDodged: secondResult.dodged
      })

      // Kiểm tra đệ nhất người công kích phải chăng tử vong
      if (secondResult.isDead) {
        this.state = secondAttacker === this.player ? CombatState.VICTORY : CombatState.DEFEAT
        this.log.push(`${secondAttacker.name}Đạt được thắng lợi！`)
      }
    }
    return { results, state: this.state }
  }
  // Thu hoạch chiến đấu nhật ký
  getCombatLog () {
    return this.log
  }
}

// Tạo ra địch nhân
function generateEnemy (level, type = CombatType.NORMAL, difficulty = 1) {
  const baseStats = {
    // Thuộc tính cơ sở
    health: 100 + (difficulty * level * 200),
    damage: 8 + difficulty * level * 2,
    defense: 3 + difficulty * level * 2,
    speed: 5 + difficulty * level * 2,
    // Chiến đấu thuộc tính（Tỉ lệ phần trăm）
    critRate: 0.05 + (difficulty * level * 0.02),
    comboRate: 0.03 + (difficulty * level * 0.02),
    counterRate: 0.03 + (difficulty * level * 0.02),
    stunRate: 0.02 + (difficulty * level * 0.01),
    dodgeRate: 0.05 + (difficulty * level * 0.02),
    vampireRate: 0.02 + (difficulty * level * 0.01),
    // Chiến đấu kháng tính（Tỉ lệ phần trăm）
    critResist: 0.02 + (difficulty * level * 0.01),
    comboResist: 0.02 + (difficulty * level * 0.01),
    counterResist: 0.02 + (difficulty * level * 0.01),
    stunResist: 0.02 + (difficulty * level * 0.01),
    dodgeResist: 0.02 + (difficulty * level * 0.01),
    vampireResist: 0.02 + (difficulty * level * 0.01),
    // Thuộc tính đặc biệt（Tỉ lệ phần trăm）
    healBoost: 0.05 + (difficulty * level * 0.02),
    critDamageBoost: 0.2 + (difficulty * level * 0.1),
    critDamageReduce: 0.1 + (difficulty * level * 0.05),
    finalDamageBoost: 0.05 + (difficulty * level * 0.02),
    finalDamageReduce: 0.05 + (difficulty * level * 0.02),
    combatBoost: 0.03 + (difficulty * level * 0.02),
    resistanceBoost: 0.03 + (difficulty * level * 0.02)
  }
  // Căn cứ loại hình điều chỉnh thuộc tính
  switch (type) {
    case CombatType.ELITE:
      Object.keys(baseStats).forEach(key => {
        if (typeof baseStats[key] === 'number') {
          if (key.includes('Rate') || key.includes('Resist') || key.includes('Boost') || key.includes('Reduce')) {
            baseStats[key] = Math.min(0.8, baseStats[key] * 1.3) // Tỉ lệ phần trăm thuộc tính hạn chế cao nhất tại 80%
          } else {
            baseStats[key] *= 1.5
          }
        }
      })
      break
    case CombatType.BOSS:
      Object.keys(baseStats).forEach(key => {
        if (typeof baseStats[key] === 'number') {
          if (key.includes('Rate') || key.includes('Resist') || key.includes('Boost') || key.includes('Reduce')) {
            baseStats[key] = Math.min(0.9, baseStats[key] * 1.5) // Tỉ lệ phần trăm thuộc tính hạn chế cao nhất tại 90%
          } else {
            baseStats[key] *= 2
          }
        }
      })
      break
  }
  // Căn cứ loại hình cùng đẳng cấp tạo ra địch nhân tên
  let enemyName = ''
  const normalNames = ['Sói hoang', 'Lợn rừng', 'Rắn độc', 'Gấu đen', 'Mãnh hổ', 'Ác lang', 'Cự mãng', 'Cuồng Sư']
  const eliteNames = ['Xích diễm hổ', 'Huyền băng mãng', 'Tử điện báo', 'Kim cương vượn', 'U Minh sói', 'Bích Thủy Giao', 'Lôi đình ưng', 'Liệt Phong Báo']
  const bossNames = ['Cửu Vĩ Thiên Hồ', 'Vạn năm long mãng', 'Thái Cổ thần hổ', 'Huyền Thiên Băng Phượng', 'U Minh Ma Long', 'Hỗn độn cự thú', 'Viễn cổ Thiên Mãng', 'Bất Tử hỏa phượng']
  switch (type) {
    case CombatType.BOSS:
      enemyName = bossNames[Math.floor(level / 10) % bossNames.length]
      break
    case CombatType.ELITE:
      enemyName = eliteNames[Math.floor(level / 5) % eliteNames.length]
      break
    default:
      enemyName = normalNames[level % normalNames.length]
  }
  return new CombatEntity(
    enemyName,
    level,
    baseStats,
    'Luyện Khí tầng một'
  )
}
export {
  CombatState,
  CombatType,
  CombatStats,
  CombatEntity,
  CombatManager,
  generateEnemy
}
