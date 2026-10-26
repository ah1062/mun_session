export class Timer {
    constructor(capacity, {
        onTick = () => {},
        onFinish = () => {},
        stepms = 1000,
    } = {}) {
        this.capacity = capacity;
        this.current = capacity;
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.stepms = stepms;

        this.active = false;
        this.finished = false;
        this.timeoutId = null;
    }

    start() {
        if (this.active || this.finished) return;

        this.active = true;
        this.onTick();
        this.scheduleTick();
    }

    stop() {
        this.active = false;
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }

    scheduleTick() {
        if (!this.active) return;

        this.timeoutId = setTimeout(() => {
            this.tick();
        }, this.stepms);
    }

    tick() {
        if (!this.active || this.finished) return;

        this.current = Math.max(0, this.current - 1);
        this.onTick();

        if (this.current === 0) {
            this.active = false;
            this.finished = true;
            this.timeoutId = null;
            this.onFinish();
            return;
        }

        this.scheduleTick();
    }

    restart() {
        this.stop();
        this.current = this.capacity;
        this.finished = false;
        this.onTick();
    }

    formatTime(count) {
        const minutes = Math.floor(count / 60);
        const seconds = (count % 60).toString().padStart(2, "0");

        return `${minutes}:${seconds}`;
    }

    formatCurrentTime() {
        return this.formatTime(this.current);
    }

    formatCapacityTime() {
        return this.formatTime(this.capacity);
    }

    render(element) {
        element.textContent =
            `${this.formatCurrentTime()} / ${this.formatCapacityTime()}`;
    }
}