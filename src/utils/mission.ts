import type { IMission } from "@/interface/mission";

export function sortMissions(missions: IMission[]): IMission[] {
    return missions.sort((a, b) => {
        if (a.status === "COMPLETED" && b.status !== "COMPLETED") {
            return 1;
        } else if (a.status !== "COMPLETED" && b.status === "COMPLETED") {
            return -1;
        } else if (a.status === "PROCESSING" && b.status !== "PROCESSING") {
            return 1;
        } else if (a.status !== "PROCESSING" && b.status === "PROCESSING") {
            return -1;
        } else {
            return 0;
        }
    });
}
