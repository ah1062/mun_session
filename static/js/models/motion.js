export const MOTION_PRIORITY = {
    "Moderated Caucus": {
        "priority": 1
    },
    "Unmoderated Caucus": {
        "priority": 2
    }
}

var COUNTER = 0;

export class Motion {
    constructor(countryKey, type) {
        this.sequence = COUNTER++;
        this.type = type;
        this.priority = MOTION_PRIORITY[type].priority ?? -1;
        this.submitter = countryKey;
    
        this.topic = null;
        this.duration = null;
        this.individual_duration = null;

        this.status = null; // vote result: true = passed, false = failed
        this.history = false;
    }
}

export class ProceduralMotion extends Motion {
    constructor(countryKey, type) {
        super(countryKey, type)
    }
}

export class DebateMotion extends Motion {
    constructor(
        countryKey, 
        type, 
        topic, 
        duration, 
        individual_duration
    ) {
        super(countryKey, type)

        this.topic = topic;
        this.duration = duration;
        this.individual_duration = individual_duration;
    }
}