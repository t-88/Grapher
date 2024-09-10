type PinDir = "Left" | "Right" | "Top" | "Bottom";
class Pin {
    dir : PinDir;
    uuid: string = crypto.randomUUID();

    constructor(dir : PinDir) {
        this.dir = dir;
    }
}
export type { PinDir}
export { Pin };