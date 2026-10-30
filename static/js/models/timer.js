export class CountdownTimer {
    constructor(durationSeconds, onTick = () => {}, onComplete = () => {}) {
        this.status = "idle";
        this.duration = durationSeconds;
        this.remaining = durationSeconds;

        this.interval = null;
        this.onTick = onTick;
        this.onComplete = onComplete;
    }

    start() {
        if (this.interval !== null || this.remaining <= 0) return;

        this.status = "running";
        this.onTick(this.remaining);

        this.interval = setInterval(() => {
            this.remaining--;
            this.onTick(this.remaining);

            if (this.remaining <= 0) {
                this.remaining = 0;
                this.pause();
                this.status = "finished";
                this.onComplete();
            }
        }, 1000);
    }

    pause() {
        clearInterval(this.interval);
        this.interval = null;

        if (this.status === "running") {
            this.status = "paused";
        }
    }

    reset(durationSeconds = this.duration) {
        this.pause();
        this.duration = durationSeconds;
        this.remaining = durationSeconds;
        this.status = "idle";
        this.onTick(this.remaining);
    }

    addTime(seconds) {
        this.remaining += seconds;
        this.onTick(this.remaining);
    }

    format() {
        const minutes = Math.floor(this.remaining / 60);
        const seconds = this.remaining % 60;

        return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }
}
