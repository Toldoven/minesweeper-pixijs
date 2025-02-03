type MinesweeperDifficulty = "beginner" | "intermediate" | "expert" | "custom";

export type BoardSettings = {
    readonly width: number,
    readonly height: number,
    readonly bombs: number,
}

const BEGINNER_SETTINGS: BoardSettings = {
    width: 9,
    height: 9,
    bombs: 10,
}

const INTERMEDIATE_SETTINGS: BoardSettings = {
    width: 16,
    height: 16,
    bombs: 40,
}

const EXPERT_SETTINGS: BoardSettings = {
    width: 30,
    height: 16,
    bombs: 99,
}

function getUrlParamsDifficulty(): MinesweeperDifficulty {

    const urlParams = new URLSearchParams(window.location.search);

    const param = urlParams.get("difficulty");

    switch (param) {
        case null:
            return "beginner";
        case "beginner":
        case "intermediate":
        case "expert":
        case "custom":
            return param;
        default:
            console.warn(`Unknown difficulty: ${param}`)
            return "beginner";
    }
}

export function getUrlParamsBoardSettings(): BoardSettings {

    const difficulty = getUrlParamsDifficulty();

    switch (difficulty) {
        case "beginner":
            return BEGINNER_SETTINGS;
        case "intermediate":
            return INTERMEDIATE_SETTINGS; 
        case "expert":
            return EXPERT_SETTINGS;
        case "custom": {

            const boardSettings = getUrlParamsCustomBoardSettings();

            if (boardSettings === null) {
                console.warn("Falling back to default difficulty.");
                return BEGINNER_SETTINGS;
            }

            return boardSettings;
        }
    }
}

// TODO: Can replace this with Zod. Though, probably shouldn't.
function getUrlParamsCustomBoardSettings(): BoardSettings | null {

    const urlParams = new URLSearchParams(window.location.search);

    const widthParam = urlParams.get("width");
    const heightParam = urlParams.get("height");
    const bombsParam = urlParams.get("bombs");

    if (widthParam === null || heightParam === null || bombsParam === null) {
        console.error("Custom difficulty is selected, but 'width', 'height' or 'bombs' is not in the URL params.");
        return null;
    }

    const width = parseInt(widthParam);
    const height = parseInt(heightParam);
    const bombs = parseInt(bombsParam);

    if (isNaN(width) || isNaN(height) || isNaN(bombs)) {
        console.error("Invalid custom settings: 'width', 'height', or 'bombs' is NaN.");
        return null;
    }

    if (bombs < 1) {
        console.error("There should be at least one bomb.");
        return null;
    }

    if (bombs >= width * height) {
        console.error("There can't be more bombs than tiles.");
        return null;
    }

    if (height < 1 || width < 8) {
        console.error("The board should be at least 8 tiles wide and 1 tile high.")
        return null;
    }

    return { width, height, bombs };
}
