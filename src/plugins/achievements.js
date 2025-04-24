const equipmentTypes = {
  weapon: 'Vũ khí',
  head: 'Đầu',
  body: 'Quần áo',
  legs: 'Quần',
  feet: 'Giày',
  shoulder: 'Giáp vai',
  hands: 'Găng tay',
  wrist: 'Hộ oản',
  necklace: 'Dây chuyền',
  ring1: 'Chiếc nhẫn 1',
  ring2: 'Chiếc nhẫn 2',
  belt: 'Đai lưng',
  artifact: 'Pháp bảo'
}

// Thành tựu hệ thống phối trí
export const achievements = {
  // Trang bị thành tựu
  equipment: [
    {
      id: 'equipment_1', name: 'Sơ lấy được trang bị', description: 'Thu hoạch được kiện thứ nhất trang bị', condition: (player) => {
        const equippedCount = Object.values(player.equippedArtifacts).filter(e => e !== null).length;
        const inventoryCount = player.equipment?.length || 0;
        return (equippedCount + inventoryCount) >= 1;
      }, reward: { spirit: 200 }
    },
    {
      id: 'equipment_2', name: 'Trang bị cất giữ', description: 'Có được 10 Trang bị', condition: (player) => {
        const equippedCount = Object.values(player.equippedArtifacts).filter(e => e !== null).length;
        const inventoryCount = player.equipment?.length || 0;
        return (equippedCount + inventoryCount) >= 10;
      }, reward: { spirit: 1000 }
    },
    {
      id: 'equipment_3', name: 'Trang bị đại sư', description: 'Có một kiện cực phẩm phẩm chất trang bị', condition: (player) => {
        const equippedLegendary = Object.values(player.equippedArtifacts).some(e => e?.quality === 'legendary');
        const inventoryLegendary = player.equipment?.some(e => e.quality === 'legendary');
        return equippedLegendary || inventoryLegendary;
      }, reward: { spirit: 3000, damage: 1.2 }
    },
    {
      id: 'equipment_4', name: 'Luyện Khí Tông Sư', description: 'Cường hóa tùy ý trang bị đến+10', condition: (player) => {
        const equippedEnhanced = Object.values(player.equippedArtifacts).some(e => e?.enhanceLevel >= 10);
        const inventoryEnhanced = player.equipment?.some(e => e.enhanceLevel >= 10);
        return equippedEnhanced || inventoryEnhanced;
      }, reward: { spirit: 5000, damage: 1.5 }
    },
    {
      id: 'equipment_5', name: 'Trang bị chi vương', description: 'Có được một bộ hoàn chỉnh cực phẩm trang bị', condition: (player) => {
        const allEquipment = [...Object.values(player.equippedArtifacts).filter(e => e !== null), ...(player.equipment || [])];
        const legendaryTypes = new Set(allEquipment.filter(e => e.quality === 'legendary').map(e => e.type));
        return legendaryTypes.size >= 4;
      }, reward: { spirit: 10000, damage: 2, defense: 2 }
    },
    {
      id: 'equipment_6', name: 'Luyện khí tân tú', description: 'Lần đầu cường hóa trang bị', condition: (player) => {
        const equippedEnhanced = Object.values(player.equippedArtifacts).some(e => e?.enhanceLevel > 0);
        const inventoryEnhanced = player.equipment?.some(e => e.enhanceLevel > 0);
        return equippedEnhanced || inventoryEnhanced;
      }, reward: { spirit: 500 }
    },
    {
      id: 'equipment_7', name: 'Trang bị giám thưởng nhà', description: 'Có được 20 Kiện khác biệt bộ vị trang bị', condition: (player) => {
        const allEquipment = [...Object.values(player.equippedArtifacts).filter(e => e !== null), ...(player.equipment || [])];
        return new Set(allEquipment.map(e => e.type)).size >= 10;
      }, reward: { spirit: 2000 }
    },
    {
      id: 'equipment_8', name: 'Thần trang thu thập người', description: 'Có được 5 Kiện Tiên phẩm trang bị', condition: (player) => {
        const equippedMythic = Object.values(player.equippedArtifacts).filter(e => e?.quality === 'mythic').length;
        const inventoryMythic = (player.equipment || []).filter(e => e.quality === 'mythic').length;
        return (equippedMythic + inventoryMythic) >= 5;
      }, reward: { spirit: 10000, damage: 1.5 }
    },
    {
      id: 'equipment_9', name: 'Cường hóa đại sư', description: 'Đem một kiện trang bị cường hóa đến+15', condition: (player) => {
        const equippedEnhanced = Object.values(player.equippedArtifacts).some(e => e?.enhanceLevel >= 15);
        const inventoryEnhanced = player.equipment?.some(e => e.enhanceLevel >= 15);
        return equippedEnhanced || inventoryEnhanced;
      }, reward: { spirit: 20000, damage: 2 }
    },
    {
      id: 'equipment_10', name: 'Toàn năng trang bị sư', description: 'Có được mỗi bộ vị một kiện Tiên phẩm trang bị', condition: (player) => {
        const allEquipment = [...Object.values(player.equippedArtifacts).filter(e => e !== null), ...(player.equipment || [])];
        const mythicTypes = new Set(allEquipment.filter(e => e.quality === 'mythic').map(e => e.type));
        return mythicTypes.size >= Object.keys(equipmentTypes).length;
      }, reward: { spirit: 50000, damage: 3, defense: 3 }
    }
  ],

  // Bí cảnh thăm dò thành tựu
  dungeon_explore: [
    { id: 'dungeon_1', name: 'Sơ bộ bí cảnh', description: 'Lần đầu tiến vào bí cảnh', condition: (player) => player.dungeonTotalRuns >= 1, reward: { spirit: 200, damage: 1 } },
    { id: 'dungeon_2', name: 'Bí cảnh người mở đường', description: 'Thông qua thứ 5 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 5, reward: { spirit: 500, damage: 1.1 } },
    { id: 'dungeon_3', name: 'Bí cảnh nhà thám hiểm', description: 'Thông qua thứ 10 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 10, reward: { spirit: 1000, damage: 1.2 } },
    { id: 'dungeon_4', name: 'Bí cảnh nhà thám hiểm', description: 'Thông qua thứ 20 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 20, reward: { spirit: 2000, damage: 1.3 } },
    { id: 'dungeon_5', name: 'Bí cảnh thợ săn', description: 'Thông qua thứ 30 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 30, reward: { spirit: 5000, damage: 1.4 } },
    { id: 'dungeon_6', name: 'Bí cảnh chinh phục giả', description: 'Thông qua thứ 50 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 50, reward: { spirit: 5000, damage: 1.5 } },
    { id: 'dungeon_7', name: 'Bí cảnh chinh phục giả', description: 'Thông qua thứ 75 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 75, reward: { spirit: 15000, damage: 1.6 } },
    { id: 'dungeon_8', name: 'Bí cảnh vương giả', description: 'Thông qua thứ 100 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 100, reward: { spirit: 20000, damage: 1.7 } },
    { id: 'dungeon_9', name: 'Bí cảnh truyền kỳ', description: 'Thông qua thứ 150 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 150, reward: { spirit: 30000, damage: 1.8 } },
    { id: 'dungeon_10', name: 'Bí cảnh chi chủ', description: 'Thông qua thứ 200 Tầng bí cảnh', condition: (player) => player.dungeonHighestFloor >= 200, reward: { spirit: 50000, damage: 2 } }
  ],

  // Bí cảnh chiến đấu thành tựu
  dungeon_combat: [
    { id: 'dungeon_combat_1', name: 'Trận chiến mở màn báo cáo thắng lợi', description: 'Đánh giết 10 Cái phổ thông địch nhân', condition: (player) => player.dungeonTotalKills >= 10, reward: { spirit: 500, defense: 1 } },
    { id: 'dungeon_combat_2', name: 'Chiến vô bất thắng', description: 'Đánh giết 50 Cái phổ thông địch nhân', condition: (player) => player.dungeonStreakKills >= 50, reward: { spirit: 2000, defense: 1.1 } },
    { id: 'dungeon_combat_3', name: 'Trăm trận trăm thắng', description: 'Đánh giết 100 Cái phổ thông địch nhân', condition: (player) => player.dungeonTotalKills >= 100, reward: { spirit: 2000, defense: 1.2 } },
    { id: 'dungeon_combat_4', name: 'Người thu hoạch', description: 'Đánh giết 500 Cái phổ thông địch nhân', condition: (player) => player.dungeonTotalKills >= 500, reward: { spirit: 3000, defense: 1.3 } },
    { id: 'dungeon_combat_5', name: 'Tinh anh thợ săn', description: 'Đánh giết 50 Cái tinh anh địch nhân', condition: (player) => player.dungeonEliteKills >= 50, reward: { spirit: 5000, defense: 1 } },
    { id: 'dungeon_combat_6', name: 'BOSSKẻ huỷ diệt', description: 'Đánh giết 10 CáiBOSS', condition: (player) => player.dungeonBossKills >= 10, reward: { spirit: 10000, defense: 1.5 } },
    { id: 'dungeon_combat_7', name: 'BOSSThợ săn', description: 'Đánh giết 50 CáiBOSS', condition: (player) => player.dungeonBossKills >= 50, reward: { spirit: 10000, defense: 2 } },
    { id: 'dungeon_combat_8', name: 'Bí cảnh kẻ huỷ diệt', description: 'Đánh giết 100 CáiBOSS', condition: (player) => player.dungeonBossKills >= 100, reward: { spirit: 20000, defense: 2.5 } },
    { id: 'dungeon_combat_9', name: 'Vô địch chiến thần', description: 'Tổng đánh giết số đạt tới 1000', condition: (player) => player.dungeonTotalKills >= 1000, reward: { spirit: 30000, defense: 2 } },
    { id: 'dungeon_combat_10', name: 'Vô tận chiến thần', description: 'Tổng đánh giết số đạt tới 10000', condition: (player) => player.dungeonTotalKills >= 10000, reward: { spirit: 50000, defense: 2.5 } },
  ],

  // Tu vi thành tựu
  cultivation: [
    { id: 'cultivation_1', name: 'Mới vào tu tiên', description: 'Bắt đầu đạp lên con đường tu tiên', condition: (player) => player.totalCultivationTime > 0, reward: { spirit: 100 } },
    { id: 'cultivation_2', name: 'Tu luyện nhập môn', description: 'Tính gộp lại thời gian tu luyện đạt tới 30 Phút', condition: (player) => player.totalCultivationTime >= 1800, reward: { spirit: 300 } },
    { id: 'cultivation_3', name: 'Chuyên cần khổ luyện', description: 'Tính gộp lại thời gian tu luyện đạt tới 1 Giờ', condition: (player) => player.totalCultivationTime >= 3600, reward: { spirit: 500 } },
    { id: 'cultivation_4', name: 'Tu luyện có một chút thành tựu', description: 'Tính gộp lại thời gian tu luyện đạt tới 12 Giờ', condition: (player) => player.totalCultivationTime >= 43200, reward: { spirit: 1000 } },
    { id: 'cultivation_5', name: 'Tu luyện cuồng nhân', description: 'Tính gộp lại thời gian tu luyện đạt tới 48 Giờ', condition: (player) => player.totalCultivationTime >= 172800, reward: { spirit: 3000 } },
    { id: 'cultivation_6', name: 'Tu luyện thành si', description: 'Tính gộp lại thời gian tu luyện đạt tới 24 Giờ', condition: (player) => player.totalCultivationTime >= 86400, reward: { spirit: 2000 } },
    { id: 'cultivation_7', name: 'Đạo tâm vững chắc', description: 'Tính gộp lại thời gian tu luyện đạt tới 7 Trời', condition: (player) => player.totalCultivationTime >= 604800, reward: { spirit: 5000, spiritRate: 1.1 } },
    { id: 'cultivation_8', name: 'Tu luyện đại thành', description: 'Tính gộp lại thời gian tu luyện đạt tới 15 Trời', condition: (player) => player.totalCultivationTime >= 1296000, reward: { spirit: 10000, spiritRate: 1.2 } },
    { id: 'cultivation_9', name: 'Tu tiên trăm năm', description: 'Tính gộp lại thời gian tu luyện đạt tới 30 Trời', condition: (player) => player.totalCultivationTime >= 2592000, reward: { spirit: 10000, spiritRate: 1.3 } },
    { id: 'cultivation_10', name: 'Tu luyện chí tôn', description: 'Tính gộp lại thời gian tu luyện đạt tới 100 Trời', condition: (player) => player.totalCultivationTime >= 8640000, reward: { spirit: 50000, spiritRate: 2 } }
  ],

  // Đột phá thành tựu
  breakthrough: [
    { id: 'breakthrough_1', name: 'Sơ khuy môn kính', description: 'Lần đầu đột phá', condition: (player) => player.breakthroughCount >= 1, reward: { spirit: 200 } },
    { id: 'breakthrough_2', name: 'Đột phá tân tú', description: 'Lần đầu đột phá thành công', condition: (player) => player.breakthroughCount >= 5, reward: { spirit: 500 } },
    { id: 'breakthrough_3', name: 'Tu luyện có thành tựu', description: 'Đột phá số lần đạt tới 10 Lần', condition: (player) => player.breakthroughCount >= 10, reward: { spirit: 1000 } },
    { id: 'breakthrough_4', name: 'Đạo pháp tự nhiên', description: 'Đột phá số lần đạt tới 50 Lần', condition: (player) => player.breakthroughCount >= 50, reward: { spirit: 5000 } },
    { id: 'breakthrough_5', name: 'Đăng phong tạo cực', description: 'Đột phá số lần đạt tới 100 Lần', condition: (player) => player.breakthroughCount >= 100, reward: { spirit: 10000, spiritRate: 1.2 } },
    { id: 'breakthrough_6', name: 'Vấn đỉnh đỉnh phong', description: 'Đạt tới Hóa Thần cảnh giới', condition: (player) => player.level >= 37, reward: { spirit: 50000, spiritRate: 1 } },
    { id: 'breakthrough_7', name: 'Đột phá đạt nhân', description: 'Đạt tới Phản Hư cảnh giới', condition: (player) => player.level >= 46, reward: { spirit: 100000, spiritRate: 1.2 } },
    { id: 'breakthrough_8', name: 'Đột phá tông sư', description: 'Đạt tới cảnh giới Đại Thừa', condition: (player) => player.level >= 64, reward: { spirit: 200000, spiritRate: 1.5 } },
    { id: 'breakthrough_9', name: 'Đột phá tới tôn', description: 'Đạt tới Tiên Nhân cảnh giới', condition: (player) => player.level >= 82, reward: { spirit: 300000, spiritRate: 1.7 } },
    { id: 'breakthrough_10', name: 'Đột phá chi thần', description: 'Đạt tới Đại La cảnh giới', condition: (player) => player.level >= 126, reward: { spirit: 500000, spiritRate: 2 } }
  ],

  // Thăm dò thành tựu
  exploration: [
    { id: 'exploration_1', name: 'Sơ bộ thế giới', description: 'Lần đầu tiến hành thăm dò', condition: (player) => player.explorationCount >= 1, reward: { spirit: 100 } },
    { id: 'exploration_2', name: 'Thăm dò tân tú', description: 'Thăm dò số lần đạt tới 10 Lần', condition: (player) => player.explorationCount >= 10, reward: { spirit: 300 } },
    { id: 'exploration_3', name: 'Thăm dò đạt nhân', description: 'Thăm dò số lần đạt tới 50 Lần', condition: (player) => player.explorationCount >= 50, reward: { spirit: 1000 } },
    { id: 'exploration_4', name: 'Bốn phía du lịch', description: 'Thăm dò số lần đạt tới 100 Lần', condition: (player) => player.explorationCount >= 100, reward: { spirit: 1000 } },
    { id: 'exploration_5', name: 'Thăm dò đại sư', description: 'Thăm dò số lần đạt tới 200 Lần', condition: (player) => player.explorationCount >= 200, reward: { spirit: 5000 } },
    { id: 'exploration_6', name: 'Thăm dò truyền kỳ', description: 'Thăm dò số lần đạt tới 500 Lần', condition: (player) => player.explorationCount >= 500, reward: { spirit: 15000 } },
    { id: 'exploration_7', name: 'Du lịch thiên hạ', description: 'Thăm dò số lần đạt tới 1000 Lần', condition: (player) => player.explorationCount >= 1000, reward: { spirit: 5000 } },
    { id: 'exploration_8', name: 'Tầm bảo đạt nhân', description: 'Thu hoạch được 100 Kiện vật phẩm', condition: (player) => player.itemsFound >= 100, reward: { spirit: 2000 } },
    { id: 'exploration_9', name: 'Cơ duyên thâm hậu', description: 'Phát động 100 Lần ngẫu nhiên sự kiện', condition: (player) => player.eventTriggered >= 100, reward: { spirit: 3000, luck: 1.1 } },
    { id: 'exploration_10', name: 'Thăm dò chi thần', description: 'Phát động 500 Lần ngẫu nhiên sự kiện', condition: (player) => player.eventTriggered >= 500, reward: { spirit: 30000, luck: 1.5 } }

  ],

  // Thu thập thành tựu
  collection: [
    { id: 'collection_1', name: 'Mới quen linh thảo', description: 'Thu thập thủ gốc linh thảo', condition: (player) => player.herbs.length >= 1, reward: { spirit: 100 } },
    { id: 'collection_2', name: 'Linh thảo học đồ', description: 'Thu thập 5 Loại khác biệt linh thảo', condition: (player) => new Set(player.herbs.map(h => h.id)).size >= 5, reward: { spirit: 500 } },
    { id: 'collection_3', name: 'Linh thảo người thu thập', description: 'Thu thập 10 Loại khác biệt linh thảo', condition: (player) => new Set(player.herbs.map(h => h.id)).size >= 10, reward: { spirit: 1000 } },
    { id: 'collection_4', name: 'Linh thảo thợ săn', description: 'Thu thập 50 Gốc linh thảo', condition: (player) => player.herbs.length >= 50, reward: { spirit: 2000, herbRate: 1 } },
    { id: 'collection_5', name: 'Linh thảo vườn chủ', description: 'Có được 100 Gốc linh thảo', condition: (player) => player.herbs.length >= 100, reward: { spirit: 5000, herbRate: 1.5 } },
    { id: 'collection_6', name: 'Linh thảo chi đỉnh', description: 'Thu thập 200 Gốc linh thảo', condition: (player) => player.herbs.length >= 200, reward: { spirit: 30000, herbRate: 2 } },
    { id: 'collection_7', name: 'Tiên phẩm cất giữ', description: 'Thu thập 100 Cái hi hữu linh thảo', condition: (player) => player.herbs.filter(h => h.quality === 'rare').length >= 100, reward: { spirit: 2000, herbRate: 1 } },
    { id: 'collection_8', name: 'Linh thảo đại sư', description: 'Thu thập 100 Gốc linh thạch linh thảo', condition: (player) => player.herbs.filter(h => h.quality === 'epic').length >= 100, reward: { spirit: 5000, herbRate: 1.3 } },
    { id: 'collection_9', name: 'Tiên thảo thu thập người', description: 'Thu thập 100 Gốc Tiên phẩm linh thảo', condition: (player) => player.herbs.filter(h => h.quality === 'mythic').length >= 100, reward: { spirit: 10000, herbRate: 1.5 } },
    { id: 'collection_10', name: 'Linh thảo đại sư', description: 'Thu thập tất cả chủng loại linh thảo', condition: (player) => new Set(player.herbs.map(h => h.id)).size >= 15, reward: { spirit: 3000, herbRate: 1.2 } },
  ],

  // Tài nguyên thành tựu
  resources: [
    { id: 'resources_1', name: 'Sơ lấy được linh thạch', description: 'Thu hoạch được thủ mai linh thạch', condition: (player) => player.spiritStones >= 1, reward: { spirit: 100 } },
    { id: 'resources_2', name: 'Có chút tích súc', description: 'Linh thạch số lượng đạt tới 1000', condition: (player) => player.spiritStones >= 1000, reward: { spirit: 1000 } },
    { id: 'resources_3', name: 'Linh thạch người mới', description: 'Linh thạch số lượng đạt tới 5000', condition: (player) => player.spiritStones >= 5000, reward: { spirit: 2000 } },
    { id: 'resources_4', name: 'Phú giáp một phương', description: 'Linh thạch số lượng đạt tới 10000', condition: (player) => player.spiritStones >= 10000, reward: { spirit: 5000 } },
    { id: 'resources_5', name: 'Linh thạch đạt nhân', description: 'Linh thạch số lượng đạt tới 50000', condition: (player) => player.spiritStones >= 50000, reward: { spirit: 10000 } },
    { id: 'resources_6', name: 'Phú khả địch quốc', description: 'Linh thạch số lượng đạt tới 100000', condition: (player) => player.spiritStones >= 100000, reward: { spirit: 20000, spiritRate: 1.3 } },
    { id: 'resources_7', name: 'Linh thạch đại sư', description: 'Linh thạch số lượng đạt tới 500000', condition: (player) => player.spiritStones >= 500000, reward: { spirit: 10000, spiritRate: 1.5 } },
    { id: 'resources_8', name: 'Có được Linh Sơn', description: 'Linh thạch số lượng đạt tới 1000000', condition: (player) => player.spiritStones >= 1000000, reward: { spirit: 100000, spiritRate: 2 } },
    { id: 'resources_9', name: 'Linh thạch truyền kỳ', description: 'Linh thạch số lượng đạt tới 5000000', condition: (player) => player.spiritStones >= 5000000, reward: { spirit: 30000, spiritRate: 2.3 } },
    { id: 'resources_10', name: 'Linh thạch chi thần', description: 'Linh thạch số lượng đạt tới 10000000', condition: (player) => player.spiritStones >= 10000000, reward: { spirit: 100000, spiritRate: 2.5 } }
  ],

  // Luyện đan thành tựu
  alchemy: [
    { id: 'alchemy_1', name: 'Mới quen đan đạo', description: 'Lần đầu luyện chế thành công đan dược', condition: (player) => player.pillsCrafted >= 1, reward: { spirit: 200 } },
    { id: 'alchemy_2', name: 'Luyện đan học đồ', description: 'Luyện chế thành công 5 Viên thuốc', condition: (player) => player.pillsCrafted >= 5, reward: { spirit: 500 } },
    { id: 'alchemy_3', name: 'Đan đạo tiểu thành', description: 'Luyện chế thành công 10 Viên thuốc', condition: (player) => player.pillsCrafted >= 10, reward: { spirit: 1000 } },
    { id: 'alchemy_4', name: 'Luyện đan đạt nhân', description: 'Luyện chế thành công 50 Viên thuốc', condition: (player) => player.pillsCrafted >= 50, reward: { spirit: 2000 } },
    { id: 'alchemy_5', name: 'Đan đạo tinh thông', description: 'Luyện chế thành công 100 Viên thuốc', condition: (player) => player.pillsCrafted >= 100, reward: { spirit: 5000, alchemyRate: 1.2 } },
    { id: 'alchemy_6', name: 'Luyện đan đại sư', description: 'Luyện chế thành công 500 Viên thuốc', condition: (player) => player.pillsCrafted >= 500, reward: { spirit: 10000, alchemyRate: 1.3 } },
    { id: 'alchemy_7', name: 'Đan đạo tông sư', description: 'Luyện chế 1000 Viên thuốc', condition: (player) => player.pillsCrafted >= 1000, reward: { spirit: 50000, alchemyRate: 2 } },
    { id: 'alchemy_8', name: 'Đan đạo chi thần', description: 'Luyện chế 10000 Viên thuốc', condition: (player) => player.pillsCrafted >= 10000, reward: { spirit: 50000, alchemyRate: 2.5 } },
    { id: 'alchemy_9', name: 'Đan đạo đại sư', description: 'Thu hoạch được tất cả đan phương', condition: (player) => player.unlockedPillRecipes >= 8, reward: { spirit: 10000, alchemyRate: 1.5 } },
    { id: 'alchemy_10', name: 'Tiên đan luyện sư', description: 'Luyện chế 100 Khỏa Tiên phẩm đan dược', condition: (player) => player.highQualityPillsCrafted >= 100, reward: { spirit: 30000, alchemyRate: 1.5 } }
  ]
}

// Kiểm tra thành tựu hoàn thành tình huống đồng phát thả ban thưởng
export const checkAchievements = (player) => {
  const completedAchievements = []

  // Lượt lịch tất cả thành tựu thuộc loại
  Object.values(achievements).forEach(category => {
    category.forEach(achievement => {
      // Kiểm tra thành tựu phải chăng đã hoàn thành lại chưa ghi chép
      if (achievement.condition(player) &&
        !player.completedAchievements?.includes(achievement.id)) {
        completedAchievements.push(achievement)
        // Tăng thêm vào đã hoàn thành thành tựu liệt biểu
        if (!player.completedAchievements) {
          player.completedAchievements = []
        }
        player.completedAchievements.push(achievement.id)
        // Cấp cho thành tựu ban thưởng
        if (achievement.reward) {
          if (achievement.reward.spirit) {
            player.spirit += achievement.reward.spirit
          }
          if (achievement.reward.spiritRate) {
            player.spiritRate *= achievement.reward.spiritRate
          }
          if (achievement.reward.herbRate) {
            player.herbRate = (player.herbRate || 1) * achievement.reward.herbRate
          }
          if (achievement.reward.alchemyRate) {
            player.alchemyRate = (player.alchemyRate || 1) * achievement.reward.alchemyRate
          }
          if (achievement.reward.luck) {
            player.luck = (player.luck || 1) * achievement.reward.luck
          }
        }
        // Bảo tồn người chơi số liệu
        player.saveData()
      }
    })
  })

  return completedAchievements
}

// Tính toán thành tựu tiến độ
export const getAchievementProgress = (player, achievement) => {
  try {
    // Nếu như đã hoàn thành, trở về 100%
    if (player.completedAchievements?.includes(achievement.id)) {
      return 100
    }
    // Căn cứ loại hình khác nhau thành tựu tính toán tiến độ
    if (achievement.id.startsWith('dungeon_1')) {
      return Math.min(100, ((player.dungeonTotalRuns || 0) / 1) * 100)
    } else if (achievement.id.startsWith('dungeon_')) {
      const matches = achievement.description.match(/\d+/)
      const targetFloor = matches ? parseInt(matches[0]) : 100
      return Math.min(100, ((player.dungeonHighestFloor || 0) / targetFloor) * 100)
    } else if (achievement.id.startsWith('dungeon_combat_')) {
      if (achievement.id === 'dungeon_combat_3') {
        return Math.min(100, ((player.dungeonEliteKills || 0) / 50) * 100)
      } else if (achievement.id === 'dungeon_combat_4') {
        return Math.min(100, ((player.dungeonBossKills || 0) / 10) * 100)
      } else {
        const matches = achievement.description.match(/\d+/)
        const targetKills = matches ? parseInt(matches[0]) : 100
        return Math.min(100, ((player.dungeonTotalKills || 0) / targetKills) * 100)
      }
    } else if (achievement.id.startsWith('cultivation_')) {
      const matches = achievement.condition.toString().match(/(\d+)/)
      const targetTime = matches ? parseInt(matches[0]) : 3600
      return Math.min(100, ((player.totalCultivationTime || 0) / targetTime) * 100)
    } else if (achievement.id.startsWith('breakthrough_')) {
      if (achievement.id === 'breakthrough_5') {
        return Math.min(100, ((player.level || 0) / 37) * 100)
      } else {
        const matches = achievement.description.match(/\d+/)
        const targetCount = matches ? parseInt(matches[0]) : 10
        return Math.min(100, ((player.breakthroughCount || 0) / targetCount) * 100)
      }
    } else if (achievement.id.startsWith('exploration_')) {
      if (achievement.id === 'exploration_4') {
        return Math.min(100, ((player.itemsFound || 0) / 100) * 100)
      } else if (achievement.id === 'exploration_5') {
        return Math.min(100, ((player.eventTriggered || 0) / 100) * 100)
      } else {
        const matches = achievement.description.match(/\d+/)
        const targetCount = matches ? parseInt(matches[0]) : 100
        return Math.min(100, ((player.explorationCount || 0) / targetCount) * 100)
      }
    } else if (achievement.id.startsWith('collection_')) {
      if (achievement.id === 'collection_1') {
        return (player.herbs || []).length >= 1 ? 100 : 0
      } else if (achievement.id === 'collection_2' || achievement.id === 'collection_3') {
        const matches = achievement.description.match(/\d+/)
        const targetTypes = matches ? parseInt(matches[0]) : 10
        const uniqueHerbs = new Set((player.herbs || []).map(h => h.id)).size
        return Math.min(100, (uniqueHerbs / targetTypes) * 100)
      } else if (achievement.id === 'collection_4') {
        return (player.herbs || []).some(h => h.quality === 'legendary') ? 100 : 0
      } else {
        return Math.min(100, ((player.herbs || []).length / 100) * 100)
      }
    } else if (achievement.id.startsWith('resources_')) {
      const matches = achievement.description.match(/\d+/)
      const targetStones = matches ? parseInt(matches[0]) : 1000
      return Math.min(100, ((player.spiritStones || 0) / targetStones) * 100)
    } else if (achievement.id.startsWith('alchemy_')) {
      if (achievement.id === 'alchemy_4') {
        return Math.min(100, ((player.unlockedPillRecipes || 0) / 8) * 100)
      } else {
        const matches = achievement.description.match(/\d+/)
        const targetPills = matches ? parseInt(matches[0]) : 100
        return Math.min(100, ((player.pillsCrafted || 0) / targetPills) * 100)
      }
    }
    return 0
  } catch (error) {
    console.error('Thành tựu tiến độ báo sai:', error)
    return 0
  }
}
