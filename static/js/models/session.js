import { CountrySelection } from './selection.js';
import { SessionConfigView } from '../ui/sessionConfigView.js';
import { SessionAppView } from '../ui/sessionAppView.js';

// TODO: create client
const supabase = null;

export async function createSession(sessionId) {
    try {
        const response = await fetch("assets/country-info.json");

        if (!response.ok) {
            throw new Error(`Failed to load country data: ${response.status}`);
        }

        const data = await response.json();
        const selection = new CountrySelection(
            data.nations,
            data.committeePresets,
        );

        const main = document.getElementById("mainContent");
        const session = new Session(sessionId, main, selection);
        return session;

    } catch (error) {
        console.error("Failed to initialize session:", error);
        return null;
    }
}

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

    // TODO: temporary state
    try {
        const response = await fetch("assets/country-info.json");

        if (!response.ok) {
            throw new Error(`Failed to load country data: ${response.status}`);
        }

        const data = await response.json();
        const selection = new CountrySelection(
            data.nations,
            data.committeePresets,
        );

        const obj = selection.availableCountries;
        
        for (var i = 0; i < 5; i++) {
            const randomKey = Object.keys(obj)[Math.floor(Math.random() * Object.keys(obj).length)];
            const randomValue = obj[randomKey];
        
            randomValue.votingStatus = "P";
            selection.selectCountry(randomKey);
        }
        
        session.countries = selection;
    }
    catch (error) {
        
    }

    return session;
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
            "config": new SessionConfigView(
                this, {
                    onCreateSession: async () => {
                        await saveSession(this);
                        await this.showStage("session");
                    }
                }
            ),
            "session": new SessionAppView(
                this, {

                }      
            )
        };
    }

    async showStage(name) {
        if (!(name in this.stages)) {
            console.error(`Unknown session stage: ${name}`);
            return;
        }

        const view = this.stages[name];
        const template = document.getElementById(view.templateName);
        if (!template) {
            throw new Error(`Template not found: #${view}`);
        }

        this.stage.replaceChildren(template.content.cloneNode(true));
        await view.render();
    }
}