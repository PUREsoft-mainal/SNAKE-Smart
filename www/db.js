export const GameDB = {
    data: {
        totalPoints: 0,
        coins: 0,
        unlockedLevels: 1,
        selectedSnake: 'realistic', // realistic, line, slither
        selectedBg: 'forest',       // forest, desert, night
        selectedPad: 'classic',     // classic, neon, gold
        ownedItems: ['realistic', 'forest', 'classic']
    },

    init() {
        const saved = localStorage.getItem('SnakeProDB_v1');
        if (saved) {
            this.data = { ...this.data, ...JSON.parse(saved) };
        }
        this.save();
    },

    save() {
        localStorage.setItem('SnakeProDB_v1', JSON.stringify(this.data));
    },

    addPoints(pts) {
        this.data.totalPoints += pts;
        this.save();
    },

    // تحويل النقاط إلى عملات (كل 5 نقاط = 1 عملة)
    convertPointsToCoins() {
        const possibleCoins = Math.floor(this.data.totalPoints / 5);
        if (possibleCoins > 0) {
            this.data.coins += possibleCoins;
            this.data.totalPoints -= possibleCoins * 5;
            this.save();
            return possibleCoins;
        }
        return 0;
    },

    unlockNextLevel(currentLevel) {
        if (currentLevel >= this.data.unlockedLevels) {
            this.data.unlockedLevels = currentLevel + 1;
            this.save();
        }
    },

    buyOrSelectItem(category, itemId, price) {
        if (this.data.ownedItems.includes(itemId)) {
            this.data[category] = itemId;
            this.save();
            return { success: true, msg: 'تم التفعيل!' };
        }
        if (this.data.coins >= price) {
            this.data.coins -= price;
            this.data.ownedItems.push(itemId);
            this.data[category] = itemId;
            this.save();
            return { success: true, msg: 'تم الشراء والتفعيل بنجاح!' };
        }
        return { success: false, msg: 'عملاتك غير كافية!' };
    }
};

