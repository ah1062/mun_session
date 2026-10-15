// TODO: create client
const supabase = null;

export async function saveSession(session) {
        if (!supabase) {
            console.log("Can't save, no supabase client")
            return;
        }

        const { data, error } = await supabase
            .from("sessions")
            .upsert({
                sessionId: this.sessionId,
                name: this.name,
                committeeShortName: this.committeeShortName,
                committeeLongName: this.committeeLongName,
                selectedCountries: this.selectedCountries,
            }, { onConflict: 'sessionId' }
            )
            .select()
            .single();

        if (error) {
            console.error("Failed to insert session:", error.message);
            throw error;
        }

        return data;
    }

export async function loadSession(session) {
    console.log(`TODO: load session ${session.sessionId}`);
}

export class Session {
    constructor(sessionId, stage, countrySelection) {
        this.id = sessionId;
        this.name = "United Nations General Assembly";
        this.committeeShortName = "GA";
        this.committeeLongName = "General Assembly";

        this.countries = countrySelection;

        this.stage = stage;
        this.stages = {
            "config": "sessionConfigTemplate",
            "session": "sessionAppTemplate"
        };
    }

    async showStage(name) {
        if (!name in this.stages) {
            console.error();
            return;
        }

        const templateName = this.stages[name];
        const templateElement = document.getElementById(templateName);
        if (!templateElement) console.error(`Could not find stage template element ${templateName}`);

        const template = templateElement.content.cloneNode(true);
        this.stage.replaceChildren(template);
    }
}