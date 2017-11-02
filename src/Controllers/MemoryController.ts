export const Run = () => {
    SetMineralMemory();
};

const SetMineralMemory = () => {
    if (!Memory.Minerals) {
        const minerals = {
            Inert: [
                RESOURCE_HYDROGEN,
                RESOURCE_OXYGEN,
                RESOURCE_HYDROXIDE,
                RESOURCE_ZYNTHIUM,
                RESOURCE_KEANIUM,
                RESOURCE_ZYNTHIUM_KEANITE,
                RESOURCE_UTRIUM,
                RESOURCE_LEMERGIUM,
                RESOURCE_UTRIUM_LEMERGITE,
                RESOURCE_GHODIUM
            ],
            Reactions: {},
            Boosts: {}
        };

        for (const reagent1 in REACTIONS) {
            for (const reagent2 in REACTIONS[reagent1]) {
                const product = REACTIONS[reagent1][reagent2];
                if (Object.keys(minerals.Reactions).indexOf(product) !== -1) {
                    continue;
                }
                minerals.Reactions[product] = [reagent1, reagent2];
            }
        }

        for (const part in BOOSTS) {
            for (const resource in BOOSTS[part]) {
                const boost = BOOSTS[part];
                if (Object.keys(minerals.Boosts).indexOf(resource) !== -1) {
                    continue;
                }
                minerals.Boosts[resource] = part;
            }
        }

        Memory.Minerals = minerals;
    }
};
