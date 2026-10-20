
export class Timer {
    constructor(capacity, stepms, onTick, onFinish) {
        this.active = false;
        this.stepms = stepms;

        this.current = capacity;
        this.capacity = capacity;

        this.onTick = onTick;
        this.onFinish = onFinish;

        this.timeoutId = null;
    }

    render(obj) {
        const symbol = this.active ? "[Run]" : "[Stop]";
        obj.textContent =
          `${symbol} ${this.formatCurrentTime()} / ${this.formatCapacityTime()}`;
    }

    start() {
        if (this.active) return;

        this.active = true;
        this.onTick();
        this.scheduleTick();
    }

    stop() {
        this.active = false;
        clearTimeout(this.timeoutId);
        this.timeoutId = null;
    }

    restart() {
        this.stop();
        this.current = this.capacity;
        this.onTick();
    }

    scheduleTick() {
        if (!this.active) return;

        this.timeoutId = setTimeout(() => {
            this.tick();
        }, this.stepms);
    }

    tick() {
        if (!this.active) return;

        this.current = Math.max(0, this.current - 1);
        this.onTick();

        if (this.current === 0) {
            this.stop();
            this.onFinish();
            return;
        }

        this.scheduleTick();
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
}


export class CaucusTimer {
    constructor(capacity, onTick, onFinish) {
        this.capacity = capacity;
        this.current = capacity;
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.finished = false;
    }

    tick() {
        if (this.finished || this.current <= 0) return;

        this.current--;

        this.onTick();

        if (this.current === 0) {
            this.finished = true;
            this.onFinish();
        }
    }

    restart() {
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
}
