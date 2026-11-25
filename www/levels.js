export const Levels = [
    {
        id: 1,
        name: "المرحلة 1: البداية",
        targetScore: 30,
        getWalls: (cols, rows) => {
            const walls = [];
            const midY = Math.floor(rows / 2);
            for (let x = 4; x < cols - 4; x++) {
                if (Math.abs(x - Math.floor(cols / 2)) > 2) {
                    walls.push({ x, y: midY });
                }
            }
            return walls;
        }
    },
    {
        id: 2,
        name: "المرحلة 2: الصليب",
        targetScore: 60,
        getWalls: (cols, rows) => {
            const walls = [];
            const midX = Math.floor(cols / 2);
            const midY = Math.floor(rows / 2);
            for (let x = 3; x < cols - 3; x++) {
                if (Math.abs(x - midX) > 2) walls.push({ x, y: midY });
            }
            for (let y = 3; y < rows - 3; y++) {
                if (Math.abs(y - midY) > 2) walls.push({ x: midX, y });
            }
            return walls;
        }
    },
    {
        id: 3,
        name: "المرحلة 3: الغرف المغلقة",
        targetScore: 100,
        getWalls: (cols, rows) => {
            const walls = [];
            for (let x = 3; x < cols - 3; x++) {
                if (x % 4 !== 0) {
                    walls.push({ x, y: 5 });
                    walls.push({ x, y: rows - 6 });
                }
            }
            return walls;
        }
    },
    {
        id: 4,
        name: "المرحلة 4: المتاهة الكبرى",
        targetScore: 150,
        getWalls: (cols, rows) => {
            const walls = [];
            for (let y = 4; y < rows - 4; y += 4) {
                for (let x = 2; x < cols - 2; x++) {
                    if ((y / 4) % 2 === 0 && x < cols - 5) walls.push({ x, y });
                    if ((y / 4) % 2 !== 0 && x > 4) walls.push({ x, y });
                }
            }
            return walls;
        }
    }
];

