// Phó bản tăng thêm hiệu quả quản lý liệt biểu
const dungeonBuffs = {
  // Tồn trữ trước mắt ứng dụng tăng thêm hiệu quả
  activeBuffs: [],
  // Ứng dụng tăng thêm hiệu quả
  apply (player, option) {
    // Tăng thêm vào sinh động tăng thêm liệt biểu
    this.activeBuffs.push({
      id: option.id,
      name: option.name,
      effect: option.effect
    })
    // Ứng dụng hiệu quả
    if (typeof option.effect === 'function') {
      option.effect(player)
    }
  },
  // Thanh trừ tất cả tăng thêm hiệu quả
  clear (player) {
    // Thiết lập lại khả năng bị sửa đổi thuộc tính
    if (player.baseAttributes) {
      player.baseAttributes.attack = player.baseAttributes.attack || 10
      player.baseAttributes.defense = player.baseAttributes.defense || 5
      player.baseAttributes.speed = player.baseAttributes.speed || 10
      player.baseAttributes.health = player.baseAttributes.health || 100
    }
    if (player.combatAttributes) {
      player.combatAttributes.critRate = player.combatAttributes.critRate || 0.05
      player.combatAttributes.comboRate = player.combatAttributes.comboRate || 0
      player.combatAttributes.counterRate = player.combatAttributes.counterRate || 0
      player.combatAttributes.stunRate = player.combatAttributes.stunRate || 0
      player.combatAttributes.dodgeRate = player.combatAttributes.dodgeRate || 0
      player.combatAttributes.vampireRate = player.combatAttributes.vampireRate || 0
    }
    if (player.specialAttributes) {
      player.specialAttributes.healBoost = player.specialAttributes.healBoost || 0
      player.specialAttributes.critDamageBoost = player.specialAttributes.critDamageBoost || 0
      player.specialAttributes.critDamageReduce = player.specialAttributes.critDamageReduce || 0
      player.specialAttributes.finalDamageBoost = player.specialAttributes.finalDamageBoost || 0
      player.specialAttributes.finalDamageReduce = player.specialAttributes.finalDamageReduce || 0
      player.specialAttributes.combatBoost = player.specialAttributes.combatBoost || 0
      player.specialAttributes.resistanceBoost = player.specialAttributes.resistanceBoost || 0
    }
    // Thanh không sinh động tăng thêm liệt biểu
    this.activeBuffs = []
  },
  // Thu hoạch trước mắt sinh động tăng thêm hiệu quả
  getActiveBuffs () {
    return this.activeBuffs
  }
}

export default dungeonBuffs
